// Publishes a Firefox build on addons.mozilla.org through the v5 API: upload, a listed version with
// release notes and source code, then waits for Mozilla to sign it and downloads the signed .xpi.
//
//   FIREFOX_JWT_USER=... FIREFOX_JWT_TOKEN=... bun tools/release/amo.ts \
//     --addon hatsune-miku-tab@vai-rice.space --file dist/firefox.zip --source dist/source.zip \
//     --notes notes.txt --out dist/firefox.xpi [--channel listed] [--wait 900]
//
// Exit codes: 0 signed and saved, 3 submitted but not signed within --wait, 1 anything else.
import { createHmac, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

const BASE = process.env.AMO_BASE_URL ?? "https://addons.mozilla.org/api/v5/";

const b64url = (data: Buffer | string) => Buffer.from(data).toString("base64url");

/** An HS256 JSON Web Token, the way AMO authenticates API keys. */
export function jwt(payload: Record<string, unknown>, secret: string): string {
  const head = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}

/** A fresh token for one request: AMO refuses tokens older than five minutes or replayed ids. */
export function authHeader(user: string, secret: string, now = Math.floor(Date.now() / 1000)): string {
  return "JWT " + jwt({ iss: user, jti: randomBytes(16).toString("hex"), iat: now, exp: now + 60 }, secret);
}

interface Client {
  call<T>(method: string, path: string, body?: FormData | object): Promise<T>;
  download(url: string): Promise<Uint8Array>;
}

export function client(user: string, secret: string, base = BASE): Client {
  return {
    async call<T>(method: string, path: string, body?: FormData | object): Promise<T> {
      const headers: Record<string, string> = { Authorization: authHeader(user, secret) };
      let payload: FormData | string | undefined;
      if (body instanceof FormData) payload = body;
      else if (body) {
        headers["Content-Type"] = "application/json";
        payload = JSON.stringify(body);
      }
      const r = await fetch(new URL(path, base), { method, headers, body: payload });
      const text = await r.text();
      if (!r.ok) throw new Error(`${method} ${path}: HTTP ${r.status} ${text.slice(0, 800)}`);
      return (text ? JSON.parse(text) : {}) as T;
    },
    async download(url: string): Promise<Uint8Array> {
      const r = await fetch(url, { headers: { Authorization: authHeader(user, secret) } });
      if (!r.ok) throw new Error(`download ${url}: HTTP ${r.status}`);
      return new Uint8Array(await r.arrayBuffer());
    },
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface Upload {
  uuid: string;
  processed: boolean;
  valid: boolean;
  validation?: { messages?: { type: string; message: string; file?: string }[] };
}

interface Version {
  id: number;
  version: string;
  file: { status: string; url: string } | null;
}

export async function publish(opts: {
  amo: Client;
  addon: string;
  file: string;
  source?: string;
  notes: string;
  approvalNotes?: string;
  channel: "listed" | "unlisted";
  waitSeconds: number;
  pollMs?: number;
  out: string;
  log?: (s: string) => void;
}): Promise<"signed" | "pending"> {
  const log = opts.log ?? console.log;
  const { amo } = opts;

  const form = new FormData();
  form.set("upload", new Blob([readFileSync(opts.file)]), basename(opts.file));
  form.set("channel", opts.channel);
  let upload = await amo.call<Upload>("POST", "addons/upload/", form);
  log(`uploaded ${basename(opts.file)}, validating`);
  for (let i = 0; !upload.processed; i++) {
    if (i > 60) throw new Error("validation did not finish in 5 minutes");
    await sleep(5000);
    upload = await amo.call<Upload>("GET", `addons/upload/${upload.uuid}/`);
  }
  if (!upload.valid) {
    for (const m of upload.validation?.messages ?? []) if (m.type === "error") log(`error: ${m.message}${m.file ? ` (${m.file})` : ""}`);
    throw new Error("Mozilla's validator rejected the upload");
  }

  const addon = encodeURIComponent(opts.addon);
  const version = await amo.call<Version>("POST", `addons/addon/${addon}/versions/`, {
    upload: upload.uuid,
    release_notes: { "en-US": opts.notes },
    ...(opts.approvalNotes ? { approval_notes: opts.approvalNotes } : {}),
  });
  log(`version ${version.version} created on ${opts.channel}`);

  if (opts.source) {
    const src = new FormData();
    src.set("source", new Blob([readFileSync(opts.source)]), basename(opts.source));
    await amo.call("PATCH", `addons/addon/${addon}/versions/${version.id}/`, src);
    log(`source code attached`);
  }

  const deadline = Date.now() + opts.waitSeconds * 1000;
  let current = version;
  while (current.file?.status !== "public") {
    if (current.file?.status === "disabled") throw new Error(`version ${version.version} was rejected`);
    if (Date.now() > deadline) {
      log(`version ${version.version} is waiting for review; it will reach users once Mozilla signs it`);
      return "pending";
    }
    await sleep(opts.pollMs ?? 15000);
    current = await amo.call<Version>("GET", `addons/addon/${addon}/versions/${version.id}/`);
  }
  writeFileSync(opts.out, await amo.download(current.file!.url));
  log(`signed by Mozilla, saved ${opts.out}`);
  return "signed";
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 ? process.argv[i + 1] : undefined;
}

if (import.meta.main) {
  const user = process.env.FIREFOX_JWT_USER;
  const secret = process.env.FIREFOX_JWT_TOKEN;
  if (!user || !secret) {
    console.error("FIREFOX_JWT_USER and FIREFOX_JWT_TOKEN are not set");
    process.exit(1);
  }
  const need = (k: string) => arg(k) ?? (console.error(`--${k} is required`), process.exit(1));
  try {
    const result = await publish({
      amo: client(user, secret),
      addon: need("addon"),
      file: need("file"),
      source: arg("source"),
      notes: readFileSync(need("notes"), "utf8"),
      approvalNotes: arg("approval-notes"),
      channel: (arg("channel") as "listed" | "unlisted") ?? "listed",
      waitSeconds: Number(arg("wait") ?? 900),
      out: need("out"),
    });
    process.exit(result === "signed" ? 0 : 3);
  } catch (e) {
    console.error(String(e instanceof Error ? e.message : e));
    process.exit(1);
  }
}
