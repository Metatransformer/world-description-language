import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve, delimiter } from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn } from "node:child_process";

const root = fileURLToPath(new URL("..", import.meta.url));
process.chdir(root);
const env = { ...process.env, PATH: dirname(process.execPath) + delimiter + (process.env.PATH ?? "") };
function run(command, args) {
  execFileSync(command, args, { cwd: root, env, stdio: "inherit", windowsHide: true });
}
function findGodot() {
  if (process.env.GODOT_BIN) return process.env.GODOT_BIN;
  const names = process.platform === "win32" ? ["godot.exe", "godot4.exe"] : ["godot", "godot4"];
  for (const directory of (env.PATH ?? "").split(delimiter))
    for (const name of names) if (existsSync(join(directory, name))) return join(directory, name);
  if (process.platform === "darwin") {
    const app = "/Applications/Godot_mono.app/Contents/MacOS/Godot";
    if (existsSync(app)) return app;
  }
  if (process.platform === "win32") {
    // Portable Godot .NET downloads are commonly unpacked one or two folders deep.
    function search(directory, depth) {
      let entries;
      try { entries = readdirSync(directory, { withFileTypes: true }); } catch { return []; }
      return entries.flatMap(entry => {
        const path = join(directory, entry.name);
        if (entry.isFile() && /^Godot.*mono.*_console\.exe$/i.test(entry.name)) return [path];
        return entry.isDirectory() && depth > 0 && /godot/i.test(entry.name) ? search(path, depth - 1) : [];
      });
    }
    const candidates = search(join(homedir(), "Downloads"), 3).sort().reverse();
    if (candidates.length) return candidates[0];
  }
  throw new Error("Godot .NET was not found. Set GODOT_BIN to your Godot .NET executable path.");
}
try {
  if (!existsSync(resolve("node_modules/tsx"))) throw new Error("Install WDL dependencies first: cd world-description-language && npm ci");
  const web = process.argv.includes("--web");
  const explorer = process.argv.includes("--explorer");
  const entry = process.argv.includes("--spawn") ? "worlds/spawn-demo.tsx" : process.env.WDL_ENTRY ?? "worlds/rpg.tsx";
  const godot = web || explorer ? undefined : findGodot();
  if (!explorer) run(process.execPath, ["--import", "tsx", "scripts/build-game.ts", "--entry", entry]);
  if (explorer) {
    console.log("Opening " + entry + " in WDL Explorer: http://127.0.0.1:3000");
    const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3000"],
      { cwd: root, env: { ...env, WDL_ENTRY: entry }, stdio: "inherit", windowsHide: true });
    await new Promise((resolve, reject) => { child.once("spawn", resolve); child.once("error", reject); });
    process.exitCode = await new Promise(resolve => child.once("exit", code => resolve(code ?? 1)));
  } else if (web) {
    const { createServer } = await import("vite");
    const server = await createServer({
      configFile: resolve("examples/three-runtime/vite.config.ts"),
      server: { open: !process.argv.includes("--no-open"), strictPort: true },
    });
    await server.listen();
    server.printUrls();
  } else {
    const project = resolve("examples/godot-dotnet");
    console.log("Building Godot C# demo…");
    run("dotnet", ["build", join(project, "WdlDemo.csproj"), "--nologo"]);
    run(godot, ["--headless", "--path", project, "--editor", "--import"]);
    run(godot, ["--headless", "--path", project, "--", "--import-wdl"]);
    const gui = godot.replace(/_console\.exe$/i, ".exe");
    const executable = existsSync(gui) ? gui : godot;
    const args = ["--path", project];
    if (process.argv.includes("--editor")) args.push("--editor");
    const child = spawn(executable, args, { cwd: root, env, stdio: "inherit", windowsHide: false });
    await new Promise((resolve, reject) => { child.once("spawn", resolve); child.once("error", reject); });
    console.log("Opened Godot " + (process.argv.includes("--editor") ? "editor" : "game") + " (PID " + child.pid + ").");
    process.exitCode = await new Promise(resolve => child.once("exit", code => resolve(code ?? 1)));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
