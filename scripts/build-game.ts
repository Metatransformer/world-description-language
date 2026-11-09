import { mkdir, readFile, readdir, writeFile, rm } from "node:fs/promises";
import { resolve, join, relative, dirname } from "node:path";
import { createHash } from "node:crypto";
import { compileProject, writeWorldArtifacts } from "../src/wdl/index.js";
import { compileBehavior } from "../src/runtime/contract.js";
import { capabilityBindings } from "../src/runtime/codegen.js";

const flags = new Set(process.argv.slice(2));
const option = (name: string, fallback: string) => {
  const index = process.argv.indexOf(name);
  return index < 0 ? fallback : process.argv[index + 1] ?? fallback;
};
const entry = resolve(option("--entry", "worlds/rpg.tsx"));
const output = resolve(option("--out", "examples/godot-dotnet/generated"));
const buildId = createHash("sha256").update(entry + output).digest("hex").slice(0, 16);
const staging = resolve(".wdl", "game-staging-" + buildId);
const cachePath = resolve(".wdl", "game-build-" + buildId + ".json");
type Cache = { dependencies: string[]; fingerprint: string; outputs: string[]; revision: string };
async function fingerprint(dependencies: string[]) {
  const hash = createHash("sha256");
  const paths = new Set([...dependencies, ...(await files("src")), ...(await files("scripts"))]);
  for (const path of [...paths].sort()) {
    hash.update(path);
    try { hash.update(await readFile(path)); } catch { hash.update("missing"); }
  }
  return hash.digest("hex");
}
let active = false;
async function files(path: string): Promise<string[]> {
  return (await Promise.all((await readdir(path, { withFileTypes: true })).map(async item =>
    item.isDirectory() ? files(join(path, item.name)) : [join(path, item.name)]))).flat();
}
async function build() {
  if (active) return;
  active = true;
  try {
    let cache: Cache | undefined;
    try { cache = JSON.parse(await readFile(cachePath, "utf8")); } catch { /* First build. */ }
    if (!flags.has("--all") && cache && cache.fingerprint === await fingerprint(cache.dependencies)) {
      let intact = false;
      try { intact = !!cache.revision && cache.revision === await readFile(join(output, "revision.txt"), "utf8"); } catch { /* Missing output. */ }
      for (const file of [...cache.outputs, "revision.txt"]) try { await readFile(join(output, file)); } catch { intact = false; }
      if (intact) { console.log(JSON.stringify({ status: "ok", changed: 0, cached: true })); return; }
    }
    let dependencies: string[] = [];
    const manifest = await compileProject(entry, undefined, { onDependencies: paths => { dependencies = paths; } });
    dependencies.push(...manifest.materials.flatMap(m => m.texture?.kind === "asset" ? [resolve(m.texture.uri)] : []));
    const behavior = compileBehavior(manifest);
    await rm(staging, { recursive: true, force: true });
    await writeWorldArtifacts(manifest, staging);
    await writeFile(join(staging, "behavior.json"), JSON.stringify(behavior, null, 2));
    const bindings = capabilityBindings(behavior);
    await writeFile(join(staging, "CapabilityBindings.cs"), bindings.csharp);
    await writeFile(join(staging, "capabilities.ts"), bindings.typescript);
    const index = {
      version: 1,
      spaces: manifest.spaces.map(space => ({
        id: space.id, file: space.id.replace(/[^a-zA-Z0-9_-]/g, "-") + ".gltf",
        nodes: manifest.objects.filter(o => o.spaceId === space.id && o.geometry).map(o => o.id),
      })),
    };
    await writeFile(join(staging, "index.json"), JSON.stringify(index, null, 2));
    const outputs = await files(staging);
    const digest = createHash("sha256");
    for (const path of outputs.sort()) digest.update(relative(staging, path)).update(await readFile(path));
    const revision = digest.digest("hex");
    let changed = 0;
    for (const path of outputs) {
      const target = join(output, relative(staging, path));
      const bytes = await readFile(path);
      let same = false;
      try { same = bytes.equals(await readFile(target)); } catch { /* New output. */ }
      if (!same || flags.has("--all")) {
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, bytes);
        changed++;
      }
    }
    // Publish revision last. Consumers only import complete successful builds.
    let previousRevision = "";
    try { previousRevision = await readFile(join(output, "revision.txt"), "utf8"); } catch { /* First build. */ }
    if (changed || previousRevision !== revision) await writeFile(join(output, "revision.txt"), revision);
    const currentOutputs = outputs.map(path => relative(staging, path));
    for (const old of cache?.outputs ?? []) {
      if (!currentOutputs.includes(old)) await rm(join(output, old), { force: true });
    }
    await writeFile(cachePath, JSON.stringify({ dependencies, fingerprint: await fingerprint(dependencies), outputs: currentOutputs, revision } satisfies Cache));
    console.log(JSON.stringify({ status: "ok", changed, revision, spaces: manifest.spaces.length, objects: manifest.objects.length }));
  } finally { active = false; }
}
await build();
if (flags.has("--watch")) {
  console.log("Watching source dependencies. Ctrl+C stops watch.");
  // Hash source trees rather than platform-dependent recursive watcher events.
  // Compilation still follows the actual esbuild dependency graph.
  let previous = "";
  setInterval(async () => {
    if (active) return;
    try {
      const hash = createHash("sha256");
      const cache: Cache = JSON.parse(await readFile(cachePath, "utf8"));
      hash.update(await fingerprint(cache.dependencies));
      const next = hash.digest("hex");
      if (previous && previous !== next) await build();
      previous = next;
    } catch (error) { console.error(error); }
  }, 1000);
}
