import Link from "next/link";
import type { AgentMeta } from "@/lib/agents/types";
import { categoryLabel, t, type Lang } from "@/lib/i18n";

export default function AgentCard({
  agent,
  n,
  lang,
}: {
  agent: AgentMeta;
  n: number;
  lang: Lang;
}) {
  const name = lang === "zh" ? agent.label : agent.labelEn;
  const desc = lang === "zh" ? agent.desc : agent.descEn;
  const num = String(n).padStart(3, "0");

  return (
    <Link
      href={`/tools/${agent.id}`}
      className="group relative flex flex-col gap-3 bg-surface p-5 transition-colors hover:bg-surface-2"
    >
      {/* accent edge reveals on hover */}
      <span className="absolute inset-y-0 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-200 group-hover:scale-y-100" />

      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-muted">
        <span>{num}</span>
        <span className="text-accent/80">{categoryLabel(agent.cat, lang)}</span>
      </div>

      <h3 className="font-display text-lg font-medium leading-snug tracking-tight">
        {name}
      </h3>

      <p className="line-clamp-2 text-sm leading-relaxed text-muted">{desc}</p>

      <span className="mt-auto pt-1 font-mono text-xs uppercase tracking-widest text-foreground-soft opacity-0 transition group-hover:opacity-100">
        {t("run", lang)} →
      </span>
    </Link>
  );
}
