export type Bump = "major" | "minor" | "patch";

export interface Commit {
  hash: string;
  type: string;
  scope?: string;
  breaking: boolean;
  subject: string;
  /** Top-level bullet points of the body, or its paragraphs when it has none. */
  details: string[];
}

/** Commit types that change what a user gets, with the heading they appear under. */
export const SECTIONS: [string, string][] = [
  ["feat", "Added"],
  ["fix", "Fixed"],
  ["perf", "Changed"],
  ["refactor", "Changed"],
  ["style", "Changed"],
  ["ui", "Changed"],
  ["docs", "Docs"],
];

const SHIPPING = new Set(SECTIONS.map(([t]) => t));

/** Joins wrapped lines back into bullets; a body without bullets gives its paragraphs. */
export function bodyDetails(body: string): string[] {
  const lines = body.replace(/\r/g, "").split("\n");
  const bullets: string[] = [];
  let inBullet = false;
  for (const raw of lines) {
    if (/^(BREAKING CHANGE|[A-Z][\w-]+): /.test(raw) || /^Co-Authored-By:/i.test(raw)) {
      inBullet = false;
      continue;
    }
    const m = raw.match(/^[-*] (.*)$/);
    if (m) {
      bullets.push(m[1].trim());
      inBullet = true;
    } else if (inBullet && /^\s+\S/.test(raw)) {
      bullets[bullets.length - 1] += " " + raw.trim();
    } else {
      inBullet = false;
    }
  }
  if (bullets.length) return bullets;
  return body
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter((p) => p && !/^(BREAKING CHANGE|Co-Authored-By|Signed-off-by)/i.test(p) && !/^[A-Z][\w-]+: \S+$/.test(p));
}

export function parseCommit(hash: string, message: string): Commit | null {
  const [head, ...rest] = message.replace(/\r/g, "").split("\n");
  const m = head.match(/^(\w+)(?:\(([^)]+)\))?(!)?: (.+)$/);
  if (!m) return null;
  const body = rest.join("\n").trim();
  const subject = m[4].trim();
  return {
    hash,
    type: m[1].toLowerCase(),
    scope: m[2],
    breaking: !!m[3] || /^BREAKING CHANGE:/m.test(body),
    subject: subject.charAt(0).toUpperCase() + subject.slice(1),
    details: bodyDetails(body),
  };
}

export const ships = (c: Commit) => SHIPPING.has(c.type) || c.breaking;

/** The smallest bump that covers the commits; on 0.x a breaking change is a minor bump. */
export function bumpOf(commits: Commit[], current: string): Bump | null {
  const shipping = commits.filter(ships);
  if (!shipping.length) return null;
  const zero = current.startsWith("0.");
  if (shipping.some((c) => c.breaking)) return zero ? "minor" : "major";
  if (shipping.some((c) => c.type === "feat")) return "minor";
  return "patch";
}

export function bumpVersion(v: string, b: Bump): string {
  const [major, minor, patch] = v.split(".").map(Number);
  if (b === "major") return `${major + 1}.0.0`;
  if (b === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

export const maxBump = (bs: (Bump | null)[]): Bump | null =>
  bs.includes("major") ? "major" : bs.includes("minor") ? "minor" : bs.includes("patch") ? "patch" : null;

/** Commits grouped under their headings, in the order of SECTIONS. */
export function grouped(commits: Commit[]): [string, Commit[]][] {
  const out = new Map<string, Commit[]>();
  for (const c of commits.filter(ships)) {
    const heading = c.breaking ? "Breaking" : SECTIONS.find(([t]) => t === c.type)![1];
    out.set(heading, [...(out.get(heading) ?? []), c]);
  }
  const order = ["Breaking", ...new Set(SECTIONS.map(([, h]) => h))];
  return order.filter((h) => out.has(h)).map((h) => [h, out.get(h)!]);
}

/** A Keep a Changelog section. `extra` is hand-written text that was waiting under [Unreleased]. */
export function markdownSection(version: string, date: string, commits: Commit[], extra = ""): string {
  const parts = [`## [${version}] - ${date}`];
  if (extra.trim()) parts.push(extra.trim());
  for (const [heading, list] of grouped(commits)) {
    const items = list.map((c) => [`- ${c.subject}`, ...c.details.map((d) => `  - ${d}`)].join("\n"));
    parts.push(`### ${heading}\n\n${items.join("\n")}`);
  }
  return parts.join("\n\n") + "\n";
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inlineHtml = (s: string) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");

/** JetBrains Marketplace change notes: a small HTML fragment. */
export function htmlNotes(version: string, commits: Commit[], extra = ""): string {
  const out = [`<h3>${esc(version)}</h3>`];
  if (extra.trim()) out.push(`<p>${inlineHtml(extra.trim())}</p>`);
  for (const [heading, list] of grouped(commits)) {
    const items = list.map((c) => {
      const sub = c.details.length ? `<ul>${c.details.map((d) => `<li>${inlineHtml(d)}</li>`).join("")}</ul>` : "";
      return `<li>${inlineHtml(c.subject)}${sub}</li>`;
    });
    out.push(`<p><b>${heading}</b></p><ul>${items.join("")}</ul>`);
  }
  return out.join("\n") + "\n";
}

/** AMO release notes: plain text with simple bullets, the format the store shows best. */
export function plainNotes(commits: Commit[], extra = ""): string {
  const out: string[] = [];
  if (extra.trim()) out.push(extra.trim());
  for (const [heading, list] of grouped(commits)) {
    out.push(`${heading}:\n` + list.map((c) => [`• ${c.subject}`, ...c.details.map((d) => `   ◦ ${d}`)].join("\n")).join("\n"));
  }
  return out.join("\n\n");
}
