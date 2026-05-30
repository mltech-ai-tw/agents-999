"use client";

import Link from "next/link";
import { t, type Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
  onToggleLang: (lang: Lang) => void;
};

export default function Header({ lang, onToggleLang }: Props) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm text-white">
            9
          </span>
          <span className="text-lg tracking-tight">agents-999</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-border text-sm">
            <button
              onClick={() => onToggleLang("zh")}
              className={`px-3 py-1.5 transition ${
                lang === "zh"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
              aria-pressed={lang === "zh"}
            >
              中
            </button>
            <button
              onClick={() => onToggleLang("en")}
              className={`px-3 py-1.5 transition ${
                lang === "en"
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>

          <Link
            href="/settings"
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-foreground"
          >
            {t("settings", lang)}
          </Link>
        </div>
      </div>
    </header>
  );
}
