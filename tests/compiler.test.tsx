import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  Connection,
  Exclusion,
  Group,
  Mesh,
  Scatter,
  Space,
  Surface,
  World,
  compileProject,
  compileWorld,
  writeWorldArtifacts,
} from "../src/wdl/index.js";

describe("WDL compiler public contract", () => {
  it("compiles deeply nested transforms with source and parent provenance", () => {
    const manifest = compileWorld(
      <World key="world" name="Fixture">
        <Space key="outside" name="Outside">
          <Group
            key="district"
            position={[10, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            scale={[2, 2, 2]}
          >
            <Group key="house" position={[1, 2, 3]}>
              <Mesh
                key="door"
                type="door"
                position={[0, 0, 1]}
                geometry={{ shape: "box", size: [1, 2, 0.2] }}
              />
            </Group>
          </Group>
        </Space>
      </World>,
    );

    expect(manifest.version).toBe("1.0");
    expect(manifest.coordinateSystem).toEqual({
      handedness: "right",
      up: "Y",
      units: "meters",
      euler: "XYZ-radians",
    });
    expect(
      manifest.objects.find((object) => object.id.endsWith("door")),
    ).toMatchObject({
      id: "outside/district/house/door",
      parentId: "outside/district/house",
      spaceId: "outside",
      position: [18, 4, -2],
      type: "door",
    });
  });

  it("scatters deterministically on terrain while respecting exclusions", () => {
    const fixture = () => (
      <World key="world" name="Scatter">
        <Space key="outside" name="Outside">
          <Surface
            key="ground"
            geometry={{
              shape: "heightfield",
              width: 20,
              depth: 20,
              columns: 2,
              rows: 2,
              heights: [0, 2, 0, 2],
            }}
          />
          <Exclusion key="road" position={[0, 0, 0]} size={[4, 2, 20]} />
          <Scatter
            key="trees"
            surface="ground"
            exclusions={["road"]}
            seed="oak"
            count={8}
            clearance={1}
            area={{ min: [-10, 0, -10], max: [10, 0, 10] }}
            geometry={{ shape: "cone", radius: 1, height: 4 }}
          />
        </Space>
      </World>
    );
    const first = compileWorld(fixture());
    const second = compileWorld(fixture());
    expect(second).toEqual(first);
    const trees = first.objects.filter((object) =>
      object.id.includes("trees/sample"),
    );
    expect(trees).toHaveLength(8);
    expect(trees.every((tree) => Math.abs(tree.position[0]) > 3)).toBe(true);
    expect(new Set(trees.map((tree) => tree.position[1])).size).toBeGreaterThan(
      1,
    );
  });

  it("rejects invalid vocabulary, identity, and link contracts with structured diagnostics", () => {
    const registry = { types: { door: z.object({ locked: z.boolean() }) } };
    expect(() =>
      compileWorld(
        <World key="world" name="Bad">
          <Space key="s" name="S">
            <Mesh
              key="x"
              type="mystery"
              geometry={{ shape: "box", size: [1, 1, 1] }}
            />
          </Space>
        </World>,
        registry,
      ),
    ).toThrowError(
      expect.objectContaining({
        diagnostics: [expect.objectContaining({ code: "UNKNOWN_TYPE" })],
      }),
    );
    expect(() =>
      compileWorld(
        <World key="world" name="Bad">
          <Space key="s" name="S">
            <Group key="same" />
            <Group key="same" />
          </Space>
        </World>,
      ),
    ).toThrowError(
      expect.objectContaining({
        diagnostics: [expect.objectContaining({ code: "DUPLICATE_ID" })],
      }),
    );
    expect(() =>
      compileWorld(
        <World key="world" name="Bad">
          <Space key="s" name="S">
            <Connection key="exit" to="missing" arrival={[0, 0, 0]} />
          </Space>
        </World>,
      ),
    ).toThrowError(
      expect.objectContaining({
        diagnostics: [expect.objectContaining({ code: "MISSING_REFERENCE" })],
      }),
    );
  });

  it("rejects cyclic producer dependencies and impossible placement constraints", () => {
    expect(() =>
      compileWorld(
        <World key="world" name="Cycle">
          <Space key="s" name="S">
            <Surface key="a" properties={{ dependsOn: ["b"] }} />
            <Surface key="b" properties={{ dependsOn: ["a"] }} />
          </Space>
        </World>,
      ),
    ).toThrowError(
      expect.objectContaining({
        diagnostics: [expect.objectContaining({ code: "DEPENDENCY_CYCLE" })],
      }),
    );
    expect(() =>
      compileWorld(
        <World key="world" name="Blocked">
          <Space key="s" name="S">
            <Surface key="ground" />
            <Exclusion key="blocked" position={[0, 0, 0]} size={[20, 2, 20]} />
            <Scatter
              key="items"
              surface="ground"
              exclusions={["blocked"]}
              seed="x"
              count={1}
              area={{ min: [-1, 0, -1], max: [1, 0, 1] }}
              geometry={{ shape: "box", size: [1, 1, 1] }}
            />
          </Space>
        </World>,
      ),
    ).toThrowError(
      expect.objectContaining({
        diagnostics: [
          expect.objectContaining({ code: "IMPOSSIBLE_PLACEMENT" }),
        ],
      }),
    );
  });

  it("keeps unrelated explicit identities stable and rejects a missing identity", () => {
    const fixture = (extra: boolean) => (
      <World key="world" name="Identity">
        <Space key="s" name="S">
          <Group key="kept">
            <Mesh key="door" geometry={{ shape: "box", size: [1, 2, 0.2] }} />
          </Group>
          {extra && <Group key="unrelated" />}
        </Space>
      </World>
    );
    const before = compileWorld(fixture(false)).objects.find(
      (object) => object.type === "mesh",
    )?.id;
    const after = compileWorld(fixture(true)).objects.find(
      (object) => object.type === "mesh",
    )?.id;
    expect([before, after]).toEqual(["s/kept/door", "s/kept/door"]);
    expect(() =>
      compileWorld(
        <World key="world" name="Missing">
          <Space key="s" name="S">
            <Group />
          </Space>
        </World>,
      ),
    ).toThrowError(
      expect.objectContaining({
        diagnostics: [expect.objectContaining({ code: "MISSING_KEY" })],
      }),
    );
  });

  it("compiles project provenance and writes Blender-importable glTF 2.0 artifacts", async () => {
    const manifest = await compileProject("worlds/valenreach.tsx");
    expect(manifest.objects.length).toBeGreaterThan(500);
    expect(
      manifest.objects.find((object) => object.type === "building")?.source,
    ).toMatchObject({
      file: "worlds/valenreach.tsx",
      line: expect.any(Number),
    });
    const artifacts = await writeWorldArtifacts(manifest, ".wdl/test-export");
    const gltf = JSON.parse(
      await readFile(artifacts.scenePaths[0]!, "utf8"),
    ) as Record<string, any>;
    expect(gltf.asset.version).toBe("2.0");
    expect(gltf.buffers[0].uri).toMatch(
      /^data:application\/octet-stream;base64,/,
    );
    expect(gltf.meshes.length).toBeGreaterThan(100);
    expect(gltf.images[0].uri).toMatch(/^data:image\/png;base64,/);
    expect(gltf.meshes[0].primitives[0].attributes.TEXCOORD_0).toEqual(
      expect.any(Number),
    );
  });
  it("preserves literal React keys and rejects dangling object/material references", () => {
    const keyed = compileWorld(
      <World key="w" name="Keys">
        <Space key="s" name="S">
          <Group key="price$usd" />
          <Group key="usd" />
        </Space>
      </World>,
    );
    expect(keyed.objects.map((object) => object.id)).toEqual([
      "s/price$usd",
      "s/usd",
    ]);
    expect(() =>
      compileWorld(
        <World key="w" name="Refs">
          <Space key="s" name="S">
            <Connection
              key="link"
              to="s"
              arrival={[0, 2, 0]}
              fromObject="missing"
            />
          </Space>
        </World>,
      ),
    ).toThrow(/missing/i);
    expect(() =>
      compileWorld(
        <World key="w" name="Refs">
          <Space key="s" name="S">
            <Mesh
              key="mesh"
              material="missing"
              geometry={{ shape: "box", size: [1, 1, 1] }}
            />
          </Space>
        </World>,
      ),
    ).toThrow(/missing/i);
  });

  it("applies vocabulary schemas to groups and generated instances", () => {
    const registry = {
      types: { building: z.object({ floors: z.number().positive() }) },
    };
    expect(() =>
      compileWorld(
        <World key="w" name="Types">
          <Space key="s" name="S">
            <Group key="building" type="building" properties={{ floors: -1 }} />
          </Space>
        </World>,
        registry,
      ),
    ).toThrow(/properties/i);
    expect(() =>
      compileWorld(
        <World key="w" name="Types">
          <Space key="s" name="S">
            <Surface key="ground" />
            <Scatter
              key="items"
              surface="ground"
              seed="x"
              count={1}
              type="unknown"
              geometry={{ shape: "box", size: [1, 1, 1] }}
            />
          </Space>
        </World>,
        registry,
      ),
    ).toThrow(/unknown/i);
  });

  it("places centered props on the surface and respects rotated exclusions", () => {
    const manifest = compileWorld(
      <World key="w" name="Rotation">
        <Space key="s" name="S">
          <Surface key="ground" position={[0, 3, 0]} />
          <Exclusion
            key="road"
            rotation={[0, Math.PI / 2, 0]}
            size={[20, 1, 2]}
          />
          <Scatter
            key="items"
            surface="ground"
            exclusions={["road"]}
            seed="rotation"
            count={20}
            area={{ min: [-5, 0, -5], max: [5, 0, 5] }}
            geometry={{ shape: "box", size: [1, 2, 1] }}
          />
        </Space>
      </World>,
    );
    expect(
      manifest.objects.every((object) => Math.abs(object.position[0]) > 1),
    ).toBe(true);
    expect(manifest.objects.every((object) => object.position[1] === 4)).toBe(
      true,
    );
  });

  it("keeps surviving generated identities attached to the same samples when exclusions change", () => {
    const fixture = (blocked?: readonly [number, number, number]) => (
      <World key="w" name="Samples">
        <Space key="s" name="S">
          <Surface key="ground" />
          {blocked && (
            <Exclusion key="blocked" position={blocked} size={[0.1, 1, 0.1]} />
          )}
          <Scatter
            key="props"
            surface="ground"
            exclusions={blocked ? ["blocked"] : []}
            seed="fixed"
            count={8}
            geometry={{ shape: "box", size: [1, 1, 1] }}
          />
        </Space>
      </World>
    );
    const before = compileWorld(fixture()).objects;
    const after = compileWorld(fixture(before[0]!.position)).objects;
    for (const object of before.slice(1))
      expect(after.find((item) => item.id === object.id)?.position).toEqual(
        object.position,
      );
  });
  it("compiles JSX with source provenance under the production React runtime", () => {
    const result = execFileSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "--input-type=module",
        "-e",
        "import {compileProject} from './src/wdl/project.ts'; const world=await compileProject('worlds/valenreach.tsx'); console.log(JSON.stringify({spaces:world.spaces.length,source:world.objects.find(o=>o.type==='building').source.file}));",
      ],
      { env: { ...process.env, NODE_ENV: "production" }, encoding: "utf8" },
    );
    expect(JSON.parse(result)).toEqual({
      spaces: 15,
      source: "worlds/valenreach.tsx",
    });
  });
});
