import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

// Dynamically generated Open Graph image (1200×630) used by LinkedIn, X,
// Slack, etc. Content is driven by lib/site.ts so it stays white-label.
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
          padding: "80px",
          background: "linear-gradient(135deg, #0a0a0b 0%, #1b1b20 100%)",
          color: "#f5f5f4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#a1a1aa",
            letterSpacing: 3,
          }}
        >
          {domain}
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 120,
              fontWeight: 800,
              letterSpacing: -3,
              lineHeight: 1,
            }}
          >
            {SITE.name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 46,
              color: "#e4e4e7",
              marginTop: 28,
              maxWidth: 980,
            }}
          >
            {SITE.tagline.en}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 27,
            color: "#71717a",
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
