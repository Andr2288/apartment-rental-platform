import { Link } from "react-router-dom";

const IMG_HERO =
    "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?auto=format&fit=crop&w=1920&q=80";
const IMG_SIDE =
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80";

function IconSearch(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-3.2-3.2" strokeLinecap="round" />
        </svg>
    );
}

function IconSliders(props) {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" {...props}>
            <path d="M4 6h16M9 12h11M4 18h16" strokeLinecap="round" />
            <circle cx="7" cy="6" r="2" fill="currentColor" stroke="none" />
            <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
            <circle cx="9" cy="18" r="2" fill="currentColor" stroke="none" />
        </svg>
    );
}

function IconChat(props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
            <path d="M9 10h.01M12 10h.01M15 10h.01" />
        </svg>
    );
}

export default function HomePage() {
    return (
        <div className="space-y-10 sm:space-y-14">
            <section className="relative overflow-hidden rounded-2xl shadow-md">
                <img
                    src={IMG_HERO}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-p24-900/95 via-p24-900/88 to-p24-800/85" />
                <div className="relative px-6 py-14 sm:px-10 sm:py-20 lg:py-24">
                    <p className="text-xs font-medium uppercase tracking-wider text-p24-accent/90">
                        Оренда житла в Україні
                    </p>
                    <h1 className="mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                        Знайдіть квартиру, яка підходить саме вам
                    </h1>
                    <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/85 sm:text-base">
                        Оголошення від власників, зрозумілі фільтри та помічник, який підказує
                        варіанти з нашого каталогу.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/listings"
                            className="inline-flex items-center justify-center rounded-xl bg-p24-accent px-6 py-3 text-sm font-semibold text-p24-900 shadow-lg transition hover:bg-p24-accent-hover"
                        >
                            Переглянути оголошення
                        </Link>
                        <Link
                            to="/ai-assistant"
                            className="inline-flex items-center justify-center rounded-xl border border-white/35 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
                        >
                            Спробувати помічника
                        </Link>
                    </div>
                    <p className="mt-6 text-[11px] text-white/50 sm:text-xs">
                        Фото:{" "}
                        <a
                            href="https://unsplash.com/?utm_source=apartment-rent&utm_medium=referral"
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-white/30 underline-offset-2 hover:text-white"
                        >
                            Unsplash
                        </a>
                    </p>
                </div>
            </section>

            <section className="grid gap-6 sm:grid-cols-3">
                {[
                    {
                        Icon: IconSearch,
                        title: "Каталог",
                        text: "Оголошення з описом, фото та ключовими параметрами.",
                    },
                    {
                        Icon: IconSliders,
                        title: "Фільтри",
                        text: "Місто, ціна, кімнати, тип житла — швидкий пошук під ваш запит.",
                    },
                    {
                        Icon: IconChat,
                        title: "Помічник",
                        text: "Опишіть побажання словами — отримаєте підбір з каталогу.",
                    },
                ].map(({ Icon, title, text }) => (
                    <div
                        key={title}
                        className="rounded-2xl border border-p24-900/10 bg-white p-6 shadow-sm"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-p24-900 text-p24-accent">
                            <Icon className="h-6 w-6" />
                        </div>
                        <h2 className="mt-4 text-lg font-semibold text-p24-900">{title}</h2>
                        <p className="mt-2 text-sm leading-relaxed text-neutral-600">{text}</p>
                    </div>
                ))}
            </section>

            <section className="overflow-hidden rounded-2xl border border-p24-900/10 bg-white shadow-sm">
                <div className="grid lg:grid-cols-2">
                    <div className="relative min-h-[220px] lg:min-h-[320px]">
                        <img
                            src={IMG_SIDE}
                            alt=""
                            className="absolute inset-0 h-full w-full object-cover"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-p24-900/10 lg:hidden" />
                    </div>
                    <div className="flex flex-col justify-center px-6 py-10 sm:px-10">
                        <h2 className="text-2xl font-bold text-p24-900">Для орендарів і власників</h2>
                        <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                            Орендарі переглядають актуальні пропозиції та користуються помічником.
                            Власники публікують оголошення з фото й деталями — після перевірки вони
                            з’являються в каталозі.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                to="/register"
                                className="inline-flex rounded-xl bg-p24-accent px-5 py-2.5 text-sm font-semibold text-p24-900 shadow-sm hover:bg-p24-accent-hover"
                            >
                                Створити акаунт
                            </Link>
                            <Link
                                to="/login"
                                className="inline-flex rounded-xl border border-p24-900/15 px-5 py-2.5 text-sm font-semibold text-p24-900 hover:bg-p24-surface"
                            >
                                Увійти
                            </Link>
                        </div>
                        <p className="mt-4 text-[11px] text-neutral-400">
                            Фото:{" "}
                            <a
                                href="https://unsplash.com/?utm_source=apartment-rent&utm_medium=referral"
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-2 hover:text-neutral-600"
                            >
                                Unsplash
                            </a>
                        </p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl bg-p24-900 px-6 py-10 text-center sm:px-10 sm:py-12">
                <h2 className="text-xl font-bold text-white sm:text-2xl">Готові почати?</h2>
                <p className="mx-auto mt-2 max-w-md text-sm text-white/75">
                    Відкрийте каталог або опишіть запит помічнику — підберемо варіанти з наявних
                    оголошень.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                        to="/listings"
                        className="inline-flex rounded-xl bg-p24-accent px-6 py-3 text-sm font-semibold text-p24-900 shadow-md hover:bg-p24-accent-hover"
                    >
                        До каталогу
                    </Link>
                    <Link
                        to="/ai-assistant"
                        className="inline-flex rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
                    >
                        Помічник
                    </Link>
                </div>
            </section>
        </div>
    );
}
