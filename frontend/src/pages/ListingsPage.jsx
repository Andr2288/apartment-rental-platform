import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const housingOptions = [
    { value: "", label: "Усі типи" },
    { value: "apartment", label: "Квартира" },
    { value: "house", label: "Будинок" },
    { value: "room", label: "Кімната" },
    { value: "studio", label: "Студія" },
];

const triState = [
    { value: "", label: "Неважливо" },
    { value: "true", label: "Так" },
    { value: "false", label: "Ні" },
];

function formatMoney(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 0,
    }).format(n);
}

function buildQuery(filters) {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== "") {
            p.set(k, String(v).trim());
        }
    });
    return p.toString();
}

const PAGE_SIZE = 12;

export default function ListingsPage() {
    const [filters, setFilters] = useState({
        search: "",
        city: "",
        min_price: "",
        max_price: "",
        min_rooms: "",
        max_rooms: "",
        housing_type: "",
        has_furniture: "",
        has_appliances: "",
    });
    const [applied, setApplied] = useState(filters);
    const [page, setPage] = useState(1);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const queryString = useMemo(() => buildQuery(applied), [applied]);

    const results = data?.results ?? [];
    const total = data?.count ?? 0;
    const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const to = total === 0 ? 0 : (page - 1) * PAGE_SIZE + results.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const p = new URLSearchParams(queryString);
            p.set("page", String(page));
            const qs = p.toString();
            const r = await fetch(`/api/listings/?${qs}`);
            if (!r.ok) throw new Error(String(r.status));
            const json = await r.json();
            setData(json);
        } catch {
            setError("Не вдалося завантажити оголошення.");
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [queryString, page]);

    useEffect(() => {
        load();
    }, [load]);

    useEffect(() => {
        if (!loading && data && total > 0) {
            const maxP = Math.ceil(total / PAGE_SIZE);
            if (page > maxP) {
                setPage(maxP);
            }
        }
    }, [loading, data, total, page]);

    function updateFilter(key, value) {
        setFilters((f) => ({ ...f, [key]: value }));
    }

    function applyFilters(e) {
        e.preventDefault();
        setPage(1);
        setApplied(filters);
    }

    function resetFilters() {
        const empty = {
            search: "",
            city: "",
            min_price: "",
            max_price: "",
            min_rooms: "",
            max_rooms: "",
            housing_type: "",
            has_furniture: "",
            has_appliances: "",
        };
        setFilters(empty);
        setPage(1);
        setApplied(empty);
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-p24-900">Оголошення</h1>
                <p className="mt-1 text-sm text-neutral-600">Пошук і фільтри.</p>
                <form
                    onSubmit={applyFilters}
                    className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                    <label className="block text-sm font-medium text-p24-900 sm:col-span-2 lg:col-span-3">
                        Пошук (текст)
                        <input
                            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-neutral-900 outline-none ring-p24-700 focus:ring-2"
                            value={filters.search}
                            onChange={(e) => updateFilter("search", e.target.value)}
                            placeholder="Наприклад: метро, район, опис…"
                        />
                    </label>
                    <label className="block text-sm font-medium text-p24-900">
                        Місто
                        <input
                            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                            value={filters.city}
                            onChange={(e) => updateFilter("city", e.target.value)}
                            placeholder="Київ"
                        />
                    </label>
                    <label className="block text-sm font-medium text-p24-900">
                        Ціна від
                        <input
                            type="number"
                            min={0}
                            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                            value={filters.min_price}
                            onChange={(e) => updateFilter("min_price", e.target.value)}
                        />
                    </label>
                    <label className="block text-sm font-medium text-p24-900">
                        Ціна до
                        <input
                            type="number"
                            min={0}
                            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                            value={filters.max_price}
                            onChange={(e) => updateFilter("max_price", e.target.value)}
                        />
                    </label>
                    <label className="block text-sm font-medium text-p24-900">
                        Кімнат від
                        <input
                            type="number"
                            min={0}
                            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                            value={filters.min_rooms}
                            onChange={(e) => updateFilter("min_rooms", e.target.value)}
                        />
                    </label>
                    <label className="block text-sm font-medium text-p24-900">
                        Кімнат до
                        <input
                            type="number"
                            min={0}
                            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                            value={filters.max_rooms}
                            onChange={(e) => updateFilter("max_rooms", e.target.value)}
                        />
                    </label>
                    <label className="block text-sm font-medium text-p24-900">
                        Тип житла
                        <select
                            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                            value={filters.housing_type}
                            onChange={(e) => updateFilter("housing_type", e.target.value)}
                        >
                            {housingOptions.map((o) => (
                                <option key={o.value || "all"} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm font-medium text-p24-900">
                        Меблі
                        <select
                            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                            value={filters.has_furniture}
                            onChange={(e) => updateFilter("has_furniture", e.target.value)}
                        >
                            {triState.map((o) => (
                                <option key={`f-${o.value || "x"}`} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-sm font-medium text-p24-900">
                        Техніка
                        <select
                            className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                            value={filters.has_appliances}
                            onChange={(e) => updateFilter("has_appliances", e.target.value)}
                        >
                            {triState.map((o) => (
                                <option key={`a-${o.value || "x"}`} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </label>
                    <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
                        <button
                            type="submit"
                            className="rounded-lg bg-p24-accent px-5 py-2.5 text-sm font-semibold text-p24-900 shadow-sm hover:bg-p24-accent-hover"
                        >
                            Застосувати
                        </button>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="rounded-lg border border-p24-900/20 bg-white px-5 py-2.5 text-sm font-medium text-p24-900 hover:bg-p24-surface"
                        >
                            Скинути
                        </button>
                    </div>
                </form>
            </div>

            {loading && (
                <p className="text-center text-sm text-neutral-600">Завантаження…</p>
            )}
            {error && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {error}
                </p>
            )}

            {!loading && !error && data && total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-p24-900/10 bg-white px-4 py-3 text-sm text-neutral-600 shadow-sm">
                    <p>
                        Знайдено: <span className="font-semibold text-p24-900">{total}</span>
                        {total > 0 && (
                            <span className="text-neutral-500">
                                {" "}
                                · показано {from}–{to}
                            </span>
                        )}
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="rounded-lg border border-p24-900/15 bg-white px-3 py-1.5 text-sm font-medium text-p24-900 hover:bg-p24-surface disabled:pointer-events-none disabled:opacity-40"
                            >
                                Назад
                            </button>
                            <span className="tabular-nums text-neutral-500">
                                {page} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={!data.next}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded-lg border border-p24-900/15 bg-white px-3 py-1.5 text-sm font-medium text-p24-900 hover:bg-p24-surface disabled:pointer-events-none disabled:opacity-40"
                            >
                                Далі
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {results.map((item) => (
                    <li key={item.id}>
                        <Link
                            to={`/listings/${item.id}`}
                            className="block h-full rounded-xl border border-p24-900/10 bg-white p-5 shadow-sm transition hover:border-p24-700/40 hover:shadow-md"
                        >
                            <div className="aspect-video w-full overflow-hidden rounded-lg bg-p24-surface">
                                {item.images?.[0]?.url ? (
                                    <img
                                        src={item.images[0].url}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-neutral-500">
                                        Немає фото
                                    </div>
                                )}
                            </div>
                            <h2 className="mt-3 line-clamp-2 font-semibold text-p24-900">{item.title}</h2>
                            <p className="mt-1 text-sm text-neutral-600">
                                {item.city} · {item.housing_type_display}
                            </p>
                            <p className="mt-2 text-lg font-bold text-p24-800">
                                {formatMoney(item.price)}
                                <span className="text-sm font-normal text-neutral-500"> / міс.</span>
                            </p>
                        </Link>
                    </li>
                ))}
            </ul>

            {!loading && !error && results.length === 0 && (
                <p className="text-center text-neutral-600">Нічого не знайдено. Спробуйте змінити фільтри.</p>
            )}
        </div>
    );
}
