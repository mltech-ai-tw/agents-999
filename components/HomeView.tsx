"use client";

import { useMemo, useState } from "react";
import { AGENT_DATA } from "@/lib/agents/data";
import type { AgentCategory } from "@/lib/agents/types";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/hooks/useLang";
import Header from "./Header";
import SearchBar from "./SearchBar";
import CategoryFilter, { type CategoryOption } from "./CategoryFilter";
import AgentGrid from "./AgentGrid";

const CATEGORY_OPTIONS: CategoryOption[] = (() => {
  const counts = new Map<AgentCategory, number>();
  for (const a of AGENT_DATA) counts.set(a.cat, (counts.get(a.cat) ?? 0) + 1);
  return [...counts.entries()]
    .map(([cat, count]) => ({ cat, count }))
    .sort((a, b) => b.count - a.count);
})();

const MAX_RENDER = 120; // cap DOM nodes; search/filter narrows the rest

export default function HomeView() {
  const [lang, setLang] = useLang();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<AgentCategory | "all">("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AGENT_DATA.filter((a) => {
      if (cat !== "all" && a.cat !== cat) return false;
      if (!q) return true;
      return (
        a.label.toLowerCase().includes(q) ||
        a.labelEn.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.descEn.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    });
  }, [query, cat]);

  const shown = filtered.slice(0, MAX_RENDER);

  return (
    <div className="min-h-screen">
      <Header lang={lang} onToggleLang={setLang} />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-8 text-center">
          <h1 className="bg-gradient-to-r from-foreground to-accent bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            {t("tagline", lang)}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            {t("heroSubtitle", lang)}
          </p>
          <p className="mt-2 text-sm text-muted">
            <span className="font-semibold text-accent">{AGENT_DATA.length}</span>{" "}
            {t("agentsCount", lang)}
          </p>
        </section>

        <div className="mb-4">
          <SearchBar value={query} onChange={setQuery} lang={lang} />
        </div>

        <div className="mb-6">
          <CategoryFilter
            categories={CATEGORY_OPTIONS}
            active={cat}
            onChange={setCat}
            total={AGENT_DATA.length}
            lang={lang}
          />
        </div>

        <AgentGrid agents={shown} lang={lang} />

        {filtered.length > shown.length && (
          <p className="mt-6 text-center text-sm text-muted">
            {lang === "zh"
              ? `顯示前 ${shown.length} 個，共 ${filtered.length} 個符合 — 請用搜尋縮小範圍`
              : `Showing ${shown.length} of ${filtered.length} matches — refine your search`}
          </p>
        )}
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted">
        agents-999 · MIT · Bring your own key
      </footer>
    </div>
  );
}
