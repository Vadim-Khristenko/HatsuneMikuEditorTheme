import { createWriteStream, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const archiverMod = require("archiver");
const archiver: any = (archiverMod as any).default ?? archiverMod;

// Every port carries its own version (release.json), so an unchanged port keeps its file names.
const ports: Record<string, string> = JSON.parse(await Bun.file("release.json").text()).ports;
const v = (port: string): string => ports[port] ?? (() => { throw new Error(`release.json has no version for ${port}`); })();
const outDir = "dist";

function zipFiles(sources: string[], outFile: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
    const output = createWriteStream(outFile);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    for (const src of sources) {
      if (!existsSync(src)) { console.warn(`skip missing ${src}`); continue; }
      const stat = Bun.file(src);
      // If src is file, add file; if dir, add directory
      try {
        const isDir = readdirSync(src, { withFileTypes: true }).length >= 0;
        if (isDir) archive.directory(src + "/", src);
        else archive.file(src, { name: src });
      } catch {
        // not a dir, treat as glob/file
        if (src.includes("*")) {
          const dir = src.split("/")[0];
          const pattern = src.split("/")[1];
          if (existsSync(dir)) {
            for (const f of readdirSync(dir)) {
              if (f.endsWith(pattern.replace("*",""))) archive.file(join(dir,f), { name: join(dir,f) });
            }
          }
        } else {
          archive.file(src, { name: src });
        }
      }
    }
    archive.finalize();
  });
}

async function packageVSC() {
  console.log("packaging vsc...");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `hatsune-miku-vsc-${v("vsc")}.vsix`);
  const absOut = join(process.cwd(), out);
  const proc = Bun.spawn(["bun", "x", "@vscode/vsce", "package", "-o", absOut], { cwd: "vsc", stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`vsce package failed ${code}`);
  console.log(`→ ${out}`);
}

async function packageZed() { await zipFiles(["zed/themes", "zed/extension.toml"], `${outDir}/zed-${v("zed")}.zip`); console.log(`→ ${outDir}/zed-${v("zed")}.zip`); }
async function packageJetBrains() {
  // Official path: IntelliJ Platform Gradle Plugin builds the distribution zip
  // (guaranteed-correct layout: <name>/lib/<name>-<version>.jar).
  const gradlew = process.platform === "win32"
    ? ["cmd", "/c", "gradlew.bat"]
    : ["sh", "./gradlew"];
  const proc = Bun.spawn([...gradlew, "buildPlugin", "--no-daemon", "-q"], { cwd: "jetbrains", stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`gradlew buildPlugin failed ${code}`);
  const distDir = join("jetbrains", "build", "distributions");
  const built = readdirSync(distDir).filter(f => f.endsWith(".zip") && f.includes(v("jetbrains")));
  if (!built.length) throw new Error(`no distribution zip for version ${v("jetbrains")} in jetbrains/build/distributions`);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const out = join(outDir, `jetbrains-${v("jetbrains")}.zip`);
  await Bun.write(out, Bun.file(join(distDir, built[0])));
  console.log(`→ ${out}`);
}
async function packageBrowser() {
  const proc = Bun.spawn(["bun", "browser/build.ts", "--zip"], { stdout: "inherit", stderr: "inherit" });
  if ((await proc.exited) !== 0) throw new Error("browser build failed");
}
async function packageTelegram() {
  // Telegram opens these files as they are, so they ship unzipped and named after the theme.
  const proc = Bun.spawn(["bun", "tools/telegram/build.ts", "--out", outDir], { stdout: "inherit", stderr: "inherit" });
  if ((await proc.exited) !== 0) throw new Error("telegram build failed");
}
async function packageNeovim() { await zipFiles(["neovim/colors", "neovim/README.md", "neovim/LICENSE"], `${outDir}/neovim-${v("neovim")}.zip`); console.log(`→ ${outDir}/neovim-${v("neovim")}.zip`); }
async function packageSublime() {
  const files = readdirSync("sublime").filter(f=>f.endsWith(".sublime-color-scheme")).map(f=>`sublime/${f}`);
  await zipFiles(files, `${outDir}/sublime-${v("sublime")}.zip`); console.log(`→ ${outDir}/sublime-${v("sublime")}.zip`);
}
async function packageNotepadpp() {
  const files = readdirSync("notepadpp").filter(f=>f.endsWith(".xml")).map(f=>`notepadpp/${f}`);
  await zipFiles(files, `${outDir}/notepadpp-${v("notepadpp")}.zip`); console.log(`→ ${outDir}/notepadpp-${v("notepadpp")}.zip`);
}

/** Spicetify: the zip holds HatsuneMiku/ so it unpacks straight into the Themes folder. */
async function packageSpicetify() {
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const out = `${outDir}/spicetify-${v("spicetify")}.zip`;
  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(out);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => resolve());
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory("spicetify/HatsuneMiku/", "HatsuneMiku");
    archive.file("spicetify/README.md", { name: "HatsuneMiku/README.md" });
    archive.file("LICENSE", { name: "HatsuneMiku/LICENSE" });
    archive.finalize();
  });
  console.log(`→ ${out}`);
}

const target = process.argv[2] ?? "all";
switch (target) {
  case "vsc": await packageVSC(); break;
  case "zed": await packageZed(); break;
  case "jetbrains": await packageJetBrains(); break;
  case "neovim": await packageNeovim(); break;
  case "sublime": await packageSublime(); break;
  case "notepadpp": await packageNotepadpp(); break;
  case "browser": await packageBrowser(); break;
  case "telegram": await packageTelegram(); break;
  case "spicetify": await packageSpicetify(); break;
  case "all":
    try { await packageVSC(); } catch(e){ console.error(e); console.log("vsc failed, continuing..."); }
    await packageZed();
    await packageJetBrains();
    await packageNeovim();
    await packageSublime();
    await packageNotepadpp();
    await packageTelegram();
    await packageSpicetify();
    await packageBrowser();
    break;
  default: console.error(`unknown target ${target}`); process.exit(1);
}
console.log("done");
