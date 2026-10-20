import { browserTheme, canBrowserSearch, dataConsent, fontSettings, type GenericFamily, isFirefox, siteAccess } from "../ext";
import { usesRemoteIcons } from "./favicons";
import { LANG_NAMES, type Lang } from "../i18n";
import type { MessageKey } from "../locales/en";
import { PALETTES, THEME_IDS } from "../palette";
import { ENGINE_URLS } from "../search";
import { ENGINES, FONTS, hasTerms, ICON_MODES, LAYOUTS, normalize, normalizeUrl, ROTATIONS, uid, WALLPAPERS, WIDGETS, type EngineId, type FontId, type IconMode, type Playlist, type Rotation } from "../settings";
import { bundledList, clearImages, deleteImage, itemUrl, saveImage } from "../wallpaper";
import { findCity } from "../weather";
import { type Ctx, FONT_STACKS, hostOf } from "./ctx";
import { button, fill, h, icon } from "./dom";
import { I } from "./icons";
import { applyLook } from "./look";

const SECTIONS = ["appearance", "personal", "fonts", "wallpaper", "widgets", "search", "shortcuts", "weather", "lines", "data"] as const;
type Section = (typeof SECTIONS)[number];

const FOCUSABLE = "a[href], button, input, select, textarea";

const FONT_NAMES: Record<FontId, string> = { onest: "Onest", unbounded: "Unbounded", mplus: "M PLUS Rounded 1c", jetbrains: "JetBrains Mono", system: "" };

function sw(label: string, checked: boolean, onChange: (v: boolean) => void, hint?: string): HTMLElement {
  return h("button", {
    class: "switch-row",
    attrs: { type: "button", role: "switch", "aria-checked": String(checked) },
    on: { click: (e: MouseEvent) => {
      const b = e.currentTarget as HTMLButtonElement;
      const v = b.getAttribute("aria-checked") !== "true";
      b.setAttribute("aria-checked", String(v));
      onChange(v);
    } },
  }, h("span", { class: "switch-text" }, h("span", { text: label }), hint ? h("span", { class: "muted small", text: hint }) : null), h("span", { class: "switch", attrs: { "aria-hidden": "true" } }));
}

function field(label: string, control: HTMLElement, hint?: string): HTMLElement {
  return h("label", { class: "field-row" }, h("span", { class: "field-label" }, h("span", { text: label }), hint ? h("span", { class: "muted small", text: hint }) : null), control);
}

function select<T extends string>(value: T, options: [T, string][], onChange: (v: T) => void, style?: (v: T) => string): HTMLSelectElement {
  const el = h("select", { class: "field", on: { change: (e: Event) => onChange((e.target as HTMLSelectElement).value as T) } },
    options.map(([v, label]) => h("option", { attrs: { value: v, selected: v === value }, style: style ? { "font-family": style(v) } : undefined, text: label })));
  el.value = value;
  return el;
}

function section(id: Section, title: string, ...children: (Node | null | false)[]): HTMLElement {
  return h("section", { class: "set-section", attrs: { id: `set-${id}`, "aria-labelledby": `set-${id}-h` } }, h("h3", { attrs: { id: `set-${id}-h` }, text: title }), ...children);
}

const SECTION_TITLE: Record<Section, MessageKey> = {
  appearance: "s_appearance", personal: "s_personal", fonts: "s_fonts", wallpaper: "s_wallpaper", widgets: "s_widgets",
  search: "s_search", shortcuts: "s_shortcuts", weather: "s_weather", lines: "s_lines", data: "s_data",
};

export class SettingsPanel {
  private dialog: HTMLDialogElement;
  private content: HTMLElement;
  private nav: HTMLElement;
  private ctx!: Ctx;

  constructor() {
    this.content = h("div", { class: "set-content" });
    this.nav = h("nav", { class: "set-nav" });
    this.dialog = h("dialog", { class: "settings", on: { click: (e: MouseEvent) => { if (e.target === this.dialog) this.dialog.close(); } } },
      h("div", { class: "set-shell" }, this.nav, this.content));
    document.body.append(this.dialog);
  }

  get isOpen(): boolean {
    return this.dialog.open;
  }

  open(ctx: Ctx, focus?: string): void {
    this.ctx = ctx;
    this.render();
    if (!this.dialog.open) this.dialog.showModal();
    const target = focus ? this.content.querySelector(`#set-${focus}`) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else this.content.scrollTop = 0;
  }

  /** Re-draws while open, keeping the scroll position (theme and layout changes restyle the panel too). */
  refresh(ctx: Ctx): void {
    this.ctx = ctx;
    if (!this.dialog.open) return;
    const top = this.content.scrollTop;
    // Controls are rebuilt in the same order, so the focused one is found again by position.
    const focusables = () => [...this.dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const at = focusables().indexOf(document.activeElement as HTMLElement);
    this.render();
    this.content.scrollTop = top;
    if (at >= 0) focusables()[at]?.focus({ preventScroll: true });
  }

  private render(): void {
    const { t } = this.ctx;
    this.dialog.setAttribute("aria-label", t("settings"));
    fill(this.nav,
      h("span", { class: "set-title display", text: t("settings") }),
      SECTIONS.map((s) => h("a", { attrs: { href: `#set-${s}` }, on: { click: (e: MouseEvent) => { e.preventDefault(); this.content.querySelector(`#set-${s}`)?.scrollIntoView({ block: "start", behavior: "smooth" }); } }, text: t(SECTION_TITLE[s]) })),
      h("span", { class: "set-foot mono muted small", text: "HatsuneMikuEditor · MIT" }),
    );
    fill(this.content,
      h("div", { class: "set-close" }, button(t("close"), { class: "btn-icon", on: { click: () => this.dialog.close() } }, icon(I.x))),
      this.appearance(), this.personal(), this.fonts(), this.wallpaper(), this.widgets(), this.search(), this.shortcuts(), this.weather(), this.lines(), this.data(),
    );
  }

  private appearance(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    return section("appearance", t("s_appearance"),
      h("div", { class: "theme-cards" }, THEME_IDS.map((id) => {
        const p = PALETTES[id];
        return h("button", {
          class: "theme-card",
          attrs: { type: "button", "aria-pressed": String(s.theme === id) },
          on: { click: () => ctx.store.update((x) => { x.theme = id; }) },
        }, h("span", { class: "tc-preview", style: { background: p.bg, color: p.fg, "border-color": p.line } },
          h("span", { class: "tc-dots" }, h("span", { style: { background: p.accent } }), h("span", { style: { background: p.accent2 } })),
          h("span", { class: "tc-time display", text: "21:39" }),
          h("span", { class: "tc-bar", style: { background: p.card } })), h("span", { text: p.name }));
      })),
      sw(t("followSystem"), s.followSystem, (v) => ctx.store.update((x) => { x.followSystem = v; })),
      sw(t("motion"), s.motion, (v) => ctx.store.update((x) => { x.motion = v; }), t("motionHint")),
      browserTheme.available
        ? sw(t("paintBrowser"), s.paintBrowser, (v) => {
            ctx.store.update((x) => { x.paintBrowser = v; });
            if (!v) void browserTheme.reset();
          }, t("paintBrowserHint"))
        : h("p", { class: "hint", text: t("colorfulHint") }),
      h("h4", { text: t("layout") }),
      h("div", { class: "layout-cards" }, LAYOUTS.map((l) => h("button", {
        class: "layout-card",
        attrs: { type: "button", "aria-pressed": String(s.layout === l) },
        on: { click: () => ctx.store.update((x) => { x.layout = l; }) },
      }, h("span", { class: `lc-pic lc-${l}`, attrs: { "aria-hidden": "true" } }, h("i"), h("i"), h("i")),
        h("span", { class: "lc-name", text: t(`l_${l}` as MessageKey) }),
        h("span", { class: "muted small", text: t(`ld_${l}` as MessageKey) })))),
      field(t("language"), select(s.locale, [["auto", t("langAuto")], ...(Object.keys(LANG_NAMES) as Lang[]).map((l): [typeof s.locale, string] => [l, LANG_NAMES[l]])], (v) => ctx.store.update((x) => { x.locale = v; }))),
    );
  }

  private personal(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    const name = h("input", { class: "field", attrs: { id: "set-name", type: "text", maxlength: 40, value: s.name, autocomplete: "given-name" } });
    name.addEventListener("change", () => ctx.store.update((x) => { x.name = name.value; }));
    const today = new Date().toISOString().slice(0, 10);
    const bday = h("input", { class: "field", attrs: { id: "set-bday", type: "date", value: s.birthday, min: "1900-01-01", max: today, autocomplete: "bday" } });
    bday.addEventListener("change", () => ctx.store.update((x) => { x.birthday = bday.value; }));
    return section("personal", t("s_personal"),
      field(t("yourName"), name, t("yourNameHint")),
      field(t("birthday"), h("div", { class: "row" }, bday,
        s.birthday ? button(t("clear"), { class: "btn-icon tiny", on: { click: () => ctx.store.update((x) => { x.birthday = ""; }) } }, icon(I.x)) : null), t("birthdayHint")),
      sw(t("clock24"), s.clock24, (v) => ctx.store.update((x) => { x.clock24 = v; })),
      sw(t("seconds"), s.seconds, (v) => ctx.store.update((x) => { x.seconds = v; })),
    );
  }

  private fonts(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    const opts = FONTS.map((f): [FontId, string] => [f, FONT_NAMES[f] || t("fontSystem")]);
    const sites = h("div", { class: "site-fonts" });
    if (!fontSettings.available) sites.append(h("p", { class: "hint", text: t("siteFontsUnsupported") }));
    else void this.siteFonts(sites);
    return section("fonts", t("s_fonts"),
      field(t("uiFont"), select(s.fonts.ui, opts, (v) => ctx.store.update((x) => { x.fonts.ui = v; }), (v) => FONT_STACKS[v])),
      field(t("displayFont"), select(s.fonts.display, opts, (v) => ctx.store.update((x) => { x.fonts.display = v; }), (v) => FONT_STACKS[v])),
      h("h4", { text: t("siteFonts") }),
      h("p", { class: "hint", text: t("siteFontsHint") }),
      sites,
    );
  }

  private async siteFonts(box: HTMLElement): Promise<void> {
    const { t } = this.ctx;
    const list = await fontSettings.list().catch(() => []);
    const families: [GenericFamily, MessageKey][] = [["standard", "siteStandard"], ["sansserif", "siteSans"], ["serif", "siteSerif"], ["fixed", "siteFixed"]];
    for (const [fam, label] of families) {
      const current = await fontSettings.get(fam).catch(() => ({ fontId: "", levelOfControl: "" }));
      const opts: [string, string][] = [["", t("siteDefault")], ...list.map((f): [string, string] => [f.fontId, f.displayName])];
      box.append(field(t(label), select(current.levelOfControl === "controlled_by_this_extension" ? current.fontId : "", opts,
        (v) => void fontSettings.set(fam, v || null), (v) => (v ? `'${v}'` : "inherit"))));
    }
  }

  private wallpaper(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    const range = (key: "dim" | "blur", max: number, label: string) => {
      const r = h("input", { class: "range", attrs: { type: "range", min: 0, max, value: s.wallpaper[key] } });
      r.addEventListener("input", () => {
        ctx.store.update((x) => { x.wallpaper[key] = Number(r.value); }, true);
        applyLook(ctx);
      });
      return field(label, r);
    };
    const labels: Record<(typeof WALLPAPERS)[number], MessageKey> = { art: "wallpaperArt", bundled: "wallpaperBundled", playlist: "wallpaperPlaylist", none: "wallpaperNone" };
    const kinds = h("div", { class: "segmented", attrs: { role: "group", "aria-label": t("s_wallpaper") } });
    const playlists = h("div", { class: "playlists" });
    void bundledList().then((set) => {
      fill(kinds, WALLPAPERS.filter((k) => k !== "bundled" || set.length > 0).map((k) => h("button", {
        attrs: { type: "button", "aria-pressed": String(s.wallpaper.kind === k) },
        on: { click: () => ctx.store.update((x) => {
          x.wallpaper.kind = k;
          if (k === "playlist" && !x.wallpaper.playlists.length) {
            const id = uid();
            x.wallpaper.playlists.push({ id, name: "", items: set.map((f) => `set:${f}`), every: "tab", shuffle: false });
            x.wallpaper.active = id;
          }
        }) },
        text: t(labels[k]),
      })));
      fill(playlists, this.playlistEditor(set));
    });
    return section("wallpaper", t("s_wallpaper"),
      kinds,
      playlists,
      range("dim", 90, t("dim")),
      range("blur", 40, t("blur")),
    );
  }

  private playlistEditor(set: string[]): HTMLElement[] {
    const { ctx } = this;
    const { t, s } = ctx;
    const lists = s.wallpaper.playlists;
    const pl = lists.find((x) => x.id === s.wallpaper.active) ?? lists[0];
    const edit = (fn: (p: Playlist) => void) => ctx.store.update((x) => { const it = x.wallpaper.playlists.find((y) => y.id === pl?.id); if (it) fn(it); });
    const add = () => ctx.store.update((x) => {
      const id = uid();
      x.wallpaper.playlists.push({ id, name: "", items: [], every: "tab", shuffle: false });
      x.wallpaper.active = id;
      x.wallpaper.kind = "playlist";
    });
    const tabs = h("div", { class: "chips" },
      lists.map((l, i) => h("button", {
        class: "chip",
        attrs: { type: "button", "aria-pressed": String(l.id === pl?.id) },
        on: { click: () => ctx.store.update((x) => { x.wallpaper.active = l.id; x.wallpaper.kind = "playlist"; }) },
        text: l.name || `${t("playlistDefault")}${i ? ` ${i + 1}` : ""}`,
      })),
      button(t("playlistNew"), { class: "chip", on: { click: add } }, icon(I.plus), h("span", { text: t("playlistNew") })));
    if (!pl) return [tabs];

    const name = h("input", { class: "field", attrs: { type: "text", maxlength: 40, value: pl.name, placeholder: t("playlistDefault"), "aria-label": t("shortcutName") } });
    name.addEventListener("change", () => edit((p) => { p.name = name.value.trim(); }));
    const files = h("input", { class: "sr", attrs: { type: "file", accept: "image/*", multiple: true, id: "set-wall-files" } });
    files.addEventListener("change", async () => {
      const added: string[] = [];
      for (const f of Array.from(files.files ?? [])) if (f.type.startsWith("image/")) added.push(await saveImage(f));
      if (added.length) edit((p) => { p.items.push(...added); });
    });
    const usedElsewhere = (item: string) => s.wallpaper.playlists.some((x) => x.id !== pl.id && x.items.includes(item));
    const thumbs = h("ul", { class: "wall-thumbs" }, pl.items.length
      ? pl.items.map((item) => {
          const thumb = h("li", { class: "wall-thumb" });
          void itemUrl(item).then((u) => { if (u) thumb.style.backgroundImage = `url("${u}")`; });
          thumb.append(button(t("remove"), { class: "btn-icon tiny", on: { click: async () => {
            if (!usedElsewhere(item)) await deleteImage(item);
            edit((p) => { p.items = p.items.filter((x) => x !== item); });
          } } }, icon(I.x)));
          return thumb;
        })
      : h("li", { class: "hint", text: t("playlistEmpty") }));
    const missing = set.map((f) => `set:${f}`).filter((x) => !pl.items.includes(x));
    return [
      tabs,
      h("div", { class: "playlist-card" },
        field(t("shortcutName"), name),
        thumbs,
        h("div", { class: "row wrap" },
          h("label", { class: "btn-ghost", attrs: { for: "set-wall-files" } }, icon(I.upload), h("span", { text: t("addPictures") })), files,
          missing.length ? button(t("addSet"), { class: "btn-ghost", on: { click: () => edit((p) => { p.items.push(...missing); }) } }, icon(I.plus), h("span", { text: t("addSet") })) : null),
        field(t("playlistEvery"), select(pl.every, ROTATIONS.map((r): [Rotation, string] => [r, t(`every_${r}` as MessageKey)]), (v) => edit((p) => { p.every = v; }))),
        sw(t("shuffle"), pl.shuffle, (v) => edit((p) => { p.shuffle = v; })),
        button(t("deletePlaylist"), { class: "btn-ghost danger", on: { click: async () => {
          for (const item of pl.items) if (!usedElsewhere(item)) await deleteImage(item);
          ctx.store.update((x) => {
            x.wallpaper.playlists = x.wallpaper.playlists.filter((y) => y.id !== pl.id);
            x.wallpaper.active = x.wallpaper.playlists[0]?.id ?? null;
          });
        } } }, icon(I.trash), h("span", { text: t("deletePlaylist") }))),
    ];
  }

  private widgets(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    const num = (key: "focus" | "rest", label: string) => {
      const n = h("input", { class: "field num", attrs: { type: "number", min: 1, max: key === "focus" ? 180 : 60, value: s.pomodoro[key] } });
      n.addEventListener("change", () => ctx.store.update((x) => { x.pomodoro[key] = Number(n.value); }));
      return field(label, n);
    };
    return section("widgets", t("s_widgets"),
      h("div", { class: "chips" }, WIDGETS.map((id) => h("button", {
        class: "chip",
        attrs: { type: "button", "aria-pressed": String(s.widgets[id]) },
        on: { click: () => ctx.store.update((x) => { x.widgets[id] = !x.widgets[id]; }) },
        text: t(`w_${id}` as MessageKey),
      }))),
      num("focus", t("pomoFocusMin")),
      num("rest", t("pomoRestMin")),
    );
  }

  private search(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    const presets = ENGINES.filter((e) => e !== "browser" || canBrowserSearch).map((e): [EngineId, string] => [e, e === "browser" ? t("browserEngine") : ENGINE_URLS[e].name]);
    const mine = s.search.engines.map((e): [EngineId, string] => [`custom:${e.id}`, e.name]);
    const count = ctx.bangs()?.size ?? 10000;

    const templateOk = (v: string, needTerms: boolean) => !!normalizeUrl(v.replace(/%s|\{searchTerms\}/g, "x")) && (!needTerms || hasTerms(v));
    const row = (inputs: HTMLInputElement[], onRemove: () => void) => h("li", { class: "sc-row three" }, inputs,
      button(t("remove"), { class: "btn-icon tiny", on: { click: onRemove } }, icon(I.trash)));

    const engineRows = s.search.engines.map((e) => {
      const name = h("input", { class: "field", attrs: { type: "text", value: e.name, maxlength: 40, "aria-label": t("engineNameLabel") } });
      const url = h("input", { class: "field", attrs: { type: "url", value: e.url, placeholder: "https://example.com/?q=%s", "aria-label": t("engineUrlLabel") } });
      const commit = () => {
        url.setCustomValidity(templateOk(url.value, true) ? "" : t("engineUrlLabel"));
        if (!url.reportValidity()) return;
        ctx.store.update((x) => { const it = x.search.engines.find((y) => y.id === e.id); if (it) { it.name = name.value.trim(); it.url = url.value.trim(); } });
      };
      name.addEventListener("change", commit);
      url.addEventListener("change", commit);
      return row([name, url], () => ctx.store.update((x) => {
        x.search.engines = x.search.engines.filter((y) => y.id !== e.id);
        if (x.search.engine === `custom:${e.id}`) x.search.engine = "browser";
      }));
    });

    const bangRows = s.search.myBangs.map((b) => {
      const trig = h("input", { class: "field mono", attrs: { type: "text", value: `!${b.trigger}`, maxlength: 33, "aria-label": t("bangTrigger") } });
      const url = h("input", { class: "field", attrs: { type: "url", value: b.url, placeholder: "https://example.com/?q=%s", "aria-label": t("engineUrlLabel") } });
      const commit = () => {
        url.setCustomValidity(templateOk(url.value, false) ? "" : t("badTemplate"));
        if (!url.reportValidity()) return;
        ctx.store.update((x) => { const it = x.search.myBangs.find((y) => y.id === b.id); if (it) { it.trigger = trig.value; it.url = url.value.trim(); it.name = hostOf(normalizeUrl(url.value.replace(/%s|\{searchTerms\}/g, "x")) ?? url.value); } });
      };
      trig.addEventListener("change", commit);
      url.addEventListener("change", commit);
      return row([trig, url], () => ctx.store.update((x) => { x.search.myBangs = x.search.myBangs.filter((y) => y.id !== b.id); }));
    });

    // New rows start as a valid placeholder the user then edits in place.
    const addEngine = () => ctx.store.update((x) => {
      const id = uid();
      x.search.engines.push({ id, name: "DuckDuckGo Lite", url: "https://lite.duckduckgo.com/lite/?q=%s" });
      x.search.engine = `custom:${id}`;
    });
    const addBang = () => ctx.store.update((x) => { x.search.myBangs.push({ id: uid(), trigger: `my${x.search.myBangs.length + 1}`, name: "GitHub", url: "https://github.com/search?q=%s" }); });

    return section("search", t("s_search"),
      field(t("engine"), select<EngineId>(s.search.engine, [...presets, ...mine], (v) => ctx.store.update((x) => { x.search.engine = v; }))),
      sw(t("newTabResults"), s.search.newTab, (v) => ctx.store.update((x) => { x.search.newTab = v; }), t("newTabHint")),
      h("h4", { text: t("myEngines") }),
      h("ul", { class: "sc-list" }, engineRows),
      button(t("addEngine"), { class: "btn-ghost", on: { click: addEngine } }, icon(I.plus), h("span", { text: t("addEngine") })),
      h("h4", { text: "!bangs" }),
      sw(t("bangsToggle"), s.search.bangs, (v) => ctx.store.update((x) => { x.search.bangs = v; }), t("bangsHint", { count: count.toLocaleString(ctx.i18n.intl) })),
      h("a", { class: "link-btn small", attrs: { href: "https://helium.computer/bangs", target: "_blank", rel: "noopener" }, text: `${t("bangsList")} \u2197` }),
      h("p", { class: "hint", text: t("myBangsHint") }),
      h("ul", { class: "sc-list" }, bangRows),
      button(t("addBang"), { class: "btn-ghost", on: { click: addBang } }, icon(I.plus), h("span", { text: t("addBang") })),
    );
  }

  private shortcuts(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    const rows = s.shortcuts.map((sc, i) => {
      const name = h("input", { class: "field", attrs: { type: "text", value: sc.name, maxlength: 40, "aria-label": t("shortcutName") } });
      const url = h("input", { class: "field", attrs: { type: "url", value: sc.url, "aria-label": t("shortcutUrl") } });
      const commit = () => {
        const u = normalizeUrl(url.value);
        url.setCustomValidity(u ? "" : t("badUrl"));
        if (!u) return url.reportValidity();
        ctx.store.update((x) => { const it = x.shortcuts.find((y) => y.id === sc.id); if (it) { it.name = name.value.trim() || hostOf(u); it.url = u; } });
      };
      name.addEventListener("change", commit);
      url.addEventListener("change", commit);
      const swap = (d: number) => ctx.store.update((x) => { const j = i + d; if (j < 0 || j >= x.shortcuts.length) return; [x.shortcuts[i], x.shortcuts[j]] = [x.shortcuts[j], x.shortcuts[i]]; });
      return h("li", { class: "sc-row" }, name, url,
        button(t("dragToMove"), { class: "btn-icon tiny", attrs: { disabled: i === 0 }, on: { click: () => swap(-1) } }, icon(I.up)),
        button(t("dragToMove"), { class: "btn-icon tiny", attrs: { disabled: i === s.shortcuts.length - 1 }, on: { click: () => swap(1) } }, icon(I.down)),
        button(t("remove"), { class: "btn-icon tiny", on: { click: () => ctx.store.update((x) => { x.shortcuts = x.shortcuts.filter((y) => y.id !== sc.id); }) } }, icon(I.trash)));
    });
    return section("shortcuts", t("s_shortcuts"),
      h("ul", { class: "sc-list" }, rows),
      button(t("addShortcut"), { class: "btn-ghost", on: { click: () => ctx.addShortcut() } }, icon(I.plus), h("span", { text: t("addShortcut") })),
      field(t("iconsMode"), select(s.icons, ICON_MODES.filter((m) => m !== "browser" || !isFirefox).map((m): [IconMode, string] => [m, t(`icons_${m}` as MessageKey)]), (v) => {
        // The prompt has to come straight from the change; the tiles redraw once it is answered.
        const asked = v === "site" ? siteAccess.request(ctx.s.shortcuts.map((sc) => sc.url))
          : usesRemoteIcons(v) ? dataConsent.request("browsingActivity") : Promise.resolve(true);
        void asked.finally(() => ctx.store.update((x) => { x.icons = v; }));
      }), s.icons === "site" ? t("iconsSiteHint")
        : usesRemoteIcons(s.icons) && !dataConsent.has("browsingActivity") ? t("iconsConsent") : t("iconsHint")),
    );
  }

  private weather(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    const input = h("input", { class: "field", attrs: { id: "set-city", type: "search", value: s.weather.city, placeholder: t("city"), "aria-label": t("city") } });
    const results = h("ul", { class: "city-results" });
    const find = async () => {
      if (!(await dataConsent.request("locationInfo"))) {
        results.replaceChildren(h("li", { class: "muted small", text: t("weatherConsent") }));
        return;
      }
      results.replaceChildren(h("li", { class: "muted small", text: "…" }));
      const places = await findCity(input.value.trim(), ctx.i18n.lang).catch(() => []);
      results.replaceChildren(...(places.length ? places.map((p) => h("li", null, button(`${p.name}, ${p.country}`, {
        class: "link-btn",
        on: { click: () => ctx.store.update((x) => { x.weather.city = p.name; x.weather.lat = p.lat; x.weather.lon = p.lon; }) },
      }))) : [h("li", { class: "muted small", text: t("cityNotFound") })]));
    };
    return section("weather", t("s_weather"),
      h("form", { class: "row", on: { submit: (e: SubmitEvent) => { e.preventDefault(); void find(); } } }, input, h("button", { class: "btn-fill", attrs: { type: "submit" }, text: t("findCity") })),
      results,
      h("div", { class: "segmented", attrs: { role: "group", "aria-label": t("units") } }, (["c", "f"] as const).map((u) => h("button", {
        attrs: { type: "button", "aria-pressed": String(s.weather.units === u) },
        on: { click: () => ctx.store.update((x) => { x.weather.units = u; }) },
        text: u === "c" ? "°C" : "°F",
      }))),
      h("p", { class: "hint small", text: "Open-Meteo.com, CC BY 4.0" }),
    );
  }

  private lines(): HTMLElement {
    const { ctx } = this;
    const { t, s } = ctx;
    const area = h("textarea", { class: "field area", attrs: { rows: 6, placeholder: t("defaultLines").split("|").join("\n") } });
    area.value = s.lines.join("\n");
    area.addEventListener("change", () => ctx.store.update((x) => { x.lines = area.value.split("\n").map((l) => l.trim()).filter(Boolean); }));
    return section("lines", t("s_lines"), h("p", { class: "hint", text: t("linesHint") }), area);
  }

  private data(): HTMLElement {
    const { ctx } = this;
    const { t } = ctx;
    const file = h("input", { class: "sr", attrs: { type: "file", accept: "application/json,.json", id: "set-import" } });
    const status = h("p", { class: "hint", attrs: { role: "status" } });
    file.addEventListener("change", async () => {
      const f = file.files?.[0];
      if (!f) return;
      try {
        const json = JSON.parse(await f.text());
        if (!json || json.app !== "HatsuneMikuEditor") throw new Error("not ours");
        ctx.store.replace(normalize(json.settings));
        status.textContent = t("imported");
      } catch {
        status.textContent = t("importError");
      }
    });
    const exportData = () => {
      const blob = new Blob([JSON.stringify({ app: "HatsuneMikuEditor", v: 1, settings: ctx.s }, null, 2)], { type: "application/json" });
      const a = h("a", { attrs: { href: URL.createObjectURL(blob), download: `miku-tab-${new Date().toISOString().slice(0, 10)}.json` } });
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    return section("data", t("s_data"),
      h("div", { class: "row wrap" },
        button(t("exportData"), { class: "btn-ghost", on: { click: exportData } }, icon(I.down), h("span", { text: t("exportData") })),
        h("label", { class: "btn-ghost", attrs: { for: "set-import" } }, icon(I.upload), h("span", { text: t("importData") })), file,
        button(t("resetAll"), { class: "btn-ghost danger", on: { click: async () => {
          if (!confirm(t("resetConfirm"))) return;
          await clearImages();
          ctx.store.replace(normalize({ v: 1, shortcuts: undefined }));
        } } }, icon(I.reset), h("span", { text: t("resetAll") }))),
      status,
    );
  }
}

/** Small modal to add a shortcut from the page itself. */
export function addShortcutDialog(ctx: Ctx): void {
  const { t } = ctx;
  const name = h("input", { class: "field", attrs: { id: "add-sc-name", type: "text", maxlength: 40 } });
  const url = h("input", { class: "field", attrs: { id: "add-sc-url", type: "text", required: true, placeholder: "github.com", inputmode: "url" } });
  const dialog = h("dialog", { class: "mini-dialog", attrs: { "aria-labelledby": "add-sc-title" } },
    h("form", {
      attrs: { method: "dialog" },
      on: {
        submit: (e: SubmitEvent) => {
          const u = normalizeUrl(url.value);
          if (!u) {
            e.preventDefault();
            url.setCustomValidity(t("badUrl"));
            url.reportValidity();
            return;
          }
          // In "from the site" mode the new site is asked for access right away, while the click still counts.
          const asked = ctx.s.icons === "site" ? siteAccess.request([u]) : Promise.resolve(true);
          void asked.finally(() => ctx.store.update((s) => { s.shortcuts.push({ id: uid(), name: name.value.trim() || hostOf(u), url: u }); }));
        },
      },
    },
      h("h3", { attrs: { id: "add-sc-title" }, text: t("addShortcut") }),
      h("label", { class: "field-col", attrs: { for: "add-sc-url" } }, h("span", { text: t("shortcutUrl") })), url,
      h("label", { class: "field-col", attrs: { for: "add-sc-name" } }, h("span", { text: t("shortcutName") })), name,
      h("div", { class: "row end" },
        h("button", { class: "btn-ghost", attrs: { type: "button" }, on: { click: () => dialog.close() }, text: t("cancel") }),
        h("button", { class: "btn-fill", attrs: { type: "submit" }, text: t("save") }))));
  url.addEventListener("input", () => url.setCustomValidity(""));
  dialog.addEventListener("close", () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  url.focus();
}
