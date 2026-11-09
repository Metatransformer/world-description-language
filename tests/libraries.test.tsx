import { expect, it } from "vitest";
import { World, Space } from "@generative-world-studio/core";
import { House, Pine, Boulder, SpawnPalette } from "@generative-world-studio/valenfeld";
import { compileWorld } from "../src/wdl/compiler.js";
import { compileBehavior } from "../src/runtime/contract.js";
import { componentLibraries } from "../src/wdl/libraries.js";
import { listProjectComponents } from "../src/server/components.js";

it("discovers unused npm kit components and compiles package imports with collision", async () => {
  const libraries = await componentLibraries();
  expect(libraries.map(library => library.name)).toContain("@generative-world-studio/valenfeld");
  const definitions = await listProjectComponents();
  expect(definitions.filter(d => d.file.endsWith("valenfeld/src/library.tsx"))).toHaveLength(214);
  const palette = new SpawnPalette();
  const world = compileWorld(<World key="world" name="Package test" materials={palette.materials}>
    <Space key="room" name="Room">
      <House key="home" palette={palette} />
      <Pine key="pine" palette={palette} at={[12, 0, 0]} seed={12} />
      <Boulder key="rock" palette={palette} at={[-12, 0, 0]} />
    </Space>
  </World>);
  const behavior = compileBehavior(world);
  expect(world.objects.filter(o => o.geometry?.shape === "indexed").length).toBeGreaterThan(3);
  expect(Object.values(behavior.objects).some(o => o.solid && o.bindings?.visible === false)).toBe(true);
  expect(world.materials.length).toBeGreaterThan(3);
});
