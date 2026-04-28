const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

/**
 * @param {string} path
 */
export function apiUrl(path) {
    if (/^https?:\/\//i.test(path)) {
        return path;
    }
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return API_BASE ? `${API_BASE}${normalizedPath}` : normalizedPath;
}
