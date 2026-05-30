import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "agents-999 — 999 AI Consultant Agents, Bring Your Own Key",
  description:
    "999 free AI consultant agents. Bring your own API key (OpenAI, Anthropic, Gemini, Ollama, Mistral, Groq, Azure). No account, keys stay in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>{children}</body>
    </html>
  );
}
