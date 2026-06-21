// Flat config for ESLint 10 + eslint-config-next 16 (Next.js 16 removed
// `next lint`; lint now runs the ESLint CLI directly via `npm run lint`).
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "next-env.d.ts",
      "lib/agents/data.ts", // auto-generated
    ],
  },
  ...nextCoreWebVitals,
];

export default config;
