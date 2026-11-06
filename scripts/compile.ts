import { resolve } from "node:path";
import { compileProject, writeWorldArtifacts } from "../src/wdl/index.js";

const entry = resolve(process.argv[2] ?? "worlds/valenreach.tsx");
const output = resolve(process.argv[3] ?? ".wdl/export");
const manifest = await compileProject(entry);
const artifacts = await writeWorldArtifacts(manifest, output);
console.log(
  JSON.stringify(
    {
      name: manifest.name,
      spaces: manifest.spaces.length,
      objects: manifest.objects.length,
      connections: manifest.connections.length,
      ...artifacts,
    },
    null,
    2,
  ),
);
