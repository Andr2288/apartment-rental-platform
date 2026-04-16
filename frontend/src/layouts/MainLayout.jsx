import { NavLink, Outlet } from "react-router-dom";

function navClass({ isActive }) {
    return [
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
            ? "bg-white/15 text-p24-accent"
            : "text-white/90 hover:bg-white/10 hover:text-white",
    ].join(" ");
}

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-p24-surface text-neutral-900">
            <header className="bg-p24-900 text-white shadow-md">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3">
                    <NavLink
                        to="/"
                        className="text-lg font-semibold tracking-tight text-p24-accent"
                    >
                        Оренда квартир
                    </NavLink>
                    <nav className="flex flex-wrap items-center gap-1">
                        <NavLink to="/" end className={navClass}>
                            Головна
                        </NavLink>
                        <NavLink to="/listings" className={navClass}>
                            Оголошення
                        </NavLink>
                        <NavLink to="/ai-assistant" className={navClass}>
                            AI-помічник
                        </NavLink>
                        <NavLink to="/login" className={navClass}>
                            Вхід
                        </NavLink>
                        <NavLink to="/register" className={navClass}>
                            Реєстрація
                        </NavLink>
                    </nav>
                </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                <Outlet />
            </main>
            <footer className="border-t border-p24-900/10 bg-white py-4 text-center text-sm text-neutral-600">
                Платформа оренди квартир · українською
            </footer>
        </div>
    );
}
