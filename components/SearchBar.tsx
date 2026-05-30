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
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
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
        className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-foreground outline-none transition placeholder:text-muted focus:border-accent"
      />
    </div>
  );
}
