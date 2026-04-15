import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output bundles a minimal self-contained server for Electron packaging.
  // See scripts/prepare-electron.js which arranges the final layout.
  output: "standalone",
};

export default nextConfig;
