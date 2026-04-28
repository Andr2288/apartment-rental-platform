import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiUrl } from "../api/baseUrl.js";

function formatMoney(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 0,
    }).format(n);
}

export default function ListingDetailPage() {
    const { listingId } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        fetch(apiUrl(`/api/listings/${listingId}/`))
            .then((r) => {
                if (r.status === 404) throw new Error("404");
                if (!r.ok) throw new Error(String(r.status));
                return r.json();
            })
            .then((json) => {
                if (!cancelled) setItem(json);
            })
            .catch((e) => {
                if (!cancelled) {
                    setItem(null);
                    setError(e.message === "404" ? "not_found" : "load");
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [listingId]);

    if (loading) {
        return <p className="text-center text-sm text-neutral-600">Завантаження…</p>;
    }

    if (error === "not_found") {
        return (
            <div className="rounded-2xl border border-p24-900/10 bg-white p-8 text-center shadow-sm">
                <p className="text-neutral-700">Оголошення не знайдено або знято з публікації.</p>
                <Link
                    to="/listings"
                    className="mt-4 inline-block text-sm font-semibold text-p24-800 underline"
                >
                    До списку оголошень
                </Link>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900 shadow-sm">
                Не вдалося завантажити оголошення.
            </div>
        );
    }

    return (
        <article className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                    to="/listings"
                    className="text-sm font-medium text-p24-800 hover:underline"
                >
                    ← Усі оголошення
                </Link>
            </div>
            <header className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm sm:p-8">
                <h1 className="text-2xl font-bold text-p24-900 sm:text-3xl">{item.title}</h1>
                <p className="mt-2 text-lg font-semibold text-p24-800">{formatMoney(item.price)} / міс.</p>
                <p className="mt-1 text-neutral-600">
                    {item.city}, {item.address_or_district} · {item.housing_type_display}
                </p>
            </header>

            {item.images?.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {item.images.map((img) => (
                        <a
                            key={img.id}
                            href={img.url}
                            target="_blank"
                            rel="noreferrer"
                            className="overflow-hidden rounded-xl border border-p24-900/10 bg-white shadow-sm"
                        >
                            <img src={img.url} alt="" className="aspect-video w-full object-cover" />
                        </a>
                    ))}
                </div>
            )}

            <section className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-p24-900">Опис</h2>
                <p className="mt-3 whitespace-pre-wrap text-neutral-700">{item.description}</p>
            </section>

            <section className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-p24-900">Параметри</h2>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Кімнати
                        </dt>
                        <dd className="text-neutral-900">{item.rooms}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Площа
                        </dt>
                        <dd className="text-neutral-900">{item.area_sqm} м²</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Поверх
                        </dt>
                        <dd className="text-neutral-900">
                            {item.floor === null || item.floor === undefined || item.floor === ""
                                ? "—"
                                : item.floor}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Меблі
                        </dt>
                        <dd className="text-neutral-900">{item.has_furniture ? "Так" : "Ні"}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Техніка
                        </dt>
                        <dd className="text-neutral-900">{item.has_appliances ? "Так" : "Ні"}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                            Статус
                        </dt>
                        <dd className="text-neutral-900">{item.status_display}</dd>
                    </div>
                </dl>
            </section>

            <section className="rounded-2xl border border-p24-900/10 bg-p24-900 p-6 text-white shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-p24-accent">Контакти</h2>
                <p className="mt-3 whitespace-pre-wrap text-white/95">{item.contact_info}</p>
            </section>
        </article>
    );
}
