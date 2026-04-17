import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { authFetch } from "../api/authFetch.js";

function formatMoney(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 0,
    }).format(n);
}

export default function MyListingsPage() {
    const { user, ready, isLandlord } = useAuth();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ready || !isLandlord) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        authFetch("/api/my-listings/")
            .then((r) => {
                if (!r.ok) throw new Error(String(r.status));
                return r.json();
            })
            .then((json) => {
                if (!cancelled) setData(json);
            })
            .catch(() => {
                if (!cancelled) setError("Не вдалося завантажити ваші оголошення.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [ready, isLandlord]);

    if (!ready) {
        return <p className="text-center text-sm text-neutral-600">Завантаження…</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: "/my-listings" }} />;
    }

    if (!isLandlord) {
        return (
            <div className="rounded-2xl border border-p24-900/10 bg-white p-8 text-center shadow-sm">
                <p className="text-neutral-700">
                    Розділ доступний лише для акаунта з роллю <strong>орендодавець</strong>.
                </p>
                <Link to="/" className="mt-4 inline-block text-sm font-semibold text-p24-800 underline">
                    На головну
                </Link>
            </div>
        );
    }

    const list = data?.results ?? [];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-p24-900">Мої оголошення</h1>
                    <p className="mt-1 text-sm text-neutral-600">
                        Нові оголошення відправляються на модерацію (статус «На модерації»).
                    </p>
                </div>
                <Link
                    to="/my-listings/new"
                    className="rounded-lg bg-p24-accent px-4 py-2 text-sm font-semibold text-p24-900 hover:bg-p24-accent-hover"
                >
                    Додати оголошення
                </Link>
            </div>

            {loading && <p className="text-sm text-neutral-600">Завантаження…</p>}
            {error && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {error}
                </p>
            )}

            {!loading && !error && list.length === 0 && (
                <p className="rounded-xl border border-p24-900/10 bg-white p-6 text-neutral-600">
                    У вас ще немає оголошень. Натисніть «Додати оголошення».
                </p>
            )}

            <ul className="space-y-3">
                {list.map((item) => (
                    <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-p24-900/10 bg-white px-4 py-3 shadow-sm"
                    >
                        <div>
                            <p className="font-semibold text-p24-900">{item.title}</p>
                            <p className="text-sm text-neutral-600">
                                {item.city} · {item.status_display} · {formatMoney(item.price)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                to={`/my-listings/${item.id}/edit`}
                                className="rounded-lg border border-p24-900/20 px-3 py-1.5 text-sm font-medium text-p24-900 hover:bg-p24-surface"
                            >
                                Редагувати
                            </Link>
                            {item.status === "published" && (
                                <Link
                                    to={`/listings/${item.id}`}
                                    className="rounded-lg border border-p24-900/20 px-3 py-1.5 text-sm font-medium text-p24-900 hover:bg-p24-surface"
                                >
                                    Публічна сторінка
                                </Link>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
