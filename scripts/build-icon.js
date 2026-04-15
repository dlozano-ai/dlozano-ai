// @ts-check
/**
 * Build macOS `.icns` and Windows `.ico` and PNG fallback from build/icon.svg
 * using the `sharp` module that ships transitively with Next.js.
 *
 * Produces:
 *   build/icon.icns  — macOS app bundle icon
 *   build/icon.png   — 1024×1024 fallback
 *   build/icon-*.png — individual size renders (keep for reference)
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.resolve(__dirname, "..");
const SVG = path.join(ROOT, "build", "icon.svg");
const OUT_DIR = path.join(ROOT, "build");

// Sizes required for a macOS .icns
const ICNS_SIZES = [
  { size: 16, type: "ic07" }, // is07 actually, but iconutil handles 16-1024
  { size: 32, type: "ic08" },
  { size: 64, type: "ic09" },
  { size: 128, type: "ic11" },
  { size: 256, type: "ic12" },
  { size: 512, type: "ic13" },
  { size: 1024, type: "ic14" },
];

// ICNS file format: magic "icns" + length + (type + length + data)*
function buildIcns(entries) {
  const headerSize = 8;
  const body = Buffer.concat(
    entries.map(({ type, data }) => {
      const typeBuf = Buffer.from(type, "ascii");
      const lenBuf = Buffer.alloc(4);
      lenBuf.writeUInt32BE(data.length + 8, 0);
      return Buffer.concat([typeBuf, lenBuf, data]);
    })
  );
  const total = headerSize + body.length;
  const header = Buffer.alloc(headerSize);
  header.write("icns", 0, "ascii");
  header.writeUInt32BE(total, 4);
  return Buffer.concat([header, body]);
}

// Correct ICNS OSType codes (Apple spec)
// https://en.wikipedia.org/wiki/Apple_Icon_Image_format
const ICNS_TYPES = {
  16: "icp4",
  32: "icp5",
  64: "icp6",
  128: "ic07",
  256: "ic08",
  512: "ic09",
  1024: "ic10",
};

async function run() {
  if (!fs.existsSync(SVG)) {
    console.error("ERROR: build/icon.svg missing");
    process.exit(1);
  }
  const svgBuf = fs.readFileSync(SVG);

  console.log("→ Rendering PNGs from SVG");
  const entries = [];
  for (const size of [16, 32, 64, 128, 256, 512, 1024]) {
    const png = await sharp(svgBuf, { density: 1024 })
      .resize(size, size)
      .png()
      .toBuffer();
    entries.push({ type: ICNS_TYPES[size], data: png });
    if (size === 1024 || size === 512 || size === 256) {
      fs.writeFileSync(path.join(OUT_DIR, `icon-${size}.png`), png);
    }
    if (size === 1024) {
      fs.writeFileSync(path.join(OUT_DIR, "icon.png"), png);
    }
    console.log(`  ${size}x${size} → ${png.length} bytes`);
  }

  console.log("→ Writing icon.icns");
  const icns = buildIcns(entries);
  fs.writeFileSync(path.join(OUT_DIR, "icon.icns"), icns);
  console.log(`✓ icon.icns (${icns.length} bytes)`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
