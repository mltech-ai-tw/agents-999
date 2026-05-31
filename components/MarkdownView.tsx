"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChartView from "./ChartView";

/**
 * Renders agent output as Markdown (GitHub-flavored — tables, lists, code,
 * blockquotes). LLMs emit Markdown by default; without this the raw `##`, `|`
 * and `**` show up as plain text. Styling lives in `.md-output` in globals.css.
 *
 * Special case: a ```chart fenced block is rendered as a live recharts chart
 * (see ChartView) instead of a code block, so agents can return bar/line/pie
 * charts. `streaming` tells ChartView to show a placeholder while the chart
 * JSON is still arriving (and thus not yet parseable).
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
            const match = /language-chart/.test(className ?? "");
            if (match) {
              return (
                <ChartView
                  raw={String(children).replace(/\n$/, "")}
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
