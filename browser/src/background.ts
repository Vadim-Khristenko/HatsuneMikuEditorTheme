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

// Firefox for Android cannot replace the new tab, so the add-on button opens the page instead.
// On desktop the same button is a shortcut to it.
declare const browser: any; // eslint-disable-line @typescript-eslint/no-explicit-any
browser?.action?.onClicked?.addListener(() => {
  void browser.tabs.create({ url: browser.runtime.getURL("newtab.html") });
});
if (typeof matchMedia === "function") matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => void paint());
