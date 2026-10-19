import { parseBang } from "../bangs";
import { browserSearch, canBrowserSearch } from "../ext";
import { engineName, engineUrl, resolve } from "../search";
import type { Ctx } from "./ctx";
import { h, icon } from "./dom";
import { I } from "./icons";

let counter = 0;

function go(url: string, newTab: boolean): void {
  if (newTab) window.open(url, "_blank", "noopener");
  else window.location.href = url;
}

/** `invert` flips the "open in a new tab" setting (Ctrl or Cmd held). */
export async function submitQuery(ctx: Ctx, text: string, invert: boolean): Promise<void> {
  const newTab = ctx.s.search.newTab !== invert;
  const action = resolve(text, ctx.bangs(), ctx.s.search.bangs);
  if (action.kind === "none") return;
  if (action.kind !== "search") return go(action.url, newTab);
  const { engine, engines } = ctx.s.search;
  if (engine === "browser" && canBrowserSearch && (await browserSearch(action.query, newTab))) return;
  go(engineUrl(engine === "browser" ? "duckduckgo" : engine, engines, action.query)!, newTab);
}

export type SearchStyle = "pill" | "box" | "line";

export function searchBar(ctx: Ctx, style: SearchStyle, opts: { placeholder?: string; button?: boolean } = {}): HTMLElement {
  const id = `q${++counter}`;
  const listId = `${id}-list`;
  let active = -1;
  let items: { trigger: string; name: string }[] = [];

  const input = h("input", {
    class: "search-input",
    attrs: {
      id,
      type: "search",
      autocomplete: "off",
      spellcheck: "false",
      placeholder: opts.placeholder ?? ctx.t("searchPlaceholder"),
      role: "combobox",
      "aria-expanded": "false",
      "aria-controls": listId,
      "aria-autocomplete": "list",
    },
  });
  const chip = h("span", { class: "bang-chip", attrs: { hidden: true } });
  const list = h("ul", { class: "suggest", attrs: { id: listId, role: "listbox", "aria-label": ctx.t("bangSuggestions"), hidden: true } });
  const engineLabel = engineName(ctx.s.search.engine, ctx.s.search.engines) ?? ctx.t("browserEngine");

  const currentToken = () => {
    const before = input.value.slice(0, input.selectionStart ?? input.value.length);
    const m = /(^|\s)!(\S*)$/.exec(before);
    return m ? m[2] : null;
  };

  const renderList = () => {
    list.replaceChildren(...items.map((it, i) => h("li", {
      class: i === active ? "on" : "",
      attrs: { role: "option", id: `${listId}-${i}`, "aria-selected": String(i === active) },
      on: { mousedown: (e: MouseEvent) => { e.preventDefault(); complete(i); } },
    }, h("span", { class: "mono trig", text: `!${it.trigger}` }), h("span", { class: "name", text: it.name }))));
    list.hidden = items.length === 0;
    input.setAttribute("aria-expanded", String(items.length > 0));
    if (active >= 0) input.setAttribute("aria-activedescendant", `${listId}-${active}`);
    else input.removeAttribute("aria-activedescendant");
  };

  const refresh = () => {
    const bangs = ctx.bangs();
    const tok = ctx.s.search.bangs && bangs ? currentToken() : null;
    items = tok ? bangs!.suggest(tok, 6).map((s) => ({ trigger: s.trigger, name: s.bang.name })) : [];
    active = items.length ? 0 : -1;
    renderList();
    const parsed = ctx.s.search.bangs && bangs ? parseBang(input.value) : null;
    const bang = parsed ? bangs!.get(parsed.trigger) : undefined;
    chip.hidden = !bang;
    chip.textContent = bang ? ctx.t("bangGoesTo", { name: bang.name }) : "";
  };

  const complete = (i: number) => {
    const it = items[i];
    if (!it) return;
    const caret = input.selectionStart ?? input.value.length;
    const before = input.value.slice(0, caret).replace(/!(\S*)$/, `!${it.trigger} `);
    input.value = before + input.value.slice(caret).replace(/^\S*\s?/, "");
    input.setSelectionRange(before.length, before.length);
    items = [];
    refresh();
    input.focus();
  };

  input.addEventListener("input", refresh);
  input.addEventListener("blur", () => { items = []; renderList(); });
  input.addEventListener("keydown", (e) => {
    if (items.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      active = (active + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length;
      renderList();
    } else if (items.length && e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      complete(active);
    } else if (e.key === "Escape" && items.length) {
      e.preventDefault();
      items = [];
      renderList();
    } else if (e.key === "Enter" && items.length && active >= 0 && currentToken() !== null && currentToken() !== items[active].trigger) {
      e.preventDefault();
      complete(active);
    }
  });

  const form = h("form", {
    class: `search search-${style}`,
    attrs: { role: "search" },
    on: {
      submit: (e: SubmitEvent) => {
        e.preventDefault();
        void submitQuery(ctx, input.value, false);
      },
      keydown: (e: KeyboardEvent) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          void submitQuery(ctx, input.value, true);
        }
      },
    },
  },
    icon(I.search, "ico search-ico"),
    h("label", { class: "sr", attrs: { for: id }, text: ctx.t("searchLabel") }),
    input,
    chip,
    style !== "line" ? h("span", { class: "engine mono", text: engineLabel }) : null,
    opts.button ? h("button", { class: "btn-fill", attrs: { type: "submit" }, text: ctx.t("searchButton") }) : null,
    list,
  );
  form.dataset.search = "";
  return form;
}

/** "/" or any printable key outside a field jumps into the first search box. */
export function installSearchHotkeys(): () => void {
  const onKey = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, [contenteditable], dialog[open]") || e.ctrlKey || e.metaKey || e.altKey) return;
    const input = document.querySelector<HTMLInputElement>("[data-search] input");
    if (!input) return;
    if (e.key === "/") {
      e.preventDefault();
      input.focus();
    } else if (e.key.length === 1 && e.key !== " ") {
      input.focus();
    }
  };
  document.addEventListener("keydown", onKey);
  return () => document.removeEventListener("keydown", onKey);
}
