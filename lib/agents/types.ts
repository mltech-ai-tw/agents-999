export type Lang = "zh" | "en";

export type AgentCategory =
  | "product"
  | "brand"
  | "finance"
  | "strategy"
  | "marketing"
  | "legal"
  | "sales"
  | "people"
  | "ops"
  | "dev"
  | "content"
  | "operations"
  | "design";

export type AgentInput = {
  key: string;
  label: string; // Chinese
  labelEn: string; // English
  type: "text" | "textarea" | "select";
  options?: string[]; // for select type
  required: boolean;
  placeholder?: string;
  placeholderEn?: string;
};

/**
 * The flat metadata migrated from the upstream TOOLS_META table.
 * One per agent — see lib/agents/data.ts (auto-generated).
 */
export type AgentMeta = {
  id: string;
  label: string;
  labelEn: string;
  desc: string;
  descEn: string;
  cat: AgentCategory;
};

/**
 * A fully resolved agent: metadata + runnable inputs + prompt builder.
 * Assembled in lib/agents/index.ts from AgentMeta + defaults + overrides.
 */
export type Agent = {
  id: string; // camelCase, unique
  label: string; // Chinese
  labelEn: string; // English
  desc: string; // Chinese
  descEn: string; // English
  cat: AgentCategory;
  inputs: AgentInput[];
  prompt: (inputs: Record<string, string>, lang: Lang) => string;
  model?: string; // override default model, e.g. 'gpt-4o'
  stream: boolean; // always true for v1
};

/**
 * Partial override for a single agent. Anything omitted falls back to the
 * generated defaults. See lib/agents/overrides.ts.
 */
export type AgentOverride = Partial<
  Pick<Agent, "inputs" | "prompt" | "model" | "label" | "labelEn" | "desc" | "descEn">
>;
