import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Standalone output bundles a minimal self-contained server for Electron packaging.
  // See scripts/prepare-electron.js which arranges the final layout.
  output: "standalone",

  // Pin the trace root to this project so standalone paths stay relative and
  // portable into the Electron resources bundle. Without this, tracing walks
  // up to the nearest lockfile and embeds absolute host paths that break
  // once the app is moved into /Applications.
  outputFileTracingRoot: path.resolve(__dirname),

  // Sharp ships native binaries per arch and pulls in ~100MB of @img/* vendor
  // bundles we don't need at runtime (only used by scripts/build-icon.js at
  // build time). Excluding it keeps the .dmg small and sidesteps the
  // universal-binary merge failure in electron-builder.
  outputFileTracingExcludes: {
    "/*": [
      "node_modules/@img/**",
      "node_modules/sharp/**",
    ],
  },
};

export default nextConfig;
