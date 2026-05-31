"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/**
 * Renders a data chart from a ```chart fenced code block emitted by an agent.
 *
 * Expected JSON shape (kept deliberately small so an LLM gets it right):
 *   {
 *     "type": "bar" | "line" | "pie",
 *     "title": "optional title",
 *     "data": [ { "name": "Q1", "value": 120 }, ... ],
 *     "series": ["value"]   // optional; for multi-series bar/line
 *   }
 *
 * During streaming the JSON arrives incrementally and won't parse — we render a
 * subtle placeholder until it becomes valid, then swap to the chart. Invalid or
 * unsupported specs fall back to showing the raw JSON so nothing is lost.
 */

type ChartSpec = {
  type: "bar" | "line" | "pie";
  title?: string;
  data: Array<Record<string, string | number>>;
  series?: string[];
};

// Editorial palette — vermilion accent first, then warm/muted companions.
const COLORS = [
  "#d4371b",
  "#1b1a16",
  "#c08a2d",
  "#5b7a6b",
  "#9a6b4f",
  "#6b6459",
  "#b5482f",
  "#3f6f7a",
];

const AXIS = "#837c6f";
const GRID = "#d8d1c1";

function parseSpec(raw: string): ChartSpec | null {
  try {
    const obj = JSON.parse(raw);
    if (
      obj &&
      (obj.type === "bar" || obj.type === "line" || obj.type === "pie") &&
      Array.isArray(obj.data) &&
      obj.data.length > 0
    ) {
      return obj as ChartSpec;
    }
  } catch {
    // incomplete (streaming) or malformed
  }
  return null;
}

/** Infer numeric series keys from the data when not explicitly given. */
function inferSeries(spec: ChartSpec): string[] {
  if (spec.series?.length) return spec.series;
  const first = spec.data[0] ?? {};
  const keys = Object.keys(first).filter(
    (k) => k !== "name" && typeof first[k] === "number"
  );
  return keys.length ? keys : ["value"];
}

export default function ChartView({
  raw,
  streaming,
}: {
  raw: string;
  streaming?: boolean;
}) {
  const spec = parseSpec(raw);

  if (!spec) {
    // Still streaming → quiet placeholder; finished but invalid → show source.
    if (streaming) {
      return (
        <div className="my-3 border border-dashed border-border bg-surface-2 p-4 font-mono text-xs uppercase tracking-widest text-muted">
          ◷ chart…
        </div>
      );
    }
    return (
      <pre className="my-3 overflow-x-auto border border-border bg-surface-2 p-3 text-xs">
        <code>{raw}</code>
      </pre>
    );
  }

  const series = inferSeries(spec);

  return (
    <figure className="my-4 border border-border bg-surface p-4">
      {spec.title && (
        <figcaption className="mb-3 font-mono text-xs uppercase tracking-widest text-foreground-soft">
          {spec.title}
        </figcaption>
      )}
      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          {spec.type === "pie" ? (
            <PieChart>
              <Pie
                data={spec.data}
                dataKey={series[0]}
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                label
              >
                {spec.data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          ) : spec.type === "line" ? (
            <LineChart data={spec.data} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={AXIS} fontSize={12} />
              <YAxis stroke={AXIS} fontSize={12} />
              <Tooltip />
              {series.length > 1 && <Legend />}
              {series.map((s, i) => (
                <Line
                  key={s}
                  type="monotone"
                  dataKey={s}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          ) : (
            <BarChart data={spec.data} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
              <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" stroke={AXIS} fontSize={12} />
              <YAxis stroke={AXIS} fontSize={12} />
              <Tooltip />
              {series.length > 1 && <Legend />}
              {series.map((s, i) => (
                <Bar key={s} dataKey={s} fill={COLORS[i % COLORS.length]} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
