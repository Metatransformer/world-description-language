import { expect, it } from "vitest";
import { compileWorld } from "../src/wdl/index.js";
import SpawnDemo from "../worlds/spawn-demo.js";
import { compileBehavior } from "../src/runtime/contract.js";
import { WorldRuntime } from "../src/runtime/runtime.js";

it("ports deterministic Spawn geometry with separate collision and portable interactions", async () => {
  const world = compileWorld(SpawnDemo());
  expect(compileWorld(SpawnDemo())).toEqual(world);
  expect(world.spaces.map(s => s.id)).toEqual(["town", "inn", "cottage", "workshop", "dungeon"]);
  const houses = world.objects.filter(o => (o.properties?.spawn as { source?: string })?.source === "scripts/gen/house.js");
  expect(houses).toHaveLength(8);
  expect(world.objects.some(o => o.geometry?.shape === "indexed")).toBe(true);
  expect(world.materials.every(m => m.texture?.kind !== "asset")).toBe(true);
  const behavior = compileBehavior(world);
  expect(Object.values(behavior.objects).some(o => o.solid && o.bindings?.visible === false)).toBe(true);
  let coins = 0;
  const travels: unknown[] = [];
  const runtime = new WorldRuntime(behavior, {
    "inventory.grant": () => { coins++; }, "world.travel": args => { travels.push(args.space); },
  });
  const chest = Object.entries(behavior.objects).find(([id, o]) => id.startsWith("town/") && o.label === "Open Valenfeld chest")![0];
  await runtime.interact(chest); await runtime.interact(chest);
  runtime.restore(runtime.snapshot());
  expect(coins).toBe(1);
  expect(runtime.binding(chest, "visible")).toBe(false);
  const entrance = Object.entries(behavior.objects).find(([, o]) => o.label === "Enter the Drowned Lantern")![0];
  await runtime.interact(entrance);
  expect(travels).toEqual(["inn"]);
  for (const label of ["Enter the west lane cottage", "Enter the east lane workshop"]) {
    const door = Object.entries(behavior.objects).find(([, o]) => o.label === label)![0];
    await runtime.interact(door);
  }
  expect(travels).toEqual(["inn", "cottage", "workshop"]);
  const lever = Object.entries(behavior.objects).find(([, o]) => o.label === "Toggle workshop storeroom")![0];
  const gate = Object.entries(behavior.objects).find(([id, o]) => id.startsWith("workshop/") && o.bindings?.solid)![0];
  expect(runtime.binding(gate, "solid")).toBe(true);
  await runtime.interact(lever);
  runtime.restore(runtime.snapshot());
  expect(runtime.binding(gate, "solid")).toBe(false);
  const dungeonWalls = world.objects.filter(o => o.spaceId === "dungeon" && o.type === "dungeon-wall");
  expect(dungeonWalls.length).toBeGreaterThan(30);
  expect(dungeonWalls.every(o => behavior.objects[o.id]?.solid)).toBe(true);
  const seal = Object.entries(behavior.objects).find(([, o]) => o.label === "Release the founders' seals")![0];
  const vaultGates = Object.entries(behavior.objects).filter(([id, o]) => id.startsWith("dungeon/") && o.bindings?.solid);
  expect(vaultGates.length).toBeGreaterThan(0);
  await runtime.interact(seal);
  expect(vaultGates.every(([id]) => runtime.binding(id, "solid") === false)).toBe(true);
});
