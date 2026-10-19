import { BangIndex, type BangRow } from "./bangs";
import { assetUrl, uiLanguage } from "./ext";
import { makeI18n, resolveLang } from "./i18n";
import { Store } from "./store";
import type { Ctx } from "./ui/ctx";
import { fill, h } from "./ui/dom";
import { LAYOUT_RENDERERS } from "./ui/layouts";
import { applyLook, effectivePalette } from "./ui/look";
import { installSearchHotkeys } from "./ui/search";
import { addShortcutDialog, SettingsPanel } from "./ui/settings-panel";
import { bundledUrl, wallpaperUrl } from "./wallpaper";

async function main(): Promise<void> {
  const store = await Store.load();
  const dark = matchMedia("(prefers-color-scheme: dark)");
  const root = document.getElementById("app")!;
  const panel = new SettingsPanel();
  let bangs: BangIndex | null = null;
  let edit = false;
  let disposers: (() => void)[] = [];
  let ticks: ((d: Date) => void)[] = [];
  let ctx: Ctx;

  const loadBangs = async () => {
    try {
      const rows = (await (await fetch(assetUrl("bangs.json"))).json()) as BangRow[];
      bangs = new BangIndex(rows);
      if (panel.isOpen) panel.refresh(ctx);
    } catch (e) {
      console.warn("bangs unavailable", e);
    }
  };

  const render = async () => {
    // Inputs that trigger a re-render (add a task, add an event) get their focus back afterwards.
    const focusKey = (document.activeElement as HTMLElement | null)?.dataset?.focus;
    for (const d of disposers) d();
    disposers = [];
    ticks = [];
    const s = store.s;
    const i18n = makeI18n(resolveLang(s.locale, uiLanguage()));
    const p = effectivePalette(s, dark.matches);
    const wall = s.wallpaper.kind === "image" ? await wallpaperUrl() : s.wallpaper.kind === "bundled" ? await bundledUrl(p.id) : null;
    ctx = {
      store,
      s,
      i18n,
      t: i18n.t,
      p,
      wallpaper: wall,
      edit,
      bangs: () => bangs,
      tick: (fn) => { ticks.push(fn); fn(new Date()); },
      onDispose: (fn) => { disposers.push(fn); },
      setEdit: (v) => { edit = v; void render(); },
      openSettings: (section) => panel.open(ctx, section),
      addShortcut: () => addShortcutDialog(ctx),
      rerender: () => void render(),
    };
    applyLook(ctx);
    document.body.classList.toggle("has-image", !!wall);
    fill(root,
      wall ? h("div", { class: "wall", attrs: { "aria-hidden": "true" }, style: { "background-image": `url("${wall}")` } }) : null,
      LAYOUT_RENDERERS[s.layout](ctx),
    );
    if (focusKey) root.querySelector<HTMLElement>(`[data-focus="${focusKey}"]`)?.focus();
    panel.refresh(ctx);
  };

  store.subscribe(() => void render());
  dark.addEventListener("change", () => { if (store.s.followSystem) void render(); });
  setInterval(() => {
    const now = new Date();
    for (const fn of ticks) fn(now);
  }, 1000);
  installSearchHotkeys();
  await render();
  document.documentElement.classList.add("ready");
  void loadBangs();
}

void main();
