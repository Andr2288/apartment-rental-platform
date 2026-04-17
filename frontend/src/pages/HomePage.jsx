import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
    const [apiStatus, setApiStatus] = useState("перевірка…");
    const [apiOk, setApiOk] = useState(null);

    useEffect(() => {
        let cancelled = false;
        fetch("/api/health/")
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
            .then((data) => {
                if (!cancelled) {
                    setApiOk(data.status === "ok");
                    setApiStatus(data.status === "ok" ? "API доступне" : "невідома відповідь");
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setApiOk(false);
                    setApiStatus("немає зв’язку з сервером");
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-p24-900/10 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-p24-900">Ласкаво просимо</h1>
                <p className="mt-2 max-w-2xl text-neutral-600">
                    Вебплатформа для пошуку квартир у оренду з AI-помічником. Каталог оголошень і фільтри вже
                    доступні; далі — облікові записи, кабінет орендодавця та чат.
                </p>
                <Link
                    to="/listings"
                    className="mt-6 inline-flex rounded-lg bg-p24-accent px-5 py-2.5 text-sm font-semibold text-p24-900 shadow-sm hover:bg-p24-accent-hover"
                >
                    Переглянути оголошення
                </Link>
            </section>
            <section
                className={`rounded-xl border px-5 py-4 text-sm ${
                    apiOk === true
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : apiOk === false
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : "border-neutral-200 bg-white text-neutral-600"
                }`}
            >
                <span className="font-semibold">Стан бекенду:</span> {apiStatus}
            </section>
        </div>
    );
}
