import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

function navClass({ isActive }) {
    return [
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
            ? "bg-white/15 text-p24-accent"
            : "text-white/90 hover:bg-white/10 hover:text-white",
    ].join(" ");
}

export default function MainLayout() {
    const { user, isLandlord, isStaff, logout } = useAuth();
    const navigate = useNavigate();

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
                            Помічник
                        </NavLink>
                        {isLandlord && (
                            <NavLink to="/my-listings" className={navClass}>
                                Мої оголошення
                            </NavLink>
                        )}
                        {isStaff && (
                            <NavLink to="/admin-stats" className={navClass}>
                                Статистика
                            </NavLink>
                        )}
                        {user ? (
                            <>
                                <span className="hidden px-2 text-xs text-white/70 sm:inline">
                                    {user.username}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        logout();
                                        navigate("/", { replace: true });
                                    }}
                                    className="rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
                                >
                                    Вийти
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className={navClass}>
                                    Вхід
                                </NavLink>
                                <NavLink to="/register" className={navClass}>
                                    Реєстрація
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
                <Outlet />
            </main>
            <footer className="border-t border-p24-900/10 bg-white py-4 text-center text-sm text-neutral-500">
                Оренда квартир
            </footer>
        </div>
    );
}
