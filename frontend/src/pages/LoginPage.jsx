import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const u = await login(username.trim(), password);
            navigate(u.role === "landlord" ? "/my-listings" : "/", { replace: true });
        } catch (err) {
            setError(err.message || "Помилка входу.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-md rounded-2xl border border-p24-900/10 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-p24-900">Вхід</h1>
            <p className="mt-1 text-sm text-neutral-600">
                Немає акаунта?{" "}
                <Link to="/register" className="font-semibold text-p24-800 underline">
                    Реєстрація
                </Link>
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-p24-900">
                    Логін
                    <input
                        required
                        autoComplete="username"
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </label>
                <label className="block text-sm font-medium text-p24-900">
                    Пароль
                    <input
                        required
                        type="password"
                        autoComplete="current-password"
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                {error && (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        {error}
                    </p>
                )}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-p24-accent py-2.5 text-sm font-semibold text-p24-900 hover:bg-p24-accent-hover disabled:opacity-60"
                >
                    {loading ? "Вхід…" : "Увійти"}
                </button>
            </form>
        </div>
    );
}
