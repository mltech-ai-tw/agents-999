"use client";

import { useMemo, useState } from "react";
import { AGENT_DATA } from "@/lib/agents/data";
import type { AgentCategory, AgentMeta } from "@/lib/agents/types";
import { t } from "@/lib/i18n";
import { useLang } from "@/lib/hooks/useLang";
import Header from "./Header";
import SearchBar from "./SearchBar";
import CategoryFilter, { type CategoryOption } from "./CategoryFilter";
import AgentGrid from "./AgentGrid";

// Stable 1-based index per agent (its position in the catalogue).
type NumberedAgent = AgentMeta & { n: number };
const NUMBERED: NumberedAgent[] = AGENT_DATA.map((a, i) => ({ ...a, n: i + 1 }));

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
    return NUMBERED.filter((a) => {
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

      <main className="mx-auto max-w-6xl px-5">
        {/* ── Editorial hero ─────────────────────────────── */}
        <section className="grid grid-cols-1 gap-8 border-b border-border py-14 md:grid-cols-12 md:items-end md:py-20">
          <div className="md:col-span-8">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted">
              MLTech · {lang === "zh" ? "自帶金鑰" : "Bring your own key"}
            </p>
            <h1 className="font-display mt-4 text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              {lang === "zh" ? (
                <>
                  999 位 AI 顧問，
                  <br />
                  <span className="italic text-accent">一把金鑰</span> 即可召喚。
                </>
              ) : (
                <>
                  999 AI consultants,
                  <br />
                  <span className="italic text-accent">one key</span> away.
                </>
              )}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground-soft">
              {lang === "zh"
                ? "免帳號、免註冊。你的 API 金鑰只存在瀏覽器，永不上傳。選一位顧問，貼上金鑰，立即開工。"
                : "No account, no signup. Your API key lives in your browser and is never uploaded. Pick a consultant, paste a key, get to work."}
            </p>
          </div>

          {/* oversized numeral — graphic anchor */}
          <div className="md:col-span-4">
            <div className="select-none text-right leading-none">
              <span className="font-display block text-[7rem] font-semibold tracking-tighter text-accent sm:text-[9rem] md:text-[10rem]">
                999
              </span>
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                {lang === "zh" ? "顧問代理人" : "agents indexed"}
              </span>
            </div>
          </div>
        </section>

        {/* ── Toolbar ────────────────────────────────────── */}
        <section className="py-7">
          <div className="flex flex-col gap-4">
            <SearchBar value={query} onChange={setQuery} lang={lang} />
            <div className="flex items-baseline justify-between gap-4">
              <CategoryFilter
                categories={CATEGORY_OPTIONS}
                active={cat}
                onChange={setCat}
                total={AGENT_DATA.length}
                lang={lang}
              />
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted">
              {filtered.length} {t("agentsCount", lang)}
              {cat !== "all" || query ? ` / ${AGENT_DATA.length}` : ""}
            </p>
          </div>
        </section>

        {/* ── Index ──────────────────────────────────────── */}
        <section className="pb-16">
          <AgentGrid agents={shown} lang={lang} />

          {filtered.length > shown.length && (
            <p className="mt-8 border-t border-border pt-6 text-center font-mono text-xs uppercase tracking-widest text-muted">
              {lang === "zh"
                ? `顯示前 ${shown.length} 個，共 ${filtered.length} 個符合 — 用搜尋縮小範圍`
                : `Showing ${shown.length} of ${filtered.length} — refine your search`}
            </p>
          )}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-7 font-mono text-xs uppercase tracking-widest text-muted sm:flex-row">
          <span>agents-999 · MIT</span>
          <span>
            {lang === "zh" ? "由" : "by"}{" "}
            <a
              href="https://www.mltech.tw/en"
              target="_blank"
              rel="noreferrer"
              className="text-foreground-soft transition hover:text-accent"
            >
              MLTech 美樂信
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
