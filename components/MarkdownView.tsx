"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChartView from "./ChartView";
import MermaidView from "./MermaidView";

/**
 * Renders agent output as Markdown (GitHub-flavored — tables, lists, code,
 * blockquotes). LLMs emit Markdown by default; without this the raw `##`, `|`
 * and `**` show up as plain text. Styling lives in `.md-output` in globals.css.
 *
 * Special cases:
 *  - a ```chart fenced block → live recharts chart (ChartView), so agents can
 *    return bar/line/pie charts.
 *  - a ```mermaid fenced block → SVG diagram (MermaidView), for flowcharts,
 *    journey maps, sequence/gantt diagrams.
 * `streaming` tells both to show a placeholder while the block is still
 * arriving (and thus not yet parseable).
 *
 * Memoized so streaming re-renders (one per delta) only re-parse when the text
 * actually changes.
 */
function MarkdownViewBase({
  text,
  streaming,
}: {
  text: string;
  streaming?: boolean;
}) {
  return (
    <div className="md-output">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children } = props;
            const cls = className ?? "";
            if (/language-chart/.test(cls)) {
              return (
                <ChartView
                  raw={String(children).replace(/\n$/, "")}
                  streaming={streaming}
                />
              );
            }
            if (/language-mermaid/.test(cls)) {
              return (
                <MermaidView
                  code={String(children).replace(/\n$/, "")}
                  streaming={streaming}
                />
              );
            }
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownViewBase);
