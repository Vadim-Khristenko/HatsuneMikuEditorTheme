import type { Layout, WidgetId } from "../settings";
import { brand, clock, dateLine, editButton, equalizer, greeting, settingsButton, shortcuts, themeSwitcher } from "./common";
import { type Ctx, hash, isoDate, pad } from "./ctx";
import { button, h, icon } from "./dom";
import { I } from "./icons";
import { searchBar } from "./search";
import { eventForm, lineWidget, todaysEvents, widget } from "./widgets";

const on = (ctx: Ctx, id: WidgetId) => ctx.s.widgets[id];

function topbar(ctx: Ctx, left: Node | null, extra: Node[] = []): HTMLElement {
  return h("header", { class: "topbar" }, left, h("div", { class: "topbar-right" }, ...extra, themeSwitcher(ctx), settingsButton(ctx)));
}

/* A. Stage: the clock is the song title, shortcuts are the setlist. */
function stage(ctx: Ctx): HTMLElement {
  const minis = (["weather", "nowPlaying", "todos", "pomodoro"] as WidgetId[]).filter((id) => on(ctx, id)).slice(0, 3);
  return h("div", { class: "layout layout-stage" },
    h("div", { class: "stage-deco", attrs: { "aria-hidden": "true" } }, h("span", { class: "stage-01", text: "01" }), h("span", { class: "band b1" }), h("span", { class: "band b2" })),
    topbar(ctx, brand(ctx)),
    h("main", { class: "stage-main" },
      dateLine(ctx, "stage-date mono caps", { weekday: "long", day: "numeric", month: "long" }),
      on(ctx, "clock") ? clock(ctx, "stage-clock display") : null,
      equalizer(),
      greeting(ctx, "stage-greet", ctx.t("stageTagline")),
      searchBar(ctx, "pill", { button: true }),
      on(ctx, "shortcuts") ? shortcuts(ctx, "setlist", 10) : null),
    minis.length || on(ctx, "line")
      ? h("footer", { class: "stage-dock" },
          minis.map((id) => widget(ctx, id, "mini")),
          on(ctx, "line") && minis.length < 3 ? lineWidget(ctx, "mini") : null)
      : null,
  );
}

/* B. Score: the day is a staff, now is the playhead, events are notes, shortcuts are piano keys. */
function staff(ctx: Ctx): HTMLElement {
  const now = new Date();
  const pct = (m: number) => `${((m / 1440) * 100).toFixed(3)}%`;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const events = todaysEvents(ctx, now);

  const lines = [0, 1, 2, 3, 4].map((i) => h("span", { class: "st-line", style: { top: `${40 + i * 22}px` } }));
  const bars = [];
  for (let hr = 0; hr <= 24; hr++) {
    bars.push(h("span", { class: `st-bar ${hr % 6 === 0 ? "strong" : ""}`, style: { left: pct(hr * 60) } }));
    if (hr % 3 === 0 && hr < 24) bars.push(h("span", { class: "st-hour mono", style: { left: pct(hr * 60) }, text: pad(hr) }));
  }

  const playhead = h("div", { class: "st-playhead", style: { left: pct(nowMin) } }, h("span", { class: "st-ph-time mono" }));
  const past = h("div", { class: "st-past", style: { width: pct(nowMin) } });
  ctx.tick((d) => {
    const m = d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60;
    playhead.style.left = pct(m);
    past.style.width = pct(m);
    (playhead.firstChild as HTMLElement).textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  });

  const notes = events.map((e, i) => {
    const [hh, mm] = e.time.split(":").map(Number);
    const m = hh * 60 + mm;
    const step = hash(e.title + e.time) % 9;
    const y = 29 + step * 11;
    const stemDown = step <= 3;
    return h("div", { class: `st-note ${m < nowMin ? "played" : ""} ${i % 3 === 2 ? "alt" : ""}`, style: { left: pct(m), "--y": `${y}px` } },
      h("span", { class: `st-head ${stemDown ? "down" : ""}`, attrs: { title: `${e.time} ${e.title}` } }),
      h("span", { class: `st-label ${i % 2 ? "low" : ""}` },
        h("span", { class: "mono", text: e.time }), h("span", { class: "ellipsis", text: e.title }),
        button(ctx.t("remove"), { class: "btn-icon tiny", on: { click: () => ctx.store.update((s) => { s.events = s.events.filter((x) => x.id !== e.id); }) } }, icon(I.x))));
  });

  const formSlot = h("div", { class: "st-form", attrs: { hidden: true } }, eventForm(ctx, () => isoDate(new Date())));
  const addBtn = button(ctx.t("addEvent"), {
    class: "btn-ghost small",
    on: { click: () => { formSlot.hidden = !formSlot.hidden; formSlot.querySelector("input")?.focus(); } },
  }, icon(I.plus), h("span", { text: ctx.t("addEvent") }));

  return h("section", { class: "card staff", attrs: { "aria-label": ctx.t("scoreTitle") } },
    h("div", { class: "staff-head" },
      h("span", { class: "mono accent small caps", text: "01 · " + ctx.t("scoreTitle") }),
      h("span", { class: "muted small grow", text: events.length ? ctx.t("scoreHint") : ctx.t("scoreFree") }),
      addBtn),
    formSlot,
    h("div", { class: "staff-area" },
      h("span", { class: "st-clef display", attrs: { "aria-hidden": "true" }, text: "39" }),
      h("div", { class: "staff-track" }, past, lines, bars, notes, playhead)),
  );
}

function score(ctx: Ctx): HTMLElement {
  return h("div", { class: "layout layout-score" },
    topbar(ctx, h("span", { class: "score-brand display" }, "miku", h("span", { class: "accent", text: "." }), "tab"), []),
    h("div", { class: "score-hero" },
      h("div", { class: "score-time" },
        on(ctx, "clock") ? clock(ctx, "score-clock display") : null,
        dateLine(ctx, "score-date", { weekday: "long", day: "numeric", month: "long" }),
        greeting(ctx, "muted")),
      h("div", { class: "score-search" }, searchBar(ctx, "box"),
        h("div", { class: "score-minis" }, (["weather", "pomodoro", "nowPlaying"] as WidgetId[]).filter((id) => on(ctx, id)).slice(0, 2).map((id) => widget(ctx, id, "mini"))))),
    on(ctx, "calendar") ? staff(ctx) : null,
    on(ctx, "shortcuts") ? h("div", { class: "piano-wrap" }, h("span", { class: "mono muted small caps", text: ctx.t("scoreKeys") }), shortcuts(ctx, "keys", 14)) : null,
    on(ctx, "line") ? lineWidget(ctx, "mini") : null,
  );
}

/* C. Bento: a grid of widgets the user can reorder and hide. */
function bento(ctx: Ctx): HTMLElement {
  let dragging: WidgetId | null = null;
  const visible = ctx.s.order.filter((id) => on(ctx, id));
  const hidden = ctx.s.order.filter((id) => !on(ctx, id));
  const move = (from: WidgetId, to: WidgetId) => ctx.store.update((s) => {
    const order = s.order.filter((x) => x !== from);
    order.splice(order.indexOf(to), 0, from);
    s.order = order;
  });

  const cells = visible.map((id) => {
    const w = widget(ctx, id)!;
    if (!ctx.edit) return w;
    w.classList.add("editing");
    w.draggable = true;
    w.addEventListener("dragstart", (e) => { dragging = id; e.dataTransfer?.setData("text/plain", id); w.classList.add("dragging"); });
    w.addEventListener("dragend", () => { dragging = null; w.classList.remove("dragging"); });
    w.addEventListener("dragover", (e) => { if (dragging && dragging !== id) { e.preventDefault(); w.classList.add("drop"); } });
    w.addEventListener("dragleave", () => w.classList.remove("drop"));
    w.addEventListener("drop", (e) => { e.preventDefault(); w.classList.remove("drop"); if (dragging && dragging !== id) move(dragging, id); });
    w.append(h("div", { class: "edit-bar" },
      h("span", { class: "grip", attrs: { title: ctx.t("dragToMove") } }, icon(I.grip)),
      button(ctx.t("hideWidget"), { class: "btn-icon tiny", on: { click: () => ctx.store.update((s) => { s.widgets[id] = false; }) } }, icon(I.x))));
    return w;
  });

  const add = ctx.edit && hidden.length
    ? h("section", { class: "card add-widget" },
        h("span", { class: "w-title", text: ctx.t("addWidget") }),
        h("div", { class: "chips" }, hidden.map((id) => button(ctx.t(`w_${id}`), { class: "chip", on: { click: () => ctx.store.update((s) => { s.widgets[id] = true; }) } }, icon(I.plus), h("span", { text: ctx.t(`w_${id}`) })))))
    : null;

  return h("div", { class: `layout layout-bento ${ctx.edit ? "is-editing" : ""}` },
    h("header", { class: "topbar" }, searchBar(ctx, "box"), h("div", { class: "topbar-right" }, themeSwitcher(ctx, "boxed"), editButton(ctx), settingsButton(ctx))),
    h("div", { class: "bento-grid" }, cells, add));
}

/* D. Zen: the wallpaper speaks, the widgets wait in a drawer. */
function zen(ctx: Ctx): HTMLElement {
  const drawerIds = (["weather", "todos", "pomodoro", "nowPlaying", "note", "line"] as WidgetId[]).filter((id) => on(ctx, id));
  const open = ctx.s.zenDrawer && drawerIds.length > 0;
  const toggle = () => ctx.store.update((s) => { s.zenDrawer = !s.zenDrawer; });
  return h("div", { class: `layout layout-zen ${open ? "drawer-open" : ""}` },
    ctx.s.wallpaper.kind === "art"
      ? h("div", { class: "zen-art", attrs: { "aria-hidden": "true" } }, h("span", { class: "sun" }), h("span", { class: "tail t1" }), h("span", { class: "tail t2" }), h("span", { class: "tail t3" }))
      : null,
    h("header", { class: "topbar zen-top" }, searchBar(ctx, "line", { placeholder: ctx.t("searchPlaceholderZen") }), h("div", { class: "topbar-right" }, themeSwitcher(ctx, "small"), settingsButton(ctx))),
    h("div", { class: "zen-bottom" },
      dateLine(ctx, "zen-date mono accent caps", { weekday: "short", day: "2-digit", month: "2-digit" }),
      on(ctx, "clock") ? clock(ctx, "zen-clock display") : null,
      h("div", { class: "zen-tagline" }, greeting(ctx, "", ctx.t("zenTagline"))),
      on(ctx, "shortcuts") ? shortcuts(ctx, "dock", 9) : null),
    drawerIds.length
      ? open
        ? h("aside", { class: "zen-drawer", attrs: { "aria-label": ctx.t("s_widgets") } },
            h("div", { class: "w-head" }, h("span", { class: "w-title display", text: ctx.t("s_widgets") }),
              button(ctx.t("hideWidgets"), { class: "btn-icon small", on: { click: toggle } }, icon(I.right))),
            drawerIds.map((id) => widget(ctx, id, id === "weather" || id === "pomodoro" ? "mini" : "card")))
        : button(ctx.t("showWidgets"), { class: "zen-handle", on: { click: toggle } }, icon(I.left))
      : null,
  );
}

export const LAYOUT_RENDERERS: Record<Layout, (ctx: Ctx) => HTMLElement> = { stage, score, bento, zen };
