import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { authFetch } from "../api/authFetch.js";
import { useAuth } from "../auth/AuthContext.jsx";

const housingOptions = [
    { value: "apartment", label: "Квартира" },
    { value: "house", label: "Будинок" },
    { value: "room", label: "Кімната" },
    { value: "studio", label: "Студія" },
];

function emptyForm() {
    return {
        title: "",
        description: "",
        address_or_district: "",
        city: "",
        price: "",
        rooms: "",
        area_sqm: "",
        floor: "",
        housing_type: "apartment",
        has_furniture: false,
        has_appliances: false,
        contact_info: "",
    };
}

export default function MyListingEditorPage({ create = false }) {
    const { listingId } = useParams();
    const id = create ? null : parseInt(listingId, 10);
    const { user, ready, isLandlord } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(emptyForm);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(!create);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [uploading, setUploading] = useState(false);

    const title = useMemo(() => (create ? "Нове оголошення" : "Редагування оголошення"), [create]);

    useEffect(() => {
        if (!ready || !isLandlord || create || !id || Number.isNaN(id)) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        authFetch(`/api/my-listings/${id}/`)
            .then((r) => {
                if (r.status === 404) throw new Error("404");
                if (!r.ok) throw new Error(String(r.status));
                return r.json();
            })
            .then((data) => {
                if (cancelled) return;
                setForm({
                    title: data.title ?? "",
                    description: data.description ?? "",
                    address_or_district: data.address_or_district ?? "",
                    city: data.city ?? "",
                    price: String(data.price ?? ""),
                    rooms: String(data.rooms ?? ""),
                    area_sqm: String(data.area_sqm ?? ""),
                    floor: data.floor === null || data.floor === undefined ? "" : String(data.floor),
                    housing_type: data.housing_type || "apartment",
                    has_furniture: Boolean(data.has_furniture),
                    has_appliances: Boolean(data.has_appliances),
                    contact_info: data.contact_info ?? "",
                });
                setImages(data.images || []);
            })
            .catch(() => {
                if (!cancelled) setError("Не вдалося завантажити оголошення.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [ready, isLandlord, create, id]);

    function setField(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    function buildPayload() {
        return {
            title: form.title.trim(),
            description: form.description.trim(),
            address_or_district: form.address_or_district.trim(),
            city: form.city.trim(),
            price: form.price,
            rooms: Number(form.rooms),
            area_sqm: form.area_sqm,
            floor: form.floor === "" ? null : Number(form.floor),
            housing_type: form.housing_type,
            has_furniture: form.has_furniture,
            has_appliances: form.has_appliances,
            contact_info: form.contact_info.trim(),
        };
    }

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const payload = buildPayload();
            if (create) {
                const r = await authFetch("/api/my-listings/", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
                const data = await r.json().catch(() => ({}));
                if (!r.ok) {
                    const msg = Object.values(data).flat()[0] || "Помилка збереження.";
                    throw new Error(String(Array.isArray(msg) ? msg[0] : msg));
                }
                navigate(`/my-listings/${data.id}/edit`, { replace: true });
            } else {
                const r = await authFetch(`/api/my-listings/${id}/`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                });
                const data = await r.json().catch(() => ({}));
                if (!r.ok) {
                    const msg = Object.values(data).flat()[0] || "Помилка збереження.";
                    throw new Error(String(Array.isArray(msg) ? msg[0] : msg));
                }
                setForm((f) => ({
                    ...f,
                    title: data.title,
                    description: data.description,
                    address_or_district: data.address_or_district,
                    city: data.city,
                    price: String(data.price),
                    rooms: String(data.rooms),
                    area_sqm: String(data.area_sqm),
                    floor:
                        data.floor === null || data.floor === undefined ? "" : String(data.floor),
                    housing_type: data.housing_type,
                    has_furniture: data.has_furniture,
                    has_appliances: data.has_appliances,
                    contact_info: data.contact_info,
                }));
                setImages(data.images || []);
            }
        } catch (err) {
            setError(err.message || "Помилка збереження.");
        } finally {
            setSaving(false);
        }
    }

    async function onDelete() {
        if (!id || create) return;
        if (!confirm("Видалити це оголошення?")) return;
        const r = await authFetch(`/api/my-listings/${id}/`, { method: "DELETE" });
        if (r.ok) navigate("/my-listings");
        else setError("Не вдалося видалити.");
    }

    async function reloadImages() {
        if (!id || create) return;
        const r = await authFetch(`/api/my-listings/${id}/`);
        if (!r.ok) return;
        const data = await r.json();
        setImages(data.images || []);
    }

    async function onPickFiles(e) {
        const files = e.target.files;
        if (!files?.length || !id || create) return;
        setUploading(true);
        setError("");
        try {
            for (const file of files) {
                const fd = new FormData();
                fd.append("image", file);
                fd.append("sort_order", String(images.length));
                const r = await authFetch(`/api/my-listings/${id}/images/`, {
                    method: "POST",
                    body: fd,
                });
                if (!r.ok) throw new Error("Не вдалося завантажити фото.");
            }
            await reloadImages();
        } catch (err) {
            setError(err.message || "Помилка завантаження фото.");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    }

    async function onDeleteImage(imageId) {
        if (!id || create) return;
        if (!confirm("Видалити фото?")) return;
        const r = await authFetch(`/api/my-listings/${id}/images/${imageId}/`, {
            method: "DELETE",
        });
        if (r.ok) await reloadImages();
        else setError("Не вдалося видалити фото.");
    }

    if (!ready) {
        return <p className="text-center text-sm text-neutral-600">Завантаження…</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isLandlord) {
        return <Navigate to="/" replace />;
    }

    if (!create && (Number.isNaN(id) || id <= 0)) {
        return <Navigate to="/my-listings" replace />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-p24-900">{title}</h1>
                </div>
                <Link
                    to="/my-listings"
                    className="text-sm font-semibold text-p24-800 underline hover:text-p24-900"
                >
                    ← До моїх оголошень
                </Link>
            </div>

            {loading && <p className="text-sm text-neutral-600">Завантаження…</p>}

            {!loading && (
                <form
                    onSubmit={onSubmit}
                    className="space-y-6 rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm sm:p-8"
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block text-sm font-medium text-p24-900 sm:col-span-2">
                            Назва
                            <input
                                required
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.title}
                                onChange={(e) => setField("title", e.target.value)}
                            />
                        </label>
                        <label className="block text-sm font-medium text-p24-900 sm:col-span-2">
                            Опис
                            <textarea
                                required
                                rows={5}
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.description}
                                onChange={(e) => setField("description", e.target.value)}
                            />
                        </label>
                        <label className="block text-sm font-medium text-p24-900">
                            Місто
                            <input
                                required
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.city}
                                onChange={(e) => setField("city", e.target.value)}
                            />
                        </label>
                        <label className="block text-sm font-medium text-p24-900">
                            Адреса або район
                            <input
                                required
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.address_or_district}
                                onChange={(e) => setField("address_or_district", e.target.value)}
                            />
                        </label>
                        <label className="block text-sm font-medium text-p24-900">
                            Ціна (грн / міс.)
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.price}
                                onChange={(e) => setField("price", e.target.value)}
                            />
                        </label>
                        <label className="block text-sm font-medium text-p24-900">
                            Кімнати
                            <input
                                required
                                type="number"
                                min="0"
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.rooms}
                                onChange={(e) => setField("rooms", e.target.value)}
                            />
                        </label>
                        <label className="block text-sm font-medium text-p24-900">
                            Площа (м²)
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.01"
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.area_sqm}
                                onChange={(e) => setField("area_sqm", e.target.value)}
                            />
                        </label>
                        <label className="block text-sm font-medium text-p24-900">
                            Поверх (необов’язково)
                            <input
                                type="number"
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.floor}
                                onChange={(e) => setField("floor", e.target.value)}
                            />
                        </label>
                        <label className="block text-sm font-medium text-p24-900">
                            Тип житла
                            <select
                                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.housing_type}
                                onChange={(e) => setField("housing_type", e.target.value)}
                            >
                                {housingOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-p24-900 sm:col-span-2">
                            <input
                                type="checkbox"
                                checked={form.has_furniture}
                                onChange={(e) => setField("has_furniture", e.target.checked)}
                            />
                            Меблі
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-p24-900 sm:col-span-2">
                            <input
                                type="checkbox"
                                checked={form.has_appliances}
                                onChange={(e) => setField("has_appliances", e.target.checked)}
                            />
                            Техніка
                        </label>
                        <label className="block text-sm font-medium text-p24-900 sm:col-span-2">
                            Контактна інформація
                            <input
                                required
                                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 outline-none ring-p24-700 focus:ring-2"
                                value={form.contact_info}
                                onChange={(e) => setField("contact_info", e.target.value)}
                            />
                        </label>
                    </div>

                    {error && (
                        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                            {error}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-p24-accent px-5 py-2.5 text-sm font-semibold text-p24-900 hover:bg-p24-accent-hover disabled:opacity-60"
                        >
                            {saving ? "Збереження…" : "Зберегти"}
                        </button>
                        {!create && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="rounded-lg border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                            >
                                Видалити
                            </button>
                        )}
                    </div>
                </form>
            )}

            {!create && !loading && id && (
                <section className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm sm:p-8">
                    <h2 className="text-lg font-semibold text-p24-900">Фото</h2>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploading}
                        onChange={onPickFiles}
                        className="mt-4 block w-full text-sm text-neutral-700"
                    />
                    {uploading && <p className="mt-2 text-sm text-neutral-600">Завантаження…</p>}
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {images.map((img) => (
                            <li
                                key={img.id}
                                className="overflow-hidden rounded-lg border border-p24-900/10"
                            >
                                <img src={img.url} alt="" className="aspect-video w-full object-cover" />
                                <div className="flex justify-end border-t border-neutral-100 p-2">
                                    <button
                                        type="button"
                                        onClick={() => onDeleteImage(img.id)}
                                        className="text-xs font-semibold text-red-700 hover:underline"
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}
