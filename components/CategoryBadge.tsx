import { categoryLabel, type Lang } from "@/lib/i18n";
import type { AgentCategory } from "@/lib/agents/types";

const COLORS: Record<AgentCategory, string> = {
  product: "bg-blue-500/15 text-blue-300",
  brand: "bg-pink-500/15 text-pink-300",
  finance: "bg-emerald-500/15 text-emerald-300",
  strategy: "bg-amber-500/15 text-amber-300",
  marketing: "bg-fuchsia-500/15 text-fuchsia-300",
  legal: "bg-slate-500/15 text-slate-300",
  sales: "bg-orange-500/15 text-orange-300",
  people: "bg-teal-500/15 text-teal-300",
  ops: "bg-cyan-500/15 text-cyan-300",
  dev: "bg-violet-500/15 text-violet-300",
  content: "bg-rose-500/15 text-rose-300",
  operations: "bg-indigo-500/15 text-indigo-300",
  design: "bg-lime-500/15 text-lime-300",
};

export default function CategoryBadge({
  cat,
  lang,
}: {
  cat: AgentCategory;
  lang: Lang;
}) {
  return (
    <span
      className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium ${
        COLORS[cat] ?? "bg-surface-2 text-muted"
      }`}
    >
      {categoryLabel(cat, lang)}
    </span>
  );
}
