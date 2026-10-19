import { permissions, storage, tabs, type AudibleTab } from "../ext";
import { format, idle, pause, remaining, settle, start, type PomoState } from "../pomodoro";
import { uid, type WidgetId } from "../settings";
import { forecast, type Forecast, type Sky, skyLabel } from "../weather";
import { clock, dateLine, greeting, shortcuts } from "./common";
import { type Ctx, dayLine, fmtDate, isoDate, pad } from "./ctx";
import { button, debounce, fill, h, icon } from "./dom";
import { I } from "./icons";

export type Variant = "card" | "mini";

const SKY_ICON: Record<Sky, string> = {
  clear: I.sun, partly: I.partly, cloudy: I.cloud, fog: I.fog, drizzle: I.rain, rain: I.rain, snow: I.snow, storm: I.storm,
};

function card(ctx: Ctx, id: WidgetId, cls: string, ...children: (Node | null | false)[]): HTMLElement {
  return h("section", { class: `card w-${id} ${cls}`, attrs: { "aria-label": ctx.t(`w_${id}`) }, data: { widget: id } }, ...children);
}

function head(title: string, aside?: Node | string | null): HTMLElement {
  return h("div", { class: "w-head" }, h("span", { class: "w-title", text: title }), aside ?? null);
}

/* Clock: the hero card of Bento. */
export function clockWidget(ctx: Ctx): HTMLElement {
  return card(ctx, "clock", "hero",
    h("div", { class: "hero-bands", attrs: { "aria-hidden": "true" } }, h("span"), h("span")),
    dateLine(ctx, "hero-date mono", { weekday: "short", day: "numeric", month: "long" }),
    h("div", { class: "hero-row" }, clock(ctx, "hero-clock"), greeting(ctx, "hero-greet")),
  );
}

/* Weather */
let forecastMemo: { key: string; data: Promise<Forecast> } | null = null;

function loadForecast(ctx: Ctx): Promise<Forecast> | null {
  const w = ctx.s.weather;
  if (w.lat === null || w.lon === null) return null;
  const key = `${w.lat},${w.lon},${w.units}`;
  if (!forecastMemo || forecastMemo.key !== key) forecastMemo = { key, data: forecast(w.lat, w.lon, w.units) };
  forecastMemo.data.catch(() => { forecastMemo = null; });
  return forecastMemo.data;
}

export function weatherWidget(ctx: Ctx, variant: Variant): HTMLElement {
  const body = h("div", { class: "w-body" });
  const el = variant === "mini" ? h("section", { class: "card mini w-weather", attrs: { "aria-label": ctx.t("w_weather") } }, body) : card(ctx, "weather", "", body);
  const pending = loadForecast(ctx);
  if (!pending) {
    body.append(button(ctx.t("weatherSetCity"), { class: "w-empty link-btn", on: { click: () => ctx.openSettings("weather") } }));
    return el;
  }
  body.append(h("span", { class: "w-loading", text: "…" }));
  pending.then((f) => {
    const deg = (n: number) => `${n > 0 ? "+" : ""}${n}°`;
    if (variant === "mini") {
      body.replaceChildren(icon(SKY_ICON[f.sky], "ico w-sky"), h("div", { class: "mini-text" },
        h("span", { class: "mini-big display", text: deg(f.temp) }),
        h("span", { class: "muted small", text: `${ctx.t(skyLabel(f.sky))} · ${ctx.t("wind", { v: f.wind })}` })));
      return;
    }
    const top = Math.max(...f.days.map((d) => d.max), f.max);
    const low = Math.min(...f.days.map((d) => d.min), f.min);
    body.replaceChildren(
      h("div", { class: "wx-top" },
        h("div", { class: "wx-now" },
          h("span", { class: "muted small", text: ctx.s.weather.city }),
          h("span", { class: "wx-temp display", text: deg(f.temp) }),
          h("span", { class: "small", text: `${ctx.t(skyLabel(f.sky))}, ${ctx.t("todayRange", { min: f.min, max: f.max })}` })),
        icon(SKY_ICON[f.sky], "ico wx-icon")),
      h("div", { class: "wx-days" }, f.days.slice(0, 5).map((d, i) => h("div", { class: "wx-day", attrs: { title: ctx.t(skyLabel(d.sky)) } },
        h("span", { class: "muted small", text: fmtDate(new Date(`${d.date}T12:00`), ctx.i18n.intl, { weekday: "short" }) }),
        h("span", { class: `wx-bar ${i === 4 ? "alt" : ""}`, style: { "--lo": String((d.min - low) / Math.max(1, top - low)), "--hi": String((d.max - low) / Math.max(1, top - low)) } }),
        h("span", { class: "small", text: deg(d.max) })))),
    );
  }).catch(() => {
    body.replaceChildren(h("span", { class: "muted small", text: ctx.t("weatherError") }));
  });
  return el;
}

/* Calendar */
export function todaysEvents(ctx: Ctx, now: Date) {
  const today = isoDate(now);
  return ctx.s.events.filter((e) => e.date === today).sort((a, b) => a.time.localeCompare(b.time));
}

export function eventForm(ctx: Ctx, date: () => string, onDone?: () => void): HTMLElement {
  const now = new Date();
  const time = h("input", { class: "field time", attrs: { type: "time", required: true, value: `${pad((now.getHours() + 1) % 24)}:00`, "aria-label": ctx.t("eventTime") } });
  const title = h("input", { class: "field", data: { focus: "event" }, attrs: { type: "text", required: true, maxlength: 120, placeholder: ctx.t("eventTitle"), "aria-label": ctx.t("eventTitle") } });
  return h("form", {
    class: "event-form",
    on: {
      submit: (e: SubmitEvent) => {
        e.preventDefault();
        if (!title.value.trim() || !time.value) return;
        ctx.store.update((s) => { s.events.push({ id: uid(), date: date(), time: time.value, title: title.value.trim() }); });
        onDone?.();
      },
    },
  }, time, title, button(ctx.t("addEvent"), { class: "btn-icon small fill", attrs: { type: "submit" } }, icon(I.plus)));
}

export function calendarWidget(ctx: Ctx): HTMLElement {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const first = new Date(year, month, 1);
  const offset = (first.getDay() - ctx.i18n.weekStart + 7) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const busy = new Set(ctx.s.events.map((e) => e.date));

  const names = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(2024, 0, 7 + ctx.i18n.weekStart + i);
    const weekend = d.getDay() === 0 || d.getDay() === 6;
    names.push(h("span", { class: `cal-wd ${weekend ? "we" : ""}`, text: fmtDate(d, ctx.i18n.intl, { weekday: "narrow" }) }));
  }
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(h("span"));
  for (let d = 1; d <= days; d++) {
    const iso = `${year}-${pad(month + 1)}-${pad(d)}`;
    cells.push(h("span", {
      class: `cal-day ${d === now.getDate() ? "today" : ""} ${d < now.getDate() ? "past" : ""} ${busy.has(iso) ? "busy" : ""}`,
      attrs: d === now.getDate() ? { "aria-current": "date" } : {},
      text: String(d),
    }));
  }
  const events = todaysEvents(ctx, now);
  const list = h("ul", { class: "cal-events" },
    events.length
      ? events.map((e) => h("li", { class: "cal-event" },
          h("span", { class: "mono small", text: e.time }), h("span", { class: "grow", text: e.title }),
          button(ctx.t("remove"), { class: "btn-icon tiny", on: { click: () => ctx.store.update((s) => { s.events = s.events.filter((x) => x.id !== e.id); }) } }, icon(I.x))))
      : h("li", { class: "muted small", text: ctx.t("noEvents") }));
  return card(ctx, "calendar", "tall",
    head(fmtDate(now, ctx.i18n.intl, { month: "long" }), h("span", { class: "mono muted small", text: String(year) })),
    h("div", { class: "cal-grid" }, names, cells),
    list,
    eventForm(ctx, () => isoDate(new Date())),
  );
}

/* Shortcuts as a widget */
export function shortcutsWidget(ctx: Ctx): HTMLElement {
  return card(ctx, "shortcuts", "wide", shortcuts(ctx, "grid", 11));
}

/* Tasks */
export function todosWidget(ctx: Ctx, variant: Variant): HTMLElement {
  const todos = ctx.s.todos;
  const done = todos.filter((t) => t.done).length;
  if (variant === "mini") {
    const next = todos.find((t) => !t.done);
    return h("section", { class: "card mini w-todos", attrs: { "aria-label": ctx.t("w_todos") } },
      h("span", { class: "mini-big display accent", text: `${done}/${todos.length}` }),
      h("div", { class: "mini-text" },
        h("span", { text: ctx.t("w_todos") }),
        h("span", { class: "muted small ellipsis", text: next ? next.text : ctx.t("todosEmpty") })));
  }
  const input = h("input", { class: "field", data: { focus: "todo" }, attrs: { type: "text", maxlength: 200, placeholder: ctx.t("todoPlaceholder"), "aria-label": ctx.t("todoPlaceholder") } });
  return card(ctx, "todos", "tall",
    head(ctx.t("w_todos"), h("span", { class: "mono accent small", text: `${done} / ${todos.length}` })),
    h("ul", { class: "todo-list" },
      todos.length
        ? todos.map((t) => h("li", { class: `todo ${t.done ? "done" : ""}` },
            h("label", { class: "todo-label" },
              h("input", { attrs: { type: "checkbox", checked: t.done }, on: { change: () => ctx.store.update((s) => { const x = s.todos.find((y) => y.id === t.id); if (x) x.done = !x.done; }) } }),
              h("span", { text: t.text })),
            button(ctx.t("remove"), { class: "btn-icon tiny", on: { click: () => ctx.store.update((s) => { s.todos = s.todos.filter((x) => x.id !== t.id); }) } }, icon(I.x))))
        : h("li", { class: "muted small", text: ctx.t("todosEmpty") })),
    h("form", {
      class: "todo-form",
      on: {
        submit: (e: SubmitEvent) => {
          e.preventDefault();
          const text = input.value.trim();
          if (text) ctx.store.update((s) => { s.todos.push({ id: uid(), text, done: false }); });
        },
      },
    }, input, button(ctx.t("add"), { class: "btn-icon small fill", attrs: { type: "submit" } }, icon(I.plus))),
  );
}

/* Now playing: audible tabs. Titles need the optional "tabs" permission. */
export function nowPlayingWidget(ctx: Ctx, variant: Variant): HTMLElement {
  const body = h("div", { class: "np-body" });
  const el = variant === "mini"
    ? h("section", { class: "card mini w-nowPlaying", attrs: { "aria-label": ctx.t("w_nowPlaying") } }, body)
    : card(ctx, "nowPlaying", "", head(ctx.t("w_nowPlaying")), body);

  const draw = async () => {
    const list = tabs.available ? await tabs.audible().catch(() => [] as AudibleTab[]) : [];
    const canTitles = await permissions.has("tabs").catch(() => false);
    const t = list[0];
    const cover = h("div", { class: "np-cover", attrs: { "aria-hidden": "true" } },
      t?.favIconUrl ? h("img", { attrs: { src: t.favIconUrl, alt: "" } }) : null, h("span"), h("span"));
    const title = t ? (t.title ?? ctx.t("npTab")) : ctx.t("npNothing");
    const controls = t
      ? h("div", { class: "np-controls" },
          button(ctx.t("npGoTo"), { class: "btn-icon small", on: { click: () => tabs.focus(t) } }, icon(I.external)),
          button(t.muted ? ctx.t("npUnmute") : ctx.t("npMute"), { class: "btn-icon small fill", on: { click: async () => { await tabs.mute(t, !t.muted); void draw(); } } }, icon(t.muted ? I.muted : I.sound)))
      : null;
    const allow = t && !canTitles && tabs.available
      ? button(ctx.t("npAllow"), { class: "link-btn small", on: { click: async () => { if (await permissions.request("tabs")) void draw(); } } })
      : null;
    fill(body, cover, h("div", { class: "np-text" },
      h("span", { class: "np-title ellipsis", text: title, attrs: { title } }),
      h("div", { class: `eq-mini ${t && !t.muted ? "live" : ""}`, attrs: { "aria-hidden": "true" } }, h("span"), h("span"), h("span"), h("span")),
      allow), controls);
  };
  void draw();
  const refresh = debounce(() => { if (el.isConnected) void draw(); }, 300);
  const off = tabs.onChange(refresh);
  const timer = setInterval(refresh, 5000);
  ctx.onDispose(() => { off(); clearInterval(timer); });
  return el;
}

/* Focus timer */
const POMO_KEY = "pomodoro";

export function pomodoroWidget(ctx: Ctx, variant: Variant): HTMLElement {
  const minutes = ctx.s.pomodoro;
  let state: PomoState = idle("focus", minutes);
  const time = h("span", { class: "pomo-time display" });
  const mode = h("span", { class: "small" });
  const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  const toggle = h("button", { class: "btn-fill small", attrs: { type: "button" } });
  const resetBtn = button(ctx.t("reset"), { class: "btn-icon small" }, icon(I.reset));

  const save = () => void storage.set(POMO_KEY, state);
  const paint = (now = Date.now()) => {
    state = settle(state, now, minutes);
    const left = remaining(state, now);
    const total = minutes[state.mode] * 60_000;
    time.textContent = format(left);
    mode.textContent = state.mode === "focus" ? ctx.t("pomoFocus") : ctx.t("pomoRest");
    ring.setAttribute("stroke-dashoffset", String(314 * (1 - left / total)));
    toggle.textContent = state.endsAt ? ctx.t("pause") : left < total ? ctx.t("resume") : ctx.t("start");
    el.classList.toggle("running", state.endsAt !== null);
    el.classList.toggle("rest", state.mode === "rest");
  };
  toggle.addEventListener("click", () => { state = state.endsAt ? pause(state, Date.now()) : start(state, Date.now()); save(); paint(); });
  resetBtn.addEventListener("click", () => { state = idle(state.mode, minutes); save(); paint(); });

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 116 116");
  svg.setAttribute("aria-hidden", "true");
  const track = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  for (const c of [track, ring]) {
    c.setAttribute("cx", "58"); c.setAttribute("cy", "58"); c.setAttribute("r", "50");
    c.setAttribute("fill", "none"); c.setAttribute("stroke-width", "8");
  }
  track.setAttribute("class", "pomo-track");
  ring.setAttribute("class", "pomo-ring");
  ring.setAttribute("stroke-linecap", "round");
  ring.setAttribute("stroke-dasharray", "314");
  ring.setAttribute("transform", "rotate(-90 58 58)");
  svg.append(track, ring);

  const el = variant === "mini"
    ? h("section", { class: "card mini w-pomodoro", attrs: { "aria-label": ctx.t("w_pomodoro") } },
        h("div", { class: "mini-text" }, time, mode), toggle)
    : card(ctx, "pomodoro", "", h("div", { class: "pomo-dial" }, svg, time),
        h("div", { class: "pomo-side" }, mode, h("div", { class: "row" }, toggle, resetBtn)));

  void storage.get(POMO_KEY).then((v) => {
    const s = v as PomoState | undefined;
    if (s && (s.mode === "focus" || s.mode === "rest") && typeof s.left === "number") state = s;
    paint();
  });
  ctx.tick(() => paint());
  return el;
}

/* Note */
export function noteWidget(ctx: Ctx): HTMLElement {
  const save = debounce((v: string) => ctx.store.update((s) => { s.note = v; }, true), 400);
  const area = h("textarea", { class: "note-area", attrs: { placeholder: ctx.t("notePlaceholder"), "aria-label": ctx.t("w_note"), maxlength: 5000 }, on: { input: (e: Event) => save((e.target as HTMLTextAreaElement).value) } });
  area.value = ctx.s.note;
  return card(ctx, "note", "", head(ctx.t("w_note")), area);
}

/* Line of the day */
export function lineWidget(ctx: Ctx, variant: Variant): HTMLElement {
  const text = h("span", { class: "line-text" });
  ctx.tick((now) => { text.textContent = dayLine(ctx, now); });
  if (variant === "mini") return h("div", { class: "line-strip" }, h("span", { class: "mono accent2 small caps", text: ctx.t("w_line") }), text);
  return card(ctx, "line", "", h("span", { class: "mono accent2 small caps", text: ctx.t("w_line") }), text);
}

export function widget(ctx: Ctx, id: WidgetId, variant: Variant = "card"): HTMLElement | null {
  switch (id) {
    case "clock": return clockWidget(ctx);
    case "weather": return weatherWidget(ctx, variant);
    case "calendar": return calendarWidget(ctx);
    case "shortcuts": return shortcutsWidget(ctx);
    case "todos": return todosWidget(ctx, variant);
    case "nowPlaying": return nowPlayingWidget(ctx, variant);
    case "pomodoro": return pomodoroWidget(ctx, variant);
    case "note": return noteWidget(ctx);
    case "line": return lineWidget(ctx, variant);
  }
}
