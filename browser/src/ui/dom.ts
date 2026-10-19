type Child = Node | string | number | null | undefined | false | Child[];
type Handler = (e: any) => void; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface Props {
  class?: string;
  style?: Partial<Record<string, string>>;
  attrs?: Record<string, string | number | boolean | null | undefined>;
  data?: Record<string, string>;
  on?: Record<string, Handler>;
  text?: string;
  ref?: (el: HTMLElement) => void;
}

export function append(el: Element, children: Child[]): void {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else el.append(c instanceof Node ? c : String(c));
  }
}

/** Builds an element. Text always goes through text nodes, never through HTML parsing. */
export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props | null = null, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    if (props.class) el.className = props.class;
    if (props.style) for (const [k, v] of Object.entries(props.style)) if (v !== undefined) el.style.setProperty(k, v);
    if (props.attrs) {
      for (const [k, v] of Object.entries(props.attrs)) {
        if (v === null || v === undefined || v === false) continue;
        el.setAttribute(k, v === true ? "" : String(v));
      }
    }
    if (props.data) for (const [k, v] of Object.entries(props.data)) el.dataset[k] = v;
    if (props.on) for (const [k, fn] of Object.entries(props.on)) el.addEventListener(k, fn);
    if (props.text !== undefined) el.textContent = props.text;
    props.ref?.(el);
  }
  append(el, children);
  return el;
}

/** replaceChildren that, like h(), skips null and false. */
export function fill(el: Element, ...children: Child[]): void {
  el.replaceChildren();
  append(el, children);
}

const parsed = new Map<string, SVGElement>();

/** Static icon markup from icons.ts, parsed once as SVG and cloned. */
export function icon(svg: string, cls = "ico"): HTMLSpanElement {
  let node = parsed.get(svg);
  if (!node) {
    node = new DOMParser().parseFromString(svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" '), "image/svg+xml").documentElement as unknown as SVGElement;
    parsed.set(svg, node);
  }
  return h("span", { class: cls, attrs: { "aria-hidden": "true" } }, node.cloneNode(true));
}

export function button(label: string, props: Props = {}, ...children: Child[]): HTMLButtonElement {
  const attrs = { type: "button", ...(props.attrs ?? {}) };
  if (!children.length) return h("button", { ...props, attrs, text: label });
  return h("button", { ...props, attrs: { "aria-label": label, title: label, ...attrs } }, ...children);
}

export function srOnly(text: string): HTMLSpanElement {
  return h("span", { class: "sr", text });
}

export function debounce<A extends unknown[]>(fn: (...a: A) => void, ms: number): (...a: A) => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return (...a: A) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}
