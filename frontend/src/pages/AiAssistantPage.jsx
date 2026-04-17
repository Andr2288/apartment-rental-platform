import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function formatMoney(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return new Intl.NumberFormat("uk-UA", {
        style: "currency",
        currency: "UAH",
        maximumFractionDigits: 0,
    }).format(n);
}

function SendIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 translate-x-px"
            aria-hidden
        >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.56.75.75 0 0 0 0-1.228A60.517 60.517 0 0 0 3.478 2.404Z" />
        </svg>
    );
}

const TEXTAREA_MAX_PX = 168;

export default function AiAssistantPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState(() => [
        {
            id: "welcome",
            role: "assistant",
            content:
                "Привіт! Опишіть, що шукаєте (місто, бюджет, кімнати, район). Я підберу варіанти лише з опублікованих оголошень на цій платформі.",
            listings: [],
        },
    ]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const listRef = useRef(null);
    const textareaRef = useRef(null);

    const scrollToEnd = useCallback(() => {
        requestAnimationFrame(() => {
            const el = listRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
    }, []);

    const fitTextareaHeight = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, TEXTAREA_MAX_PX)}px`;
    }, []);

    useEffect(() => {
        fitTextareaHeight();
    }, [input, fitTextareaHeight]);

    async function handleSend(e) {
        if (e && typeof e.preventDefault === "function") {
            e.preventDefault();
        }
        const text = input.trim();
        if (!text || loading) return;
        setError("");
        setInput("");
        fitTextareaHeight();
        const userMsg = { id: `u-${Date.now()}`, role: "user", content: text, listings: [] };
        setMessages((m) => [...m, userMsg]);
        scrollToEnd();
        setLoading(true);
        try {
            const r = await fetch("/api/ai/chat/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: text }),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
                const d = data.detail || "Не вдалося отримати відповідь.";
                throw new Error(typeof d === "string" ? d : "Помилка сервера.");
            }
            setMessages((m) => [
                ...m,
                {
                    id: `a-${Date.now()}`,
                    role: "assistant",
                    content: data.reply || "",
                    listings: data.listings || [],
                },
            ]);
        } catch (err) {
            setError(err.message || "Помилка.");
        } finally {
            setLoading(false);
            scrollToEnd();
        }
    }

    function onKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!loading && input.trim()) {
                handleSend();
            }
        }
    }

    return (
        <div className="flex min-h-[min(70vh,calc(100dvh-10.5rem))] flex-col gap-3">
            <div className="shrink-0 rounded-2xl border border-p24-900/10 bg-white p-4 shadow-sm sm:p-6">
                <h1 className="text-xl font-bold text-p24-900 sm:text-2xl">AI-помічник</h1>
                <p className="mt-2 text-xs text-neutral-600 sm:text-sm">
                    Лише каталог цього сайту. За наявності{" "}
                    <code className="rounded bg-neutral-100 px-1">OPENAI_API_KEY</code> — розумніше
                    ранжування; без ключа — підбір за словами з вашого запиту.
                </p>
            </div>

            <div
                ref={listRef}
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto rounded-2xl border border-p24-900/10 bg-white p-3 shadow-inner sm:p-5"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={
                            msg.role === "user"
                                ? "ml-auto max-w-[min(100%,28rem)]"
                                : "mr-auto max-w-[min(100%,36rem)]"
                        }
                    >
                        <div
                            className={
                                msg.role === "user"
                                    ? "rounded-2xl rounded-br-md bg-p24-800 px-4 py-2.5 text-sm text-white shadow-sm"
                                    : "rounded-2xl rounded-bl-md bg-p24-surface px-4 py-2.5 text-sm text-neutral-800 shadow-sm ring-1 ring-p24-900/10"
                            }
                        >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            {msg.listings?.length > 0 && (
                                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                    {msg.listings.map((item) => (
                                        <li key={item.id}>
                                            <Link
                                                to={`/listings/${item.id}`}
                                                className="flex gap-3 rounded-xl border border-p24-900/10 bg-white p-2.5 text-left shadow-sm transition hover:border-p24-700/40"
                                            >
                                                <div className="h-14 w-[4.5rem] shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                                                    {item.thumb_url ? (
                                                        <img
                                                            src={item.thumb_url}
                                                            alt=""
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-[10px] text-neutral-400">
                                                            фото
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="line-clamp-2 text-sm font-semibold text-p24-900">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-neutral-600">
                                                        {item.city} · {item.rooms} кім. ·{" "}
                                                        {item.housing_type_display}
                                                    </p>
                                                    <p className="mt-0.5 text-sm font-bold text-p24-800">
                                                        {formatMoney(item.price)}
                                                    </p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                ))}
                {loading && (
                    <p className="text-center text-xs text-neutral-500 sm:text-sm">
                        Думаю над відповіддю…
                    </p>
                )}
            </div>

            {error && (
                <p className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:text-sm">
                    {error}
                </p>
            )}

            <div className="shrink-0 border-t border-p24-900/10 bg-p24-surface/95 py-3 pt-3 [-webkit-backdrop-filter:blur(8px)] [backdrop-filter:blur(8px)]">
                <form
                    onSubmit={handleSend}
                    className="mx-auto flex max-w-4xl items-end gap-2 sm:gap-3"
                >
                    <div className="min-w-0 flex-1 rounded-[1.35rem] border border-p24-900/12 bg-white px-1 py-1 shadow-sm ring-1 ring-black/[0.04]">
                        <label htmlFor="ai-chat-input" className="sr-only">
                            Повідомлення
                        </label>
                        <textarea
                            ref={textareaRef}
                            id="ai-chat-input"
                            rows={1}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Повідомлення… (Enter — надіслати, Shift+Enter — новий рядок)"
                            className="max-h-[10.5rem] min-h-[2.75rem] w-full resize-none rounded-[1.15rem] bg-transparent px-3 py-2.5 text-sm leading-snug text-neutral-900 outline-none placeholder:text-neutral-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="mb-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-p24-accent text-p24-900 shadow-md transition hover:bg-p24-accent-hover hover:shadow-lg active:scale-95 disabled:pointer-events-none disabled:opacity-40 sm:h-12 sm:w-12"
                        aria-label={loading ? "Надсилання" : "Надіслати"}
                        title="Надіслати (Enter)"
                    >
                        {loading ? (
                            <span className="h-2 w-2 animate-pulse rounded-full bg-p24-900/40" />
                        ) : (
                            <SendIcon />
                        )}
                    </button>
                </form>
                <p className="mx-auto mt-2 max-w-4xl px-1 text-center text-[11px] text-neutral-500 sm:text-xs">
                    Enter — надіслати · Shift+Enter — перенесення рядка
                </p>
            </div>
        </div>
    );
}
