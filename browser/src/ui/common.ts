import { faviconUrl } from "../ext";
import { greetingKey } from "../i18n";
import { PALETTES, THEME_IDS } from "../palette";
import type { Shortcut } from "../settings";
import { type Ctx, fmtDate, monogram, timeParts } from "./ctx";
import { button, h, icon } from "./dom";
import { I } from "./icons";

export function themeSwitcher(ctx: Ctx, cls = ""): HTMLElement {
  return h(
    "div",
    { class: `swatches ${cls}`, attrs: { role: "group", "aria-label": ctx.t("theme") } },
    THEME_IDS.map((id) => {
      const p = PALETTES[id];
      return button(p.name, {
        class: "swatch",
        attrs: { "aria-pressed": String(ctx.p.id === id) },
        style: { "--sw-a": p.bg, "--sw-b": p.accent },
        on: { click: () => ctx.store.update((s) => { s.theme = id; }) },
      }, h("span", { class: "dot" }));
    }),
  );
}

export function settingsButton(ctx: Ctx): HTMLElement {
  return button(ctx.t("settings"), { class: "btn-icon", on: { click: () => ctx.openSettings() } }, icon(I.gear));
}

export function editButton(ctx: Ctx): HTMLElement {
  return button(ctx.edit ? ctx.t("done") : ctx.t("edit"), {
    class: `btn-ghost ${ctx.edit ? "on" : ""}`,
    attrs: { "aria-pressed": String(ctx.edit) },
    on: { click: () => ctx.setEdit(!ctx.edit) },
  }, icon(ctx.edit ? I.check : I.pencil), h("span", { text: ctx.edit ? ctx.t("done") : ctx.t("edit") }));
}

export function brand(ctx: Ctx): HTMLElement {
  return h("div", { class: "brand" }, h("span", { class: "brand-dot" }), h("span", { class: "mono", text: `MIKU TAB · ${ctx.p.name.toUpperCase()}` }));
}

/** Live clock. The colon uses the accent so the time reads like a beat. */
export function clock(ctx: Ctx, cls: string): HTMLElement {
  const hh = h("span");
  const mm = h("span");
  const ss = h("span", { class: "clock-sec" });
  const suffix = h("span", { class: "clock-suffix" });
  const el = h("time", { class: `clock ${cls}` }, hh, h("span", { class: "clock-colon", text: ":" }), mm, ctx.s.seconds ? ss : null, suffix);
  ctx.tick((now) => {
    const t = timeParts(now, ctx.s.clock24);
    hh.textContent = t.hh;
    mm.textContent = t.mm;
    ss.textContent = t.ss;
    suffix.textContent = t.suffix;
    el.dateTime = now.toISOString();
  });
  return el;
}

export function dateLine(ctx: Ctx, cls: string, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }): HTMLElement {
  const el = h("div", { class: cls });
  ctx.tick((now) => {
    el.textContent = fmtDate(now, ctx.i18n.intl, opts);
  });
  return el;
}

export function greeting(ctx: Ctx, cls: string, extra?: string): HTMLElement {
  const el = h("div", { class: cls });
  ctx.tick((now) => {
    const base = ctx.t(greetingKey(now.getHours()));
    const named = ctx.s.name.trim() ? `${base}${ctx.t("nameSep")}${ctx.s.name.trim()}` : base;
    el.textContent = extra ? `${named}. ${extra}` : `${named}.`;
  });
  return el;
}

export function equalizer(bars = 56): HTMLElement {
  const items = [];
  for (let i = 0; i < bars; i++) {
    const v = Math.abs(Math.sin(i * 0.55) * 0.6 + Math.sin(i * 1.7 + 1) * 0.4);
    items.push(h("span", {
      class: i % 9 === 4 ? "bar alt" : "bar",
      style: { "--h": `${Math.round(18 + v * 82)}%`, "--d": `${(i % 7) * 0.13}s`, "--o": (0.35 + v * 0.65).toFixed(2) },
    }));
  }
  return h("div", { class: "eq", attrs: { "aria-hidden": "true" } }, items);
}

function face(ctx: Ctx, sc: Shortcut, cls: string): HTMLElement {
  const fav = ctx.s.favicons ? faviconUrl(sc.url) : null;
  if (fav) return h("span", { class: `${cls} has-img` }, h("img", { attrs: { src: fav, alt: "", width: 32, height: 32, loading: "lazy" } }));
  return h("span", { class: cls, text: monogram(sc.name) });
}

function addTile(ctx: Ctx, cls: string): HTMLElement {
  return button(ctx.t("addShortcut"), { class: cls, on: { click: () => ctx.addShortcut() } }, icon(I.plus));
}

export type ShortcutStyle = "setlist" | "grid" | "dock" | "keys";

const SOLFEGE = ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si"];

export function shortcuts(ctx: Ctx, style: ShortcutStyle, limit = 48): HTMLElement {
  const list = ctx.s.shortcuts.slice(0, limit);
  const label = ctx.t("w_shortcuts");
  if (style === "setlist") {
    return h("nav", { class: "setlist", attrs: { "aria-label": label } },
      list.map((sc, i) => h("a", { class: "track", attrs: { href: sc.url, title: sc.url } },
        h("span", { class: "track-no mono", text: String(i + 1).padStart(2, "0") }),
        face(ctx, sc, "track-face"),
        h("span", { class: "track-name", text: sc.name }))),
      addTile(ctx, "track add"));
  }
  if (style === "grid") {
    return h("nav", { class: "link-grid", attrs: { "aria-label": label } },
      list.map((sc, i) => h("a", { class: "link", attrs: { href: sc.url, title: sc.url } },
        face(ctx, sc, `link-face ${i % 4 === 1 ? "solid" : ""}`),
        h("span", { class: "link-name", text: sc.name }))),
      addTile(ctx, "link add"));
  }
  if (style === "dock") {
    return h("nav", { class: "dock", attrs: { "aria-label": label } },
      list.map((sc) => h("a", { class: "dock-item", attrs: { href: sc.url, title: sc.name, "aria-label": sc.name } }, face(ctx, sc, "dock-face"))),
      addTile(ctx, "dock-item add"));
  }
  // Piano: every shortcut is a white key; black keys sit where a real keyboard has them.
  const keys = list.map((sc, i) => h("a", { class: "key", attrs: { href: sc.url, title: sc.url } },
    h("span", { class: "key-note mono", text: SOLFEGE[i % 7] }),
    face(ctx, sc, "key-face"),
    h("span", { class: "key-name", text: sc.name })));
  const blacks = [];
  const total = list.length + 1;
  for (let i = 0; i < total - 1; i++) {
    if ([0, 1, 3, 4, 5].includes(i % 7)) blacks.push(h("span", { class: "black", style: { "--pos": String(i + 1), "--n": String(total) } }));
  }
  return h("nav", { class: "piano", attrs: { "aria-label": label }, style: { "--n": String(total) } },
    keys, addTile(ctx, "key add"), h("div", { class: "blacks", attrs: { "aria-hidden": "true" } }, blacks));
}
