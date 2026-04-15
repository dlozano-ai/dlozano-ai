// @ts-check
/**
 * Rearranges the Next.js `standalone` build output into a single directory
 * (`app-dist/`) that electron-builder can ship as extra resources.
 *
 * After `next build --output=standalone`, we have:
 *   .next/standalone/server.js
 *   .next/standalone/node_modules/...
 *   .next/standalone/.next/server/...
 * But `.next/static/` and `public/` are NOT copied into standalone — the
 * runtime expects to find them next to the server. So we stage the final
 * layout into app-dist/ and point electron-builder at it.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const STANDALONE = path.join(ROOT, ".next", "standalone");
const STATIC = path.join(ROOT, ".next", "static");
const PUBLIC = path.join(ROOT, "public");
const OUT = path.join(ROOT, "app-dist");

function rimraf(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isSymbolicLink()) {
      const link = fs.readlinkSync(s);
      try {
        fs.symlinkSync(link, d);
      } catch {
        fs.copyFileSync(s, d);
      }
    } else fs.copyFileSync(s, d);
  }
}

function main() {
  if (!fs.existsSync(STANDALONE)) {
    console.error(
      "ERROR: .next/standalone not found. Run `next build` with `output: 'standalone'` first."
    );
    process.exit(1);
  }

  console.log("→ Clearing app-dist/");
  rimraf(OUT);

  console.log("→ Copying .next/standalone/ → app-dist/");
  copyDir(STANDALONE, OUT);

  console.log("→ Copying .next/static/ → app-dist/.next/static/");
  copyDir(STATIC, path.join(OUT, ".next", "static"));

  if (fs.existsSync(PUBLIC)) {
    console.log("→ Copying public/ → app-dist/public/");
    copyDir(PUBLIC, path.join(OUT, "public"));
  }

  console.log("✓ app-dist/ is ready for electron-builder.");
}

main();
