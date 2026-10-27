// Builds the Telegram themes of every variant into dist/:
//   <Name>.attheme          Telegram for Android, colors plus the wallpaper
//   <Name>.tdesktop-theme   Telegram Desktop, a zip of colors.tdesktop-theme and background.png
// bun tools/telegram/build.ts [--out DIR]
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { androidColors, attheme } from "./android";
import { renderArt } from "./art";
import { desktopColors, tdesktopColors } from "./desktop";
import { paletteOf, VARIANTS, type Variant } from "./palette";
import { encodePng } from "./png";
import { writeZip } from "./zip";

/** Telegram names a theme after its file: HatsuneMikuSakuraDark. */
export const fileName = (v: Variant) => v.title.replace(/\s+/g, "");

export const SIZE = { android: [1080, 1920], desktop: [2560, 1440] } as const;

export function buildAndroid(v: Variant): Uint8Array {
  const p = paletteOf(v);
  const [w, h] = SIZE.android;
  return attheme(androidColors(p), encodePng(renderArt(p, w, h), w, h));
}

export function buildDesktop(v: Variant): Uint8Array {
  const p = paletteOf(v);
  const [w, h] = SIZE.desktop;
  return writeZip([
    { name: "colors.tdesktop-theme", data: new TextEncoder().encode(tdesktopColors(desktopColors(p))) },
    { name: "background.png", data: encodePng(renderArt(p, w, h), w, h) },
  ]);
}

if (import.meta.main) {
  const i = process.argv.indexOf("--out");
  const out = i > 0 ? process.argv[i + 1] : "dist";
  mkdirSync(out, { recursive: true });
  for (const v of VARIANTS) {
    for (const [ext, build] of [["attheme", buildAndroid], ["tdesktop-theme", buildDesktop]] as const) {
      const file = join(out, `${fileName(v)}.${ext}`);
      const data = build(v);
      writeFileSync(file, data);
      console.log(`→ ${file} (${Math.round(data.length / 1024)} KB)`);
    }
  }
}
