import { notFound } from "next/navigation";
import { ALL_AGENTS, getAgent } from "@/lib/agents";
import AgentRunner, { type AgentView } from "@/components/AgentRunner";

type Params = Promise<{ id: string }>;

// Pre-render every agent page at build time.
export function generateStaticParams() {
  return ALL_AGENTS.map((agent) => ({ id: agent.id }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) return { title: "Agent not found — agents-999" };
  return {
    title: `${agent.label} (${agent.labelEn}) — agents-999`,
    description: agent.descEn,
  };
}

export default async function ToolPage({ params }: { params: Params }) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) notFound();

  // Pass only serialisable fields to the client (no prompt closure).
  const view: AgentView = {
    id: agent.id,
    label: agent.label,
    labelEn: agent.labelEn,
    desc: agent.desc,
    descEn: agent.descEn,
    cat: agent.cat,
    inputs: agent.inputs,
    model: agent.model,
  };

  return <AgentRunner agent={view} />;
}
