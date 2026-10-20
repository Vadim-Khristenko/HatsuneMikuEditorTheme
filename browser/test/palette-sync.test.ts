import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PALETTES, THEME_IDS } from "../src/palette";

// The JetBrains wallpaper art is drawn in Java from its own copy of the accents.
test("JetBrains art uses the new tab accents", () => {
  const java = readFileSync(join(import.meta.dir, "..", "..", "jetbrains", "src", "main", "java", "com", "github", "vadimkhristenko", "hatsunemikutheme", "MikuTheme.java"), "utf8");
  for (const id of THEME_IDS) {
    const row = new RegExp(`"${id}", (true|false), 0x([0-9a-f]{6}), 0x([0-9a-f]{6})`).exec(java);
    expect(row, id).not.toBeNull();
    expect(`#${row![2]}`).toBe(PALETTES[id].accent);
    expect(`#${row![3]}`).toBe(PALETTES[id].accent2);
    expect(row![1] === "true").toBe(PALETTES[id].dark);
  }
});
