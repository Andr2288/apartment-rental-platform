import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [accountType, setAccountType] = useState("seeker");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const u = await register({
                username: username.trim(),
                email: email.trim(),
                password,
                password_confirm: passwordConfirm,
                account_type: accountType === "landlord" ? "landlord" : "seeker",
            });
            navigate(u.role === "landlord" ? "/my-listings" : "/", { replace: true });
        } catch (err) {
            setError(err.message || "Помилка реєстрації.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="mx-auto max-w-md rounded-2xl border border-p24-900/10 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-p24-900">Реєстрація</h1>
            <p className="mt-1 text-sm text-neutral-600">
                Вже є акаунт?{" "}
                <Link to="/login" className="font-semibold text-p24-800 underline">
                    Вхід
                </Link>
            </p>
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <fieldset className="space-y-2 rounded-lg border border-neutral-200 p-3">
                    <legend className="px-1 text-sm font-medium text-p24-900">Тип акаунта</legend>
                    <label className="flex items-center gap-2 text-sm text-neutral-800">
                        <input
                            type="radio"
                            name="account"
                            checked={accountType === "seeker"}
                            onChange={() => setAccountType("seeker")}
                        />
                        Шукаю житло (орендар)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-neutral-800">
                        <input
                            type="radio"
                            name="account"
                            checked={accountType === "landlord"}
                            onChange={() => setAccountType("landlord")}
                        />
                        Здаю житло (орендодавець)
                    </label>
                </fieldset>
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
                    Email
                    <input
                        required
                        type="email"
                        autoComplete="email"
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </label>
                <label className="block text-sm font-medium text-p24-900">
                    Пароль (мін. 8 символів)
                    <input
                        required
                        minLength={8}
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </label>
                <label className="block text-sm font-medium text-p24-900">
                    Підтвердження пароля
                    <input
                        required
                        minLength={8}
                        type="password"
                        autoComplete="new-password"
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
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
                    {loading ? "Реєстрація…" : "Зареєструватися"}
                </button>
            </form>
        </div>
    );
}
