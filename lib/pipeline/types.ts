export type StepStatus = "idle" | "running" | "done" | "error" | "skipped";

/**
 * One step in a pipeline. The agent runs with empty inputs; the actual
 * material is delivered via the route's `context` field (instruction +
 * upstream output). Immutable — all updates return new copies.
 */
export type PipelineStep = {
  readonly id: string; // crypto.randomUUID() at creation
  readonly agentId: string; // '' = not yet chosen
  readonly instruction: string; // user-typed instruction for this step
  readonly output: string; // accumulated streamed text; '' when idle
  readonly status: StepStatus;
  readonly error: string | null;
};
