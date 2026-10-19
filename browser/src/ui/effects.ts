import type { Occasion } from "../greetings";
import { h } from "./dom";

const SHAPES: Record<Occasion, { count: number; cls: string; text?: string[]; once: boolean }> = {
  birthday: { count: 90, cls: "confetti", once: true },
  newYear: { count: 46, cls: "snow", once: false },
  mikuBirthday: { count: 28, cls: "note-fx", text: ["♪", "♫", "♩"], once: false },
  mikuDay: { count: 22, cls: "note-fx", text: ["3", "9", "♪"], once: false },
  halloween: { count: 24, cls: "ember", once: false },
};

let shown: Occasion | null = null;

/** Draws a light particle layer for special days. Runs once per page, and never with motion turned off. */
export function celebrate(occasion: Occasion | null, motion: boolean): void {
  if (!occasion || !motion || shown === occasion || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  shown = occasion;
  document.getElementById("fx")?.remove();
  const spec = SHAPES[occasion];
  const parts = [];
  for (let i = 0; i < spec.count; i++) {
    const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
    parts.push(h("span", {
      class: `fx ${spec.cls} c${i % 3}`,
      text: spec.text ? spec.text[i % spec.text.length] : undefined,
      style: {
        left: `${(r(1) * 100).toFixed(2)}%`,
        "--delay": `${(r(2) * (spec.once ? 1.2 : 12)).toFixed(2)}s`,
        "--dur": `${(spec.once ? 3.2 + r(3) * 2.4 : 9 + r(3) * 10).toFixed(2)}s`,
        "--drift": `${((r(4) - 0.5) * 160).toFixed(0)}px`,
        "--spin": `${((r(5) - 0.5) * 1080).toFixed(0)}deg`,
        "--size": `${(0.6 + r(6) * 0.9).toFixed(2)}`,
      },
    }));
  }
  const layer = h("div", { attrs: { id: "fx", "aria-hidden": "true" }, class: spec.once ? "once" : "" }, parts);
  document.body.append(layer);
  if (spec.once) setTimeout(() => layer.remove(), 8000);
}
