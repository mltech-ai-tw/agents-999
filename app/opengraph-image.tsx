import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// Dynamically generated Open Graph image (1200×630) used by LinkedIn, X,
// Slack, etc. Content is driven by lib/site.ts so it stays white-label.
// Styled to match the app's editorial design: warm paper, warm ink, vermilion.
export const alt = `${SITE.name} — ${SITE.tagline.en}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const domain = SITE.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f2eee4",
          color: "#1b1a16",
          fontFamily: "serif",
          borderTop: "16px solid #d4371b",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 28,
            letterSpacing: 4,
            color: "#6b6656",
          }}
        >
          <div style={{ display: "flex" }}>{domain}</div>
          <div style={{ display: "flex" }}>001 — 999</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 124,
              fontWeight: 800,
              letterSpacing: -4,
              lineHeight: 1,
            }}
          >
            <span>agents</span>
            <span style={{ color: "#d4371b" }}>-999</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 44,
              marginTop: 30,
              maxWidth: 1000,
              color: "#1b1a16",
            }}
          >
            {SITE.tagline.en}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            color: "#6b6656",
            borderTop: "2px solid #1b1a16",
            paddingTop: 24,
          }}
        >
          Open source · No account · Keys stay in your browser · OpenAI ·
          Anthropic · Gemini · Azure · Ollama
        </div>
      </div>
    ),
    { ...size },
  );
}
