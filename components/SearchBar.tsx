"use client";

import { t, type Lang } from "@/lib/i18n";

export default function SearchBar({
  value,
  onChange,
  lang,
}: {
  value: string;
  onChange: (value: string) => void;
  lang: Lang;
}) {
  return (
    <div className="group relative flex items-center border-b-2 border-border-strong transition-colors focus-within:border-accent">
      <svg
        className="pointer-events-none mr-3 h-5 w-5 shrink-0 text-muted transition-colors group-focus-within:text-accent"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder", lang)}
        className="font-display w-full bg-transparent py-3 text-xl tracking-tight outline-none placeholder:text-muted placeholder:opacity-60"
      />
    </div>
  );
}
