import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Generate default OG PNG
const svgBuffer = readFileSync(join(root, "public", "og-default.svg"));
await sharp(svgBuffer).png().toFile(join(root, "public", "og-default.png"));

console.log("Generated og-default.png");
