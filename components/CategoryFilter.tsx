"use client";

import type { AgentCategory } from "@/lib/agents/types";
import { categoryLabel, t, type Lang } from "@/lib/i18n";

export type CategoryOption = { cat: AgentCategory; count: number };

export default function CategoryFilter({
  categories,
  active,
  onChange,
  total,
  lang,
}: {
  categories: CategoryOption[];
  active: AgentCategory | "all";
  onChange: (cat: AgentCategory | "all") => void;
  total: number;
  lang: Lang;
}) {
  const base =
    "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition";
  const on = "border-accent bg-accent text-white";
  const off = "border-border text-muted hover:border-accent hover:text-foreground";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange("all")}
        className={`${base} ${active === "all" ? on : off}`}
      >
        {t("all", lang)} ({total})
      </button>
      {categories.map(({ cat, count }) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`${base} ${active === cat ? on : off}`}
        >
          {categoryLabel(cat, lang)} ({count})
        </button>
      ))}
    </div>
  );
}
