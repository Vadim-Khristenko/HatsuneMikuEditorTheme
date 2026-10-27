import { describe, expect, test } from "bun:test";
import { bodyDetails, bumpOf, bumpVersion, htmlNotes, markdownSection, parseCommit } from "./commits";
import { PORTS, versionDrift } from "./ports";
import { readFileSync } from "node:fs";
import { authHeader, jwt, publish } from "./amo";
import { mdToText, sectionOf, splitChangelog } from "./release";

const c = (msg: string) => parseCommit("abc1234", msg)!;

describe("commits", () => {
  test("reads type, scope, breaking mark and capitalizes the subject", () => {
    const x = c("feat(telegram)!: themes for Telegram\n\nBREAKING CHANGE: new port");
    expect([x.type, x.scope, x.breaking, x.subject]).toEqual(["feat", "telegram", true, "Themes for Telegram"]);
    expect(parseCommit("a", "Merge branch 'x'")).toBeNull();
  });

  test("body bullets keep their wrapped lines, trailers are dropped", () => {
    const body = "Intro paragraph.\n\n- First point\n  goes on here.\n- Second point\n\nCo-Authored-By: Someone <a@b>";
    expect(bodyDetails(body)).toEqual(["First point goes on here.", "Second point"]);
  });

  test("a body without bullets gives its paragraphs", () => {
    expect(bodyDetails("One line\nwrapped.\n\nTwo.")).toEqual(["One line wrapped.", "Two."]);
  });

  test("bump follows the strongest shipping commit, chores ship nothing", () => {
    expect(bumpOf([c("chore: tidy"), c("ci: cache")], "0.2.3")).toBeNull();
    expect(bumpOf([c("fix: a"), c("docs: b")], "0.2.3")).toBe("patch");
    expect(bumpOf([c("fix: a"), c("feat: b")], "0.2.3")).toBe("minor");
    expect(bumpOf([c("fix!: a")], "0.2.3")).toBe("minor");
    expect(bumpOf([c("fix!: a")], "1.2.3")).toBe("major");
    expect(bumpVersion("0.2.3", "minor")).toBe("0.3.0");
    expect(bumpVersion("0.2.3", "patch")).toBe("0.2.4");
    expect(bumpVersion("1.2.3", "major")).toBe("2.0.0");
  });

  test("a section groups commits under Keep a Changelog headings", () => {
    const md = markdownSection("0.3.0", "2026-10-28", [c("fix: b"), c("feat: a\n\n- detail"), c("chore: hidden")], "Hand note.");
    expect(md).toBe("## [0.3.0] - 2026-10-28\n\nHand note.\n\n### Added\n\n- A\n  - detail\n\n### Fixed\n\n- B\n");
    expect(htmlNotes("0.3.0", [c("feat: a <b>\n\n- `x`")])).toContain("<li>A &lt;b&gt;<ul><li><code>x</code></li></ul></li>");
  });
});

describe("changelog files", () => {
  const text = "# Changelog\n\n## [Unreleased]\n\nWaiting note.\n\n## [0.2.0] - 2026-10-20\n\n### Added\n\n- Thing\n\n## [0.1.0] - 2026-08-25\n\n- First\n";

  test("keeps the hand-written [Unreleased] text and the released sections", () => {
    const s = splitChangelog(text);
    expect(s.unreleased).toBe("Waiting note.");
    expect(s.released.startsWith("## [0.2.0]")).toBe(true);
  });

  test("finds one version's section", () => {
    expect(sectionOf(text, "0.2.0")).toBe("### Added\n\n- Thing");
    expect(sectionOf(text, "0.1.0")).toBe("- First");
    expect(sectionOf(text, "9.9.9")).toBeNull();
  });

  test("plain text for stores", () => {
    expect(mdToText("### Fixed\n\n- A `b`\n  - c [d](https://e)")).toBe("Fixed:\n\n• A b\n   ◦ c d\n");
  });
});

describe("amo", () => {
  test("signs tokens as HS256 JWTs (the jwt.io reference token)", () => {
    expect(jwt({ sub: "1234567890", name: "John Doe", iat: 1516239022 }, "your-256-bit-secret")).toBe(
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
    );
  });

  test("each request gets a short-lived token with a fresh id", () => {
    const parse = (h: string) => JSON.parse(Buffer.from(h.split(".")[1], "base64url").toString());
    const a = parse(authHeader("user:1:2", "s", 1000).slice(4));
    const b = parse(authHeader("user:1:2", "s", 1000).slice(4));
    expect([a.iss, a.iat, a.exp]).toEqual(["user:1:2", 1000, 1060]);
    expect(a.jti).not.toBe(b.jti);
  });

  test("publish uploads, creates a version with notes, attaches source and saves the signed file", async () => {
    const calls: string[] = [];
    let polls = 0;
    const out = `${process.env.TEMP ?? "/tmp"}/amo-test-${Date.now()}.xpi`;
    const fake = {
      async call<T>(method: string, path: string, body?: unknown): Promise<T> {
        calls.push(`${method} ${path}`);
        if (path === "addons/upload/") return { uuid: "u1", processed: true, valid: true } as T;
        if (method === "POST") {
          expect((body as { release_notes: Record<string, string> }).release_notes["en-US"]).toBe("Notes");
          return { id: 7, version: "0.3.0", file: { status: "unreviewed", url: "" } } as T;
        }
        if (method === "PATCH") return {} as T;
        polls++;
        return { id: 7, version: "0.3.0", file: { status: "public", url: "https://x/f.xpi" } } as T;
      },
      async download() {
        return new Uint8Array([1, 2, 3]);
      },
    };
    const result = await publish({
      amo: fake, addon: "a@b", file: import.meta.path, source: import.meta.path, notes: "Notes",
      channel: "listed", waitSeconds: 60, pollMs: 1, out, log: () => {},
    });
    expect(result).toBe("signed");
    expect(calls).toEqual(["POST addons/upload/", "POST addons/addon/a%40b/versions/", "PATCH addons/addon/a%40b/versions/7/", "GET addons/addon/a%40b/versions/7/"]);
    expect(polls).toBe(1);
    expect([...readFileSync(out)]).toEqual([1, 2, 3]);
  }, 30000);
});

describe("ports", () => {
  test("every port's own files agree with release.json", () => expect(versionDrift()).toEqual([]));
  test("port ids are unique and every port has paths", () => {
    expect(new Set(PORTS.map((p) => p.id)).size).toBe(PORTS.length);
    for (const p of PORTS) expect(p.paths.length).toBeGreaterThan(0);
  });
});
