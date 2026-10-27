import { ROOT } from "./ports";
import { parseCommit, type Commit } from "./commits";

export function git(...args: string[]): string {
  const r = Bun.spawnSync(["git", ...args], { cwd: ROOT, stdout: "pipe", stderr: "pipe" });
  if (r.exitCode !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr.toString().trim()}`);
  return r.stdout.toString();
}

export function tryGit(...args: string[]): string | null {
  try {
    return git(...args);
  } catch {
    return null;
  }
}

/** The newest version tag reachable from `ref`, excluding `ref` itself when it is a tag. */
export function previousTag(ref = "HEAD"): string | null {
  const base = tryGit("describe", "--tags", "--abbrev=0", "--match", "v*", ref === "HEAD" ? "HEAD" : `${ref}^`);
  return base?.trim() || null;
}

const SEP = "\u001e";

/** Conventional commits in from..to that touch any of the paths, oldest first. */
export function commitsTouching(from: string | null, to: string, paths: string[]): Commit[] {
  const range = from ? `${from}..${to}` : to;
  const out = git("log", "--reverse", `--format=%H%x1f%B${SEP}`, range, "--", ...paths);
  return out
    .split(SEP)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [hash, message] = chunk.split("\u001f");
      return parseCommit(hash.slice(0, 7), message);
    })
    .filter((c): c is Commit => c !== null);
}

/** A file as it was at `ref`, or null when it did not exist there. */
export const showAt = (ref: string, path: string): string | null => tryGit("show", `${ref}:${path}`);
