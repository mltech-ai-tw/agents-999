# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) · versions follow [SemVer](https://semver.org/).

## [1.1.0] — 2026-07-11

### Added

- **Cross-model compare** — run the same agent on up to 3 models/providers side by side.
- **Multi-turn conversations** — follow-up questions on any agent run; history is
  validated server-side and never stored.
- **Agent pipelines** (`/pipeline`) — chain agents so the output of one becomes
  the input of the next, with per-step truncation budgets.
- `sitemap.xml`, `robots.txt`, and a generated favicon.
- Browser-language detection: non-Chinese browsers now default to English
  (stored preference always wins).

### Changed

- Canonical URL moved to **https://999-agent.mltech.tw**.
- Open Graph share image restyled to match the editorial design system.
- Toolchain: Next.js 16, React 19.2, TypeScript 6, ESLint 9 flat config,
  Tailwind 4.

## [1.0.0] — 2026-06-14

Initial release: 999 data-driven consultant agents, 7 LLM providers behind one
unified SSE stream, bring-your-own-key (localStorage only, no server secrets),
bilingual EN/繁中, fully self-hostable (no database, no auth).
