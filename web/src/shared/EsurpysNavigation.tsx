"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/shared/LanguageProvider";

const content = {
  en: {
    navHome: "Home",
    navNavigator: "Visa Navigator",
    navCountries: "Countries",
    navAbout: "About",
  },
  ru: {
    navHome: "Главная",
    navNavigator: "Визовый навигатор",
    navCountries: "Страны",
    navAbout: "О проекте",
  },
} as const;

const navigation = [
  { href: "/", key: "navHome" },
  { href: "/navigator", key: "navNavigator" },
  { href: "/countries", key: "navCountries" },
  { href: "/about", key: "navAbout" },
] as const;

const NAVIGATOR_ROUTES = new Set([
  "/navigator",
  "/world-navigator",
  "/us",
  "/uk",
  "/de",
  "/au",
  "/ca",
  "/nl",
]);

export default function Header() {
  const { language, setLanguage } = useLanguage();
  const pathname = usePathname();
  const t = content[language];

  function isActiveRoute(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/navigator") return NAVIGATOR_ROUTES.has(pathname);
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="relative z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link
          href="/"
          className="shrink-0 text-2xl font-bold tracking-tight text-white"
        >
          Esurpys<span className="text-cyan-400">.</span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {navigation.map((item) => {
            const active = isActiveRoute(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl border px-4 py-2.5 text-sm font-medium shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  active
                    ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-300 shadow-lg shadow-cyan-500/5"
                    : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-cyan-400/50 hover:bg-cyan-400/10 hover:text-cyan-300 hover:shadow-lg hover:shadow-cyan-500/5"
                }`}
              >
                {t[item.key]}
              </Link>
            );
          })}

          <div className="flex rounded-full border border-white/10 bg-slate-900 p-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              aria-label="Switch to English"
              aria-pressed={language === "en"}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                language === "en"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("ru")}
              aria-label="Переключить на русский"
              aria-pressed={language === "ru"}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                language === "ru"
                  ? "bg-cyan-400 text-slate-950"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              RU
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}