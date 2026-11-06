import { describe, expect, it } from "vitest";
import { World, Space, compileWorld } from "../src/wdl/index.js";
import { DungeonSpace } from "../src/dungeon/components.js";
import { dungeonMaterials } from "../src/dungeon/kits.js";
import { createDungeonPlan, validateDungeonPlan } from "../src/dungeon/plan.js";
import type { DungeonPlan } from "../src/dungeon/types.js";
import { ashBarrowPlan, sunkenCisternPlan } from "../worlds/dungeons.js";

describe("reusable dungeon generator", () => {
  it("is deterministic, exact-sized, connected, looped, and stable across geometry controls", () => {
    for (const seed of ["granite", "river", "lantern", "oath"]) {
      const options = { seed, theme: "crypt" as const, roomCount: 12, levels: 2 as const, loopCount: 3 };
      const first = createDungeonPlan(options);
      const second = createDungeonPlan(options);
      expect(second).toEqual(first);
      expect(first.rooms).toHaveLength(12);
      expect(new Set(first.rooms.map((room) => room.level))).toEqual(new Set([0, 1]));
      expect(first.corridors.filter((corridor) => corridor.kind === "stairs").length).toBeGreaterThanOrEqual(1);
      expect(validateDungeonPlan(first)).toMatchObject({ valid: true, roomCount: 12, loopCount: 3 });
      expect(first.criticalPath[0]).toBe(first.entryRoom);
      expect(first.criticalPath.at(-1)).toBe(first.goalRoom);
      expect(JSON.parse(JSON.stringify(first))).toEqual(first);
      const wider = createDungeonPlan({ ...options, corridorWidth: 5 });
      expect(wider.rooms.map((room) => room.id)).toEqual(first.rooms.map((room) => room.id));
    }
  });

  it("varies actual routes across seeds, including layouts without loops", () => {
    const routes = new Set(Array.from({ length: 12 }, (_, index) => {
      const plan = createDungeonPlan({ seed: `route-${index}`, theme: "crypt", roomCount: 16, levels: 2, loopCount: 0 });
      return plan.corridors.map((corridor) => corridor.id).sort().join("|");
    }));
    expect(routes.size).toBeGreaterThan(8);
  });

  it("derives physical sockets and clearance directly from graph corridors", () => {
    const plan = createDungeonPlan({ seed: "sockets", theme: "cistern", roomCount: 20, levels: 2, loopCount: 5, corridorWidth: 4 });
    expect(plan.rooms[0]!.position).toEqual([0, 0, 0]);
    expect(plan.metadata.entranceSpawn).toEqual([0, 2, 4]);
    for (const corridor of plan.corridors) {
      expect(corridor.width).toBeGreaterThanOrEqual(3);
      const start = corridor.path[0]!, end = corridor.path.at(-1)!;
      if (corridor.kind === "stairs")
        expect(Math.abs(end[1] - start[1]) / Math.hypot(end[0] - start[0], end[2] - start[2])).toBeLessThanOrEqual(0.5);
      for (const [roomId, endpoint] of [[corridor.from, corridor.path[0]], [corridor.to, corridor.path.at(-1)]] as const) {
        const room = plan.rooms.find((candidate) => candidate.id === roomId)!;
        const door = room.doors!.find((candidate) => candidate.corridorId === corridor.id)!;
        expect(door.position).toEqual(endpoint);
        expect(door.width).toBeGreaterThanOrEqual(corridor.width);
        expect(door.height).toBeGreaterThanOrEqual(3);
      }
    }
    for (let index = 0; index < plan.rooms.length; index++) {
      const a = plan.rooms[index]!;
      for (const b of plan.rooms.slice(index + 1)) {
        const overlapX = Math.abs(a.position[0] - b.position[0]) < (a.size[0] + b.size[0]) / 2;
        const overlapZ = Math.abs(a.position[2] - b.position[2]) < (a.size[2] + b.size[2]) / 2;
        const overlapY = a.position[1] < b.position[1] + b.size[1] && b.position[1] < a.position[1] + a.size[1];
        expect(overlapX && overlapY && overlapZ).toBe(false);
      }
    }
  });

  it("supports every room-count and level boundary at the advertised loop bound", () => {
    for (const levels of [1, 2] as const) {
      for (let roomCount = 8; roomCount <= 24; roomCount++) {
        const plan = createDungeonPlan({
          seed: `boundary-${levels}-${roomCount}`,
          theme: roomCount % 2 ? "crypt" : "cistern",
          roomCount,
          levels,
          loopCount: Math.floor(roomCount / 3),
        });
        expect(validateDungeonPlan(plan).valid).toBe(true);
      }
    }
  });

  it("rejects impossible options and malformed public plans with useful errors", () => {
    expect(() => createDungeonPlan({ seed: "", theme: "crypt", roomCount: 7, levels: 1, loopCount: 0 })).toThrow(/seed|roomCount/);
    expect(() => createDungeonPlan({ seed: "too-many", theme: "crypt", roomCount: 8, levels: 1, loopCount: 8 })).toThrow(/loopCount.*impossible/);
    const disconnected = structuredClone(createDungeonPlan({ seed: "bad", theme: "crypt", roomCount: 8, levels: 1, loopCount: 1 })) as DungeonPlan;
    disconnected.corridors = disconnected.corridors.filter((corridor) => corridor.from !== disconnected.goalRoom && corridor.to !== disconnected.goalRoom);
    expect(() => validateDungeonPlan(disconnected)).toThrow(/disconnected/);
    const missingTarget = structuredClone(ashBarrowPlan) as DungeonPlan;
    missingTarget.corridors[0]!.to = "missing-room";
    expect(() => validateDungeonPlan(missingTarget)).toThrow(/missing room/);
  });

  it("ships two substantial, distinct authored demos", () => {
    expect(ashBarrowPlan.rooms.length).toBeGreaterThanOrEqual(16);
    expect(sunkenCisternPlan.rooms.length).toBeGreaterThanOrEqual(18);
    expect(ashBarrowPlan.seed).not.toBe(sunkenCisternPlan.seed);
    expect(ashBarrowPlan.metadata.builders).toMatch(/Ash Covenant/);
    expect(sunkenCisternPlan.metadata.disruption).toMatch(/pressure failure/);
    expect(ashBarrowPlan.rooms.some((room) => room.role === "landmark")).toBe(true);
    expect(sunkenCisternPlan.rooms.some((room) => room.role === "cistern")).toBe(true);
  });

  it("compiles the public JSX kit with provenance and meaningful geometry types", () => {
    const manifest = compileWorld(
      <World key="world" name="Dungeon fixture" materials={dungeonMaterials}>
        <Space key="outside" name="Outside" />
        <DungeonSpace key="ash-space" id="ash" name="Ash Barrow" plan={ashBarrowPlan} returnArrival={[10, 2, 10]} />
      </World>,
    );
    expect(manifest.spaces.find((space) => space.id === "ash")?.properties).toMatchObject({ kind: "dungeon", dungeonPlan: ashBarrowPlan });
    expect(manifest.connections.find((connection) => connection.id === "exit-ash")).toMatchObject({ toSpace: "outside", arrival: [10, 2, 10] });
    const roomSource = manifest.objects.find((object) => object.type === "dungeon-room")?.source;
    expect(roomSource?.components?.find((component) => component.name === "DungeonSpace")?.parameters.plan).toMatchObject({ $summary: "object", seed: ashBarrowPlan.seed });
    expect(manifest.objects.filter((object) => object.type === "dungeon-room")).toHaveLength(ashBarrowPlan.rooms.length);
    expect(manifest.objects.filter((object) => object.type === "dungeon-corridor")).toHaveLength(ashBarrowPlan.corridors.length);
    expect(manifest.objects.some((object) => object.type === "dungeon-ceiling")).toBe(true);
    expect(manifest.objects.some((object) => object.type === "dungeon-stair")).toBe(true);
    expect(manifest.objects.some((object) => object.type === "dungeon-landmark")).toBe(true);
    expect(manifest.objects.filter((object) => object.type === "dungeon-light").length).toBeLessThanOrEqual(12);
    // Check the compiled ramp's long axis in world coordinates, including
    // east/west stairs where composing XYZ Euler rotations gives a flat ramp.
    for (const ramp of manifest.objects.filter((object) => object.type === "dungeon-stair-ramp")) {
      expect(ramp.geometry?.shape).toBe("box");
      if (ramp.geometry?.shape !== "box") continue;
      const length = ramp.geometry.size[2];
      const rise = Math.abs(ramp.matrix[9] * length);
      expect(rise).toBeCloseTo(3, 5);
      expect(Math.hypot(ramp.matrix[8] * length, ramp.matrix[10] * length)).toBeGreaterThanOrEqual(6);
    }
    expect(manifest.objects.find((object) => object.type === "dungeon-room")?.source?.componentChain).toContain("DungeonRoomGeometry");
  });
});
