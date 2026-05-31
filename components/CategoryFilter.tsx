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
    "font-mono text-xs uppercase tracking-widest transition-colors whitespace-nowrap pb-0.5 border-b";
  const on = "border-accent text-accent";
  const off = "border-transparent text-muted hover:text-foreground";

  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      <button
        onClick={() => onChange("all")}
        className={`${base} ${active === "all" ? on : off}`}
      >
        {t("all", lang)}
        <sup className="ml-0.5 text-[9px]">{total}</sup>
      </button>
      {categories.map(({ cat, count }) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`${base} ${active === cat ? on : off}`}
        >
          {categoryLabel(cat, lang)}
          <sup className="ml-0.5 text-[9px]">{count}</sup>
        </button>
      ))}
    </div>
  );
}
