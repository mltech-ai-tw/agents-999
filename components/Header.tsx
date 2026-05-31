"use client";

import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
  onToggleLang: (lang: Lang) => void;
};

export default function Header({ lang, onToggleLang }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      {/* top accent rule — editorial masthead flourish */}
      <div className="h-1 bg-accent" />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <Link href="/" className="group flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-semibold tracking-tight">
            agents
          </span>
          <span className="font-mono text-2xl font-semibold text-accent">
            -999
          </span>
        </Link>

        <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleLang("zh")}
              className={`transition ${
                lang === "zh"
                  ? "text-accent underline underline-offset-4"
                  : "text-muted hover:text-foreground"
              }`}
              aria-pressed={lang === "zh"}
            >
              中
            </button>
            <span className="text-border-strong">/</span>
            <button
              onClick={() => onToggleLang("en")}
              className={`transition ${
                lang === "en"
                  ? "text-accent underline underline-offset-4"
                  : "text-muted hover:text-foreground"
              }`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>

          <Link
            href="/settings"
            className="text-muted transition hover:text-foreground"
          >
            {t("settings", lang)}
          </Link>
        </nav>
      </div>
    </header>
  );
}
