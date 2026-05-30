import { AGENT_DATA } from "./data";
import { DEFAULT_INPUTS } from "./inputs";
import { AGENT_OVERRIDES } from "./overrides";
import { buildPrompt } from "./prompt";
import type { Agent, AgentCategory, AgentMeta } from "./types";

function resolveAgent(meta: AgentMeta): Agent {
  const override = AGENT_OVERRIDES[meta.id] ?? {};
  const inputs = override.inputs ?? DEFAULT_INPUTS;

  const prompt =
    override.prompt ??
    ((values: Record<string, string>, lang: "zh" | "en") =>
      buildPrompt(meta, inputs, values, lang));

  return {
    id: meta.id,
    label: override.label ?? meta.label,
    labelEn: override.labelEn ?? meta.labelEn,
    desc: override.desc ?? meta.desc,
    descEn: override.descEn ?? meta.descEn,
    cat: meta.cat,
    inputs,
    prompt,
    model: override.model,
    stream: true,
  };
}

/** All 999 agents, fully resolved. */
export const ALL_AGENTS: Agent[] = AGENT_DATA.map(resolveAgent);

const AGENT_BY_ID = new Map<string, Agent>(
  ALL_AGENTS.map((agent) => [agent.id, agent])
);

/** Look up a single agent by id. Returns undefined if not found. */
export function getAgent(id: string): Agent | undefined {
  return AGENT_BY_ID.get(id);
}

/** List agents, optionally filtered by category. */
export function listAgents(cat?: AgentCategory): Agent[] {
  if (!cat) return ALL_AGENTS;
  return ALL_AGENTS.filter((agent) => agent.cat === cat);
}

/** Total number of agents. */
export const AGENT_COUNT = ALL_AGENTS.length;

/** Distinct categories present in the data, in descending count order. */
export function listCategories(): { cat: AgentCategory; count: number }[] {
  const counts = new Map<AgentCategory, number>();
  for (const agent of ALL_AGENTS) {
    counts.set(agent.cat, (counts.get(agent.cat) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([cat, count]) => ({ cat, count }))
    .sort((a, b) => b.count - a.count);
}

export type { Agent, AgentCategory, AgentInput, AgentMeta, Lang } from "./types";
