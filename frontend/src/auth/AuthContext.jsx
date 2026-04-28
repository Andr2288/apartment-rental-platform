import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiUrl } from "../api/baseUrl.js";

const TOKEN_KEY = "apartment_rent_token";

const AuthContext = createContext(null);

export function getStoredToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);

    const loadMe = useCallback(async () => {
        const token = getStoredToken();
        if (!token) {
            setUser(null);
            setReady(true);
            return;
        }
        try {
            const r = await fetch(apiUrl("/api/auth/me/"), {
                headers: { Authorization: `Token ${token}` },
            });
            if (!r.ok) throw new Error("me");
            const data = await r.json();
            setUser(data);
        } catch {
            setStoredToken(null);
            setUser(null);
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        loadMe();
    }, [loadMe]);

    const login = useCallback(async (username, password) => {
        const r = await fetch(apiUrl("/api/auth/login/"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
            const msg = data.detail || "Помилка входу.";
            throw new Error(typeof msg === "string" ? msg : "Помилка входу.");
        }
        setStoredToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const register = useCallback(async (payload) => {
        const r = await fetch(apiUrl("/api/auth/register/"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
            const first =
                typeof data === "object" && data !== null
                    ? Object.values(data).flat()[0]
                    : null;
            const msg = Array.isArray(first) ? first[0] : first || "Помилка реєстрації.";
            throw new Error(String(msg));
        }
        setStoredToken(data.token);
        setUser(data.user);
        return data.user;
    }, []);

    const logout = useCallback(() => {
        setStoredToken(null);
        setUser(null);
    }, []);

    const value = useMemo(
        () => ({
            user,
            ready,
            isLandlord: user?.role === "landlord",
            isStaff: Boolean(user?.is_staff),
            login,
            register,
            logout,
            reload: loadMe,
        }),
        [user, ready, login, register, logout, loadMe],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
