// Side-effect CSS imports (e.g. `import "./globals.css"`). TypeScript 6 errors
// on side-effect imports of unknown extensions (TS2882) without a declaration.
declare module "*.css";
