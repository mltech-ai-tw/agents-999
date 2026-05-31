"use client";

import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders agent output as Markdown (GitHub-flavored — tables, lists, code,
 * blockquotes). LLMs emit Markdown by default; without this the raw `##`, `|`
 * and `**` show up as plain text. Styling lives in `.md-output` in globals.css.
 *
 * Memoized so streaming re-renders (one per delta) only re-parse when the text
 * actually changes.
 */
function MarkdownViewBase({ text }: { text: string }) {
  return (
    <div className="md-output">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}

export default memo(MarkdownViewBase);
