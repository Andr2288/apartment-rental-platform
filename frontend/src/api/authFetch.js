import { getStoredToken } from "../auth/AuthContext.jsx";

/**
 * @param {string} url
 * @param {RequestInit} [options]
 */
export async function authFetch(url, options = {}) {
    const token = getStoredToken();
    const headers = new Headers(options.headers || {});
    if (token) {
        headers.set("Authorization", `Token ${token}`);
    }
    const body = options.body;
    if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    return fetch(url, { ...options, headers });
}
