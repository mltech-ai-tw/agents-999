import type { AgentMeta } from "@/lib/agents/types";
import { t, type Lang } from "@/lib/i18n";
import AgentCard from "./AgentCard";

type NumberedAgent = AgentMeta & { n: number };

export default function AgentGrid({
  agents,
  lang,
}: {
  agents: NumberedAgent[];
  lang: Lang;
}) {
  if (agents.length === 0) {
    return (
      <div className="border border-dashed border-border py-20 text-center font-mono text-xs uppercase tracking-widest text-muted">
        {t("noResults", lang)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} n={agent.n} lang={lang} />
      ))}
    </div>
  );
}
