"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders a ```mermaid fenced block as an SVG diagram (flowcharts, journeys,
 * sequence, gantt, mindmaps…). Mermaid renders asynchronously and throws on
 * incomplete input, so:
 *   - while `streaming`, we don't attempt a render (the diagram source is still
 *     arriving and would error) — we show a quiet placeholder;
 *   - once complete, we render; on parse error we fall back to the raw source.
 *
 * Mermaid is imported lazily (client-only, ~500kb) so it never bloats the
 * initial bundle or runs during SSR.
 */

let idSeq = 0;

export default function MermaidView({
  code,
  streaming,
}: {
  code: string;
  streaming?: boolean;
}) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const idRef = useRef(`mmd-${++idSeq}`);

  useEffect(() => {
    // Don't render mid-stream: source is partial and mermaid will throw.
    if (streaming) return;

    let cancelled = false;
    const trimmed = code.trim();
    if (!trimmed) return;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict", // no embedded scripts/HTML
          theme: "base",
          themeVariables: {
            fontFamily:
              'var(--font-space-grotesk), "Noto Sans TC", system-ui, sans-serif',
            primaryColor: "#faf7f0",
            primaryBorderColor: "#bdb4a0",
            primaryTextColor: "#1b1a16",
            lineColor: "#837c6f",
            secondaryColor: "#f4e3dd",
            tertiaryColor: "#e8e2d4",
            // journey/section accents
            cScale0: "#d4371b",
            cScale1: "#c08a2d",
            cScale2: "#5b7a6b",
          },
        });
        // validate first so a bad diagram doesn't throw uncaught
        await mermaid.parse(trimmed);
        const { svg } = await mermaid.render(`${idRef.current}-${idSeq}`, trimmed);
        if (!cancelled) {
          setSvg(svg);
          setFailed(false);
        }
      } catch {
        if (!cancelled) {
          setFailed(true);
          setSvg(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, streaming]);

  if (streaming && !svg) {
    return (
      <div className="my-3 border border-dashed border-border bg-surface-2 p-4 font-mono text-xs uppercase tracking-widest text-muted">
        ◷ diagram…
      </div>
    );
  }

  if (failed || (!svg && !streaming)) {
    return (
      <pre className="my-3 overflow-x-auto border border-border bg-surface-2 p-3 text-xs">
        <code>{code}</code>
      </pre>
    );
  }

  if (!svg) return null;

  return (
    <figure
      className="mermaid-figure my-4 overflow-x-auto border border-border bg-surface p-4"
      // SVG is produced by mermaid in strict mode (no scripts); safe to inject.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
