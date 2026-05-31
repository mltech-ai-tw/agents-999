import { categoryLabel, type Lang } from "@/lib/i18n";
import type { AgentCategory } from "@/lib/agents/types";

export default function CategoryBadge({
  cat,
  lang,
}: {
  cat: AgentCategory;
  lang: Lang;
}) {
  return (
    <span className="inline-block border border-border-strong px-2 py-1 font-mono text-[11px] uppercase tracking-widest text-accent">
      {categoryLabel(cat, lang)}
    </span>
  );
}
