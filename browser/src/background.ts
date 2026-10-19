// Firefox and Zen only: dynamic themes do not survive a restart, so paint the window again on startup.
import { firefoxTheme } from "./browser-themes";
import { browserTheme, storage } from "./ext";
import { normalize } from "./settings";
import { effectivePalette } from "./ui/look";

async function paint(): Promise<void> {
  const s = normalize(await storage.get("settings"));
  if (!s.paintBrowser) return;
  const dark = typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches;
  await browserTheme.update(firefoxTheme(effectivePalette(s, dark)));
}

void paint();
storage.onChanged((key) => { if (key === "settings") void paint(); });
if (typeof matchMedia === "function") matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => void paint());
