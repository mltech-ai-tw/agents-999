/**
 * Tail-truncates upstream output before it is appended to the next step's
 * context, keeping the total context field safely under the server's
 * MAX_CONTEXT_CHARS cap. Tail (not head) is preserved so the most recent —
 * and usually most relevant — output survives.
 */
export function truncateUpstream(
  text: string,
  maxChars: number
): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false };
  return { text: text.slice(text.length - maxChars), truncated: true };
}
