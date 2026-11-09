import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { capture, SpawnPalette } from "../packages/valenfeld/src/capture.js";

const catalog = JSON.parse(await readFile("packages/valenfeld/catalog.json", "utf8")) as { components: Array<{ name: string; source: string }> };
const contentRequired = new Set(["Clutter", "CurtainWall", "DungeonKit", "MarshEdge", "Merged", "Pieces", "Prop", "Settlement"]);
let triangles = 0;
for (const component of catalog.components) {
  const generator = await import(pathToFileURL(resolve("packages/valenfeld/vendor", component.source)).href);
  const result = capture(generator, new SpawnPalette());
  const count = result.batches.reduce((sum, batch) => sum + batch.geometry.indices.length / 3, 0);
  if (!count && !contentRequired.has(component.name)) throw new Error(`${component.name} emitted no default geometry`);
  for (const collider of result.colliders) {
    const fields = collider.kind === "box" ? [collider.width, collider.height, collider.depth]
      : collider.kind === "sphere" ? [collider.radius] : [collider.radiusTop, collider.radiusBottom, collider.height];
    if (fields.some(value => value === undefined || !Number.isFinite(value) || value < 0)) throw new Error(`${component.name} has an invalid collider`);
  }
  triangles += count;
}
console.log(`COMPONENT_LIBRARY_OK: ${catalog.components.length} generators, ${triangles} triangles; ${contentRequired.size} content-driven components validated without default geometry.`);
