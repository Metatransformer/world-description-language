import {
  Exclusion,
  Group,
  Mesh,
  Scatter,
  Surface,
  type Material,
  type Vec3,
} from "../src/wdl/index.js";

export const materialKit: Material[] = [
  {
    id: "ochre-plaster",
    color: "#b98555",
    roughness: 0.92,
    texture: {
      kind: "noise",
      colors: ["#c8925f", "#805537"],
      scale: 5,
      seed: "plaster",
    },
  },
  {
    id: "river-stone",
    color: "#5f625d",
    roughness: 0.98,
    texture: { kind: "checker", colors: ["#6f7168", "#4e514c"], scale: 2 },
  },
  { id: "dark-timber", color: "#4a3023", roughness: 0.85 },
  { id: "copper-roof", color: "#376c65", roughness: 0.72, metallic: 0.35 },
  { id: "red-tile", color: "#733d32", roughness: 0.9 },
  {
    id: "earth",
    color: "#64704c",
    roughness: 1,
    texture: {
      kind: "noise",
      colors: ["#6f7854", "#4d5b3d"],
      scale: 12,
      seed: "earth",
    },
  },
  {
    id: "water",
    color: "#356f85",
    roughness: 0.25,
    opacity: 0.72,
    doubleSided: true,
  },
  { id: "foliage", color: "#315f39", roughness: 1 },
  { id: "canvas", color: "#c5ad7b", roughness: 0.95 },
  { id: "dungeon", color: "#464c50", roughness: 1 },
];

export function terrainHeight(x: number, z: number): number {
  const hills = Math.max(0, -z - 22) * 0.14 + Math.max(0, -x - 70) * 0.16;
  const river = Math.max(0, 1 - Math.abs(x - 2) / 9) * 1.6;
  return hills + Math.sin(x * 0.045) * Math.max(0, -z - 25) * 0.03 - river;
}
export function terrainGeometry(
  centerX: number,
  width: number,
  columns: number,
) {
  return {
    shape: "heightfield" as const,
    width,
    depth: 180,
    columns,
    rows: 25,
    heights: Array.from({ length: columns * 25 }, (_, i) =>
      terrainHeight(
        centerX + ((i % columns) / (columns - 1) - 0.5) * width,
        (Math.floor(i / columns) / 24 - 0.5) * 180,
      ),
    ),
  };
}

export type ArchitectureOptions = {
  wallMaterial: string;
  roofMaterial: string;
  clutterDensity: number;
  extraVariant?: "tower" | "courtyard";
};
export const defaultArchitecture: ArchitectureOptions = {
  wallMaterial: "ochre-plaster",
  roofMaterial: "red-tile",
  clutterDensity: 2,
};

export function HouseShell({
  size = [9, 5, 7],
  options,
  scopeId,
}: {
  size?: Vec3;
  options: ArchitectureOptions;
  scopeId: string;
}) {
  const [w, h, d] = size,
    door = 1.8;
  return (
    <Group key="shell" name="House shell">
      <Mesh
        key="floor"
        type="floor"
        position={[0, 0.15, 0]}
        geometry={{ shape: "box", size: [w, 0.3, d] }}
        material="river-stone"
      />
      <Mesh
        key="back-wall"
        type="wall"
        position={[0, h / 2, -d / 2]}
        geometry={{ shape: "box", size: [w, h, 0.35] }}
        material={options.wallMaterial}
      />
      <Mesh
        key="left-wall"
        type="wall"
        position={[-w / 2, h / 2, 0]}
        geometry={{ shape: "box", size: [0.35, h, d] }}
        material={options.wallMaterial}
      />
      <Mesh
        key="right-wall"
        type="wall"
        position={[w / 2, h / 2, 0]}
        geometry={{ shape: "box", size: [0.35, h, d] }}
        material={options.wallMaterial}
      />
      <Mesh
        key="front-left"
        type="wall"
        position={[-(w + door) / 4, h / 2, d / 2]}
        geometry={{ shape: "box", size: [(w - door) / 2, h, 0.35] }}
        material={options.wallMaterial}
      />
      <Mesh
        key="front-right"
        type="wall"
        position={[(w + door) / 4, h / 2, d / 2]}
        geometry={{ shape: "box", size: [(w - door) / 2, h, 0.35] }}
        material={options.wallMaterial}
      />
      <Mesh
        key="door-header"
        type="lintel"
        position={[0, h - 0.55, d / 2]}
        geometry={{ shape: "box", size: [door, 1.1, 0.45] }}
        material="dark-timber"
      />
      <Mesh
        key="roof-left"
        type="roof"
        position={[-w / 4, h + 1.05, 0]}
        rotation={[0, 0, -0.38]}
        geometry={{ shape: "box", size: [w / 1.75, 0.3, d + 1] }}
        material={options.roofMaterial}
      />
      <Mesh
        key="roof-right"
        type="roof"
        position={[w / 4, h + 1.05, 0]}
        rotation={[0, 0, 0.38]}
        geometry={{ shape: "box", size: [w / 1.75, 0.3, d + 1] }}
        material={options.roofMaterial}
      />
      {options.extraVariant === "tower" && (
        <Group
          key="tower-variant"
          position={[w / 2 - 1.4, h + 1.6, -d / 2 + 1.4]}
        >
          <Mesh
            key="tower"
            type="tower"
            geometry={{
              shape: "cylinder",
              radius: 1.5,
              height: 5.5,
              segments: 10,
            }}
            material={options.wallMaterial}
          />
          <Mesh
            key="cap"
            type="roof"
            position={[0, 3.3, 0]}
            geometry={{ shape: "cone", radius: 2, height: 2.2, segments: 10 }}
            material={options.roofMaterial}
          />
        </Group>
      )}
      {options.extraVariant === "courtyard" && (
        <Group key="courtyard-variant" position={[0, 0, -d / 2 - 3]}>
          <Mesh
            key="yard"
            type="courtyard"
            geometry={{ shape: "box", size: [w, 0.2, 5] }}
            material="river-stone"
          />
          <Mesh
            key="wall"
            type="courtyard-wall"
            position={[0, 1, -2.4]}
            geometry={{ shape: "box", size: [w, 2, 0.3] }}
            material={options.wallMaterial}
          />
        </Group>
      )}
      <Surface
        key="wall-side"
        kind="surface"
        position={[0, 0, d / 2 + 0.8]}
        size={[w, 1, 1.2]}
      />
      <Exclusion
        key="entrance"
        position={[0, 0, d / 2 + 0.8]}
        size={[3.2, 3, 2.2]}
      />
      <Scatter
        key="barrels"
        type="barrel"
        surface={`${scopeId}/shell/wall-side`}
        exclusions={[`${scopeId}/shell/entrance`]}
        seed={`${scopeId}-barrels`}
        count={1}
        clearance={0.5}
        area={{
          min: [-w / 2 + 0.7, 0, d / 2 + 0.45],
          max: [w / 2 - 0.7, 0, d / 2 + 1],
        }}
        geometry={{
          shape: "cylinder",
          radius: 0.45,
          height: 1.1,
          segments: 12,
        }}
        material="dark-timber"
      />
      <Scatter
        key="clutter"
        type="trade-clutter"
        surface={`${scopeId}/shell/wall-side`}
        exclusions={[`${scopeId}/shell/entrance`]}
        seed={scopeId}
        count={options.clutterDensity}
        clearance={0.35}
        area={{
          min: [-w / 2 + 0.7, 0, d / 2 + 0.45],
          max: [w / 2 - 0.7, 0, d / 2 + 1],
        }}
        geometry={{ shape: "box", size: [0.75, 0.75, 0.75] }}
        material="dark-timber"
      />
    </Group>
  );
}

export function Landscape({
  name,
  centerX,
}: {
  name: string;
  centerX: number;
}) {
  return (
    <Group key="landscape" name={name} position={[centerX, 0, 0]}>
      <Mesh
        key="terrain"
        type="terrain"
        geometry={terrainGeometry(centerX, 80, 11)}
        material="earth"
      />
    </Group>
  );
}

export function InteriorRoom({
  width = 8,
  depth = 6,
  material = "ochre-plaster",
}: {
  width?: number;
  depth?: number;
  material?: string;
}) {
  return (
    <Group key="room" name="Furnished room">
      <Mesh
        key="floor"
        type="floor"
        geometry={{ shape: "box", size: [width, 0.25, depth] }}
        material="dark-timber"
      />
      <Mesh
        key="back"
        type="interior-wall"
        position={[0, 2.5, -depth / 2]}
        geometry={{ shape: "box", size: [width, 5, 0.25] }}
        material={material}
      />
      <Mesh
        key="left"
        type="interior-wall"
        position={[-width / 2, 2.5, 0]}
        geometry={{ shape: "box", size: [0.25, 5, depth] }}
        material={material}
      />
      <Mesh
        key="right"
        type="interior-wall"
        position={[width / 2, 2.5, 0]}
        geometry={{ shape: "box", size: [0.25, 5, depth] }}
        material={material}
      />
      <Mesh
        key="partition-left"
        type="interior-wall"
        position={[-2.6, 2.5, 0]}
        geometry={{ shape: "box", size: [2.2, 5, 0.2] }}
        material={material}
      />
      <Mesh
        key="partition-right"
        type="interior-wall"
        position={[2.6, 2.5, 0]}
        geometry={{ shape: "box", size: [2.2, 5, 0.2] }}
        material={material}
      />
      <Mesh
        key="table"
        type="furniture"
        position={[1.8, 0.8, -1.2]}
        geometry={{ shape: "cylinder", radius: 1, height: 1.5, segments: 12 }}
        material="dark-timber"
      />
    </Group>
  );
}

export function DungeonRoom({
  position,
  size,
  name,
}: {
  position: Vec3;
  size: Vec3;
  name: string;
}) {
  return (
    <Group key="chamber" position={position} name={name}>
      <Mesh
        key="floor"
        type="dungeon-floor"
        geometry={{ shape: "box", size: [size[0], 0.3, size[2]] }}
        material="dungeon"
      />
      <Mesh
        key="north-left"
        type="dungeon-wall"
        position={[-size[0] * 0.35, 2, -size[2] / 2]}
        geometry={{ shape: "box", size: [size[0] * 0.3, 4, 0.4] }}
        material="dungeon"
      />
      <Mesh
        key="north-right"
        type="dungeon-wall"
        position={[size[0] * 0.35, 2, -size[2] / 2]}
        geometry={{ shape: "box", size: [size[0] * 0.3, 4, 0.4] }}
        material="dungeon"
      />
      <Mesh
        key="south-left"
        type="dungeon-wall"
        position={[-size[0] * 0.35, 2, size[2] / 2]}
        geometry={{ shape: "box", size: [size[0] * 0.3, 4, 0.4] }}
        material="dungeon"
      />
      <Mesh
        key="south-right"
        type="dungeon-wall"
        position={[size[0] * 0.35, 2, size[2] / 2]}
        geometry={{ shape: "box", size: [size[0] * 0.3, 4, 0.4] }}
        material="dungeon"
      />
    </Group>
  );
}
