import { createWriteStream, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const archiverMod = require("archiver");
const archiver: any = (archiverMod as any).default ?? archiverMod;

const version: string = JSON.parse(await Bun.file("package.json").json().then(j=>JSON.stringify(j))).version ?? "0.0.3";
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
  const out = join(outDir, `hatsune-miku-vsc-${version}.vsix`);
  const absOut = join(process.cwd(), out);
  const proc = Bun.spawn(["bun", "x", "@vscode/vsce", "package", "-o", absOut], { cwd: "vsc", stdout: "inherit", stderr: "inherit" });
  const code = await proc.exited;
  if (code !== 0) throw new Error(`vsce package failed ${code}`);
  console.log(`→ ${out}`);
}

async function packageZed() { await zipFiles(["zed/themes", "zed/extension.toml"], `${outDir}/zed-${version}.zip`); console.log(`→ ${outDir}/zed-${version}.zip`); }
async function packageJetBrains() {
  // JetBrains Marketplace expects a .jar in lib/ (jar is zip with META-INF + themes)
  const jarName = "HatsuneMikuTheme.jar";
  const jarPath = join(outDir, jarName);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  // create jar
  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(jarPath);
    const archive: any = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory("jetbrains/META-INF", "META-INF");
    archive.directory("jetbrains/themes", "themes");
    archive.finalize();
  });
  // create outer plugin zip with lib/<jar>
  const out = join(outDir, `jetbrains-${version}.zip`);
  await new Promise<void>((resolve, reject) => {
    const output = createWriteStream(out);
    const archive: any = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.file(jarPath, { name: `lib/${jarName}` });
    archive.finalize();
  });
  // cleanup temp jar (keep for debugging? remove)
  try { await Bun.file(jarPath).exists() && Bun.write(jarPath, ""); } catch {}
  // actually remove jar file
  const { unlinkSync } = await import("node:fs");
  try { unlinkSync(jarPath); } catch {}
  console.log(`→ ${out} (lib/${jarName} inside)`);
}
async function packageNeovim() { await zipFiles(["neovim/colors", "neovim/README.md", "neovim/LICENSE"], `${outDir}/neovim-${version}.zip`); console.log(`→ ${outDir}/neovim-${version}.zip`); }
async function packageSublime() {
  const files = readdirSync("sublime").filter(f=>f.endsWith(".sublime-color-scheme")).map(f=>`sublime/${f}`);
  await zipFiles(files, `${outDir}/sublime-${version}.zip`); console.log(`→ ${outDir}/sublime-${version}.zip`);
}
async function packageNotepadpp() {
  const files = readdirSync("notepadpp").filter(f=>f.endsWith(".xml")).map(f=>`notepadpp/${f}`);
  await zipFiles(files, `${outDir}/notepadpp-${version}.zip`); console.log(`→ ${outDir}/notepadpp-${version}.zip`);
}

const target = process.argv[2] ?? "all";
switch (target) {
  case "vsc": await packageVSC(); break;
  case "zed": await packageZed(); break;
  case "jetbrains": await packageJetBrains(); break;
  case "neovim": await packageNeovim(); break;
  case "sublime": await packageSublime(); break;
  case "notepadpp": await packageNotepadpp(); break;
  case "all":
    try { await packageVSC(); } catch(e){ console.error(e); console.log("vsc failed, continuing..."); }
    await packageZed();
    await packageJetBrains();
    await packageNeovim();
    await packageSublime();
    await packageNotepadpp();
    break;
  default: console.error(`unknown target ${target}`); process.exit(1);
}
console.log("done");
