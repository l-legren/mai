// CSS is only consumed on web (via Metro/webpack); on native these imports are side-effect no-ops.
// This ambient declaration lets TypeScript resolve the side-effect imports.
declare module '*.css';
