import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { authFetch } from "../api/authFetch.js";
import { useAuth } from "../auth/AuthContext.jsx";

const statusLabels = {
    draft: "Чернетка",
    pending: "На модерації",
    published: "Опубліковано",
    rejected: "Відхилено",
};

export default function AdminStatsPage() {
    const { user, ready } = useAuth();
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!ready || !user?.is_staff) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        authFetch("/api/admin/stats/")
            .then((r) => {
                if (r.status === 403) throw new Error("403");
                if (!r.ok) throw new Error(String(r.status));
                return r.json();
            })
            .then((json) => {
                if (!cancelled) setData(json);
            })
            .catch(() => {
                if (!cancelled) setError("Немає доступу або помилка завантаження.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [ready, user]);

    if (!ready) {
        return <p className="text-center text-sm text-neutral-600">Завантаження…</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!user.is_staff) {
        return (
            <div className="rounded-2xl border border-p24-900/10 bg-white p-8 text-center shadow-sm">
                <p className="text-neutral-700">Ця сторінка доступна лише адміністраторам (staff).</p>
                <Link to="/" className="mt-4 inline-block text-sm font-semibold text-p24-800 underline">
                    На головну
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-p24-900">Статистика платформи</h1>
                <p className="mt-1 text-sm text-neutral-600">
                    Зведені дані з бази. Модерація оголошень — у{" "}
                    <a
                        href="http://127.0.0.1:8000/admin/listings/listing/"
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-p24-800 underline"
                    >
                        Django Admin
                    </a>
                    : виберіть рядки → дія «Опублікувати вибрані».
                </p>
            </div>

            {loading && <p className="text-sm text-neutral-600">Завантаження…</p>}
            {error && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {error}
                </p>
            )}

            {data && (
                <div className="grid gap-6 sm:grid-cols-2">
                    <section className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-p24-900">Користувачі</h2>
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-neutral-600">Усього</dt>
                                <dd className="font-semibold text-p24-900">{data.users_total}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-neutral-600">Орендодавці</dt>
                                <dd className="font-semibold text-p24-900">{data.landlords_total}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-neutral-600">Орендарі</dt>
                                <dd className="font-semibold text-p24-900">{data.renters_total}</dd>
                            </div>
                        </dl>
                    </section>
                    <section className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-p24-900">Оголошення та медіа</h2>
                        <dl className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between gap-4">
                                <dt className="text-neutral-600">Оголошень усього</dt>
                                <dd className="font-semibold text-p24-900">{data.listings_total}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt className="text-neutral-600">Фото усього</dt>
                                <dd className="font-semibold text-p24-900">{data.images_total}</dd>
                            </div>
                        </dl>
                    </section>
                    <section className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm sm:col-span-2">
                        <h2 className="text-lg font-semibold text-p24-900">Оголошення за статусом</h2>
                        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                            {Object.entries(data.listings_by_status || {}).map(([key, val]) => (
                                <li
                                    key={key}
                                    className="flex justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                                >
                                    <span className="text-neutral-700">
                                        {statusLabels[key] || key}
                                    </span>
                                    <span className="font-semibold text-p24-900">{val}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            )}
        </div>
    );
}
