export type PomoMode = "focus" | "rest";

/** Running: `endsAt` is set. Paused or idle: `left` holds the remaining milliseconds. */
export interface PomoState { mode: PomoMode; endsAt: number | null; left: number }

export function idle(mode: PomoMode, minutes: { focus: number; rest: number }): PomoState {
  return { mode, endsAt: null, left: minutes[mode] * 60_000 };
}

export function remaining(s: PomoState, now: number): number {
  return s.endsAt === null ? s.left : Math.max(0, s.endsAt - now);
}

export function start(s: PomoState, now: number): PomoState {
  return s.endsAt !== null ? s : { ...s, endsAt: now + s.left };
}

export function pause(s: PomoState, now: number): PomoState {
  return s.endsAt === null ? s : { ...s, endsAt: null, left: remaining(s, now) };
}

/** When a running phase is over, the next one starts paused and ready. */
export function settle(s: PomoState, now: number, minutes: { focus: number; rest: number }): PomoState {
  if (s.endsAt !== null && now >= s.endsAt) return idle(s.mode === "focus" ? "rest" : "focus", minutes);
  return s;
}

export function format(ms: number): string {
  const total = Math.ceil(ms / 1000);
  const m = Math.floor(total / 60);
  return `${String(m).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
