import Link from "next/link";
import type { AgentMeta } from "@/lib/agents/types";
import { t, type Lang } from "@/lib/i18n";
import CategoryBadge from "./CategoryBadge";

export default function AgentCard({
  agent,
  lang,
}: {
  agent: AgentMeta;
  lang: Lang;
}) {
  const name = lang === "zh" ? agent.label : agent.labelEn;
  const desc = lang === "zh" ? agent.desc : agent.descEn;

  return (
    <Link
      href={`/tools/${agent.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-accent hover:bg-surface-2"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug">{name}</h3>
        <CategoryBadge cat={agent.cat} lang={lang} />
      </div>
      <p className="line-clamp-2 text-sm text-muted">{desc}</p>
      <span className="mt-auto text-sm font-medium text-accent opacity-0 transition group-hover:opacity-100">
        {t("run", lang)} →
      </span>
    </Link>
  );
}
