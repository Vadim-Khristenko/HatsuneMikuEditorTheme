import type { BangIndex, BangRow } from "./bangs";
import { buildIndex } from "./search";
import { assetUrl, uiLanguage } from "./ext";
import { makeI18n, resolveLang } from "./i18n";
import { Store } from "./store";
import type { Ctx } from "./ui/ctx";
import { button, fill, h, icon } from "./ui/dom";
import { I } from "./ui/icons";
import { LAYOUT_RENDERERS } from "./ui/layouts";
import { applyLook, effectivePalette } from "./ui/look";
import { installSearchHotkeys } from "./ui/search";
import { celebrate } from "./ui/effects";
import { preloadIcons } from "./ui/favicons";
import { occasionOf } from "./greetings";
import { addShortcutDialog, SettingsPanel } from "./ui/settings-panel";
import { bundledUrl, itemUrl, rotate, type Step, WallLayer } from "./wallpaper";
import type { Settings } from "./settings";
import type { Palette } from "./palette";

async function main(): Promise<void> {
  const store = await Store.load();
  preloadIcons(store.s.shortcuts, store.s.icons);
  const dark = matchMedia("(prefers-color-scheme: dark)");
  const root = document.getElementById("app")!;
  const panel = new SettingsPanel();
  let bangRows: BangRow[] | null = null;
  let bangs: BangIndex | null = null;
  let bangsFor = "";
  // Rebuilt only when the user's own bangs change; 10k rows take a few milliseconds.
  const currentBangs = () => {
    if (!bangRows) return null;
    const key = JSON.stringify(store.s.search.myBangs);
    if (!bangs || key !== bangsFor) {
      bangs = buildIndex(bangRows, store.s.search.myBangs);
      bangsFor = key;
    }
    return bangs;
  };
  let edit = false;
  let disposers: (() => void)[] = [];
  let ticks: ((d: Date) => void)[] = [];
  let ctx: Ctx;
  const seed = Math.random();

  const loadBangs = async () => {
    try {
      bangRows = (await (await fetch(assetUrl("bangs.json"))).json()) as BangRow[];
      if (panel.isOpen) panel.refresh(ctx);
    } catch (e) {
      console.warn("bangs unavailable", e);
    }
  };

  let lastLook = "";
  let first = true;
  const wall = new WallLayer();
  let wallKey = "";

  const activePlaylist = (s: Settings) => s.wallpaper.playlists.find((pl) => pl.id === s.wallpaper.active) ?? null;
  const wallUrl = async (s: Settings, p: Palette, step: Step): Promise<string | null> => {
    if (s.wallpaper.kind === "bundled") return bundledUrl(p.id);
    if (s.wallpaper.kind !== "playlist") return null;
    const pl = activePlaylist(s);
    const item = pl ? await rotate(pl, step) : null;
    return item ? itemUrl(item) : null;
  };
  const stepWall = async (step: Step) => {
    if (store.s.wallpaper.kind !== "playlist") return;
    wall.show(await wallUrl(store.s, ctx.p, step));
  };
  setInterval(() => void stepWall("timer"), 30_000);

  const render = async () => {
    // Inputs that trigger a re-render (add a task, add an event) get their focus back afterwards.
    const focusKey = (document.activeElement as HTMLElement | null)?.dataset?.focus;
    for (const d of disposers) d();
    disposers = [];
    ticks = [];
    const s = store.s;
    const i18n = makeI18n(resolveLang(s.locale, uiLanguage()));
    const p = effectivePalette(s, dark.matches);
    // The carousel moves on page open; edits to the playlist only re-check it.
    const pl = activePlaylist(s);
    const key = `${s.wallpaper.kind}|${s.wallpaper.kind === "bundled" ? p.id : ""}|${pl?.id ?? ""}|${pl?.items.join(",") ?? ""}|${pl?.every ?? ""}`;
    if (key !== wallKey) {
      wallKey = key;
      wall.show(await wallUrl(s, p, first ? "open" : "timer"));
    }
    ctx = {
      store,
      s,
      i18n,
      t: i18n.t,
      p,
      wallpaper: wall.url,
      edit,
      seed,
      bangs: currentBangs,
      tick: (fn) => { ticks.push(fn); fn(new Date()); },
      onDispose: (fn) => { disposers.push(fn); },
      setEdit: (v) => { edit = v; void render(); },
      openSettings: (section) => panel.open(ctx, section),
      addShortcut: () => addShortcutDialog(ctx),
      rerender: () => void render(),
      wallStep: (dir) => void stepWall(dir > 0 ? "next" : "prev"),
    };
    applyLook(ctx);
    const carousel = s.wallpaper.kind === "playlist" && (pl?.items.length ?? 0) > 1;
    fill(root,
      LAYOUT_RENDERERS[s.layout](ctx),
      carousel
        ? h("div", { class: "wall-nav" },
            button(i18n.t("wallPrev"), { class: "btn-icon small", on: { click: () => ctx.wallStep(-1) } }, icon(I.left)),
            button(i18n.t("wallNext"), { class: "btn-icon small", on: { click: () => ctx.wallStep(1) } }, icon(I.right)))
        : null,
    );
    if (focusKey) root.querySelector<HTMLElement>(`[data-focus="${focusKey}"]`)?.focus();
    // Entrance animation only when the page opens or the layout changes, not on every task tick.
    const look = `${s.layout}`;
    if (look !== lastLook) {
      lastLook = look;
      root.classList.remove("enter");
      void root.offsetWidth;
      root.classList.add("enter");
      setTimeout(() => root.classList.remove("enter"), 1400);
    }
    document.documentElement.classList.toggle("no-motion", !s.motion);
    celebrate(occasionOf(new Date(), s.birthday), s.motion);
    first = false;
    panel.refresh(ctx);
  };

  // Theme and layout switches cross-fade through the View Transitions API where the browser has it.
  let prevKey = "";
  const lookKey = () => `${store.s.theme}|${store.s.layout}|${store.s.followSystem}|${store.s.wallpaper.kind}`;
  store.subscribe(() => {
    const key = lookKey();
    const changed = key !== prevKey;
    prevKey = key;
    const vt = (document as Document & { startViewTransition?: (cb: () => Promise<void>) => unknown }).startViewTransition;
    if (changed && !first && vt && store.s.motion && !matchMedia("(prefers-reduced-motion: reduce)").matches) vt.call(document, () => render());
    else void render();
  });
  prevKey = lookKey();
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
