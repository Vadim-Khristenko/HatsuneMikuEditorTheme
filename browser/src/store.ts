import { storage } from "./ext";
import { normalize, type Settings } from "./settings";

const KEY = "settings";

export class Store {
  s: Settings;
  private listeners = new Set<() => void>();
  private saving: Promise<void> = Promise.resolve();
  private lastWrite = "";

  private constructor(s: Settings) {
    this.s = s;
  }

  static async load(): Promise<Store> {
    const store = new Store(normalize(await storage.get(KEY)));
    // Another open new tab changed settings: follow it, unless the change is our own echo.
    storage.onChanged(async (key) => {
      if (key !== KEY) return;
      const next = normalize(await storage.get(KEY));
      if (JSON.stringify(next) === store.lastWrite) return;
      store.s = next;
      store.emit();
    });
    return store;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }

  /** `quiet` saves without re-rendering, for edits whose widget already shows the result. */
  update(fn: (s: Settings) => void, quiet = false): void {
    fn(this.s);
    this.s = normalize(this.s);
    this.lastWrite = JSON.stringify(this.s);
    const snapshot = JSON.parse(this.lastWrite);
    this.saving = this.saving.then(() => storage.set(KEY, snapshot));
    if (!quiet) this.emit();
  }

  replace(next: Settings): void {
    this.update((s) => Object.assign(s, next));
  }
}
