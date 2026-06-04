import type { AgentOverride } from "../types";
import { BRAND_OVERRIDES } from "./brand";
import { CONTENT_OVERRIDES } from "./content";
import { DEV_OVERRIDES } from "./dev";
import { FINANCE_OVERRIDES } from "./finance";
import { LEGAL_OVERRIDES } from "./legal";
import { MARKETING_OVERRIDES } from "./marketing";
import { OPERATIONS_OVERRIDES } from "./operations";
import { OPS_OVERRIDES } from "./ops";
import { PEOPLE_OVERRIDES } from "./people";
import { PRODUCT_OVERRIDES } from "./product";
import { SALES_OVERRIDES } from "./sales";
import { STRATEGY_OVERRIDES } from "./strategy";

/**
 * Per-agent customisations, keyed by agent id. Anything set here overrides the
 * generated defaults (inputs / prompt / model / labels); everything else falls
 * back to the auto-generated metadata + generic prompt builder.
 *
 * Overrides are split into one file per category for maintainability. To tune
 * an agent, edit its category file (e.g. ./strategy.ts) — never the generated
 * data.ts. New helpers for concise authoring live in ./helpers.ts. See
 * CONTRIBUTING.md.
 */
export const AGENT_OVERRIDES: Record<string, AgentOverride> = {
  ...BRAND_OVERRIDES,
  ...CONTENT_OVERRIDES,
  ...DEV_OVERRIDES,
  ...FINANCE_OVERRIDES,
  ...LEGAL_OVERRIDES,
  ...MARKETING_OVERRIDES,
  ...OPERATIONS_OVERRIDES,
  ...OPS_OVERRIDES,
  ...PEOPLE_OVERRIDES,
  ...PRODUCT_OVERRIDES,
  ...SALES_OVERRIDES,
  ...STRATEGY_OVERRIDES,
};
