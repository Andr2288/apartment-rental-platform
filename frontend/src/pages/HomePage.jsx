import { Link } from "react-router-dom";

export default function HomePage() {
    return (
        <div className="space-y-6">
            <section className="rounded-2xl border border-p24-900/10 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-p24-900">Ласкаво просимо</h1>
                <p className="mt-2 max-w-2xl text-neutral-600">
                    Оренда квартир: актуальні оголошення, зручні фільтри та помічник для підбору з
                    каталогу.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        to="/listings"
                        className="inline-flex rounded-lg bg-p24-accent px-5 py-2.5 text-sm font-semibold text-p24-900 shadow-sm hover:bg-p24-accent-hover"
                    >
                        Оголошення
                    </Link>
                    <Link
                        to="/ai-assistant"
                        className="inline-flex rounded-lg border border-p24-900/20 bg-white px-5 py-2.5 text-sm font-semibold text-p24-900 hover:bg-p24-surface"
                    >
                        Помічник
                    </Link>
                </div>
            </section>
        </div>
    );
}
