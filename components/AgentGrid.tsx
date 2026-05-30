import type { AgentMeta } from "@/lib/agents/types";
import { t, type Lang } from "@/lib/i18n";
import AgentCard from "./AgentCard";

export default function AgentGrid({
  agents,
  lang,
}: {
  agents: AgentMeta[];
  lang: Lang;
}) {
  if (agents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted">
        {t("noResults", lang)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} lang={lang} />
      ))}
    </div>
  );
}
