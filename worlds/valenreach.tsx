import {
  Connection,
  Exclusion,
  Group,
  Mesh,
  Scatter,
  Space,
  Surface,
  World,
  type Vec3,
} from "../src/wdl/index.js";
import {
  HouseShell,
  InteriorRoom,
  Landscape,
  defaultArchitecture,
  materialKit,
  terrainGeometry,
  terrainHeight,
  type ArchitectureOptions,
} from "./kits.js";

import { DungeonSpace } from "../src/dungeon/components.js";
import { dungeonMaterials } from "../src/dungeon/kits.js";
import { ashBarrowPlan, sunkenCisternPlan } from "./dungeons.js";

export type ValenreachOptions = Partial<ArchitectureOptions> & {
  extraBuildingVariant?: "tower" | "courtyard";
  extraInterior?: boolean;
};
type BuildingSpec = {
  id: string;
  name: string;
  position: Vec3;
  rotation?: Vec3;
  size?: Vec3;
  enterable?: boolean;
  roof?: string;
};
const districts: Array<{
  id: string;
  name: string;
  position: Vec3;
  buildings: BuildingSpec[];
}> = [
  {
    id: "riverward",
    name: "Riverward",
    position: [-70, 0.3, 8],
    buildings: Array.from({ length: 10 }, (_, i) => ({
      id: `river-${i + 1}`,
      name: [
        "Netmaker's Hall",
        "Lume Inn",
        "Copper Customs",
        "Boathouse",
        "Salt Store",
        "Fisher House",
        "Dyer's Loft",
        "Tally House",
        "Reed Bakery",
        "Lantern House",
      ][i]!,
      position: [(i % 5) * 12, 0, Math.floor(i / 5) * 17] as Vec3,
      rotation: [0, i % 2 ? 0.08 : -0.05, 0] as Vec3,
      enterable: i < 4,
      roof: i === 2 ? "copper-roof" : "red-tile",
    })),
  },
  {
    id: "highmarket",
    name: "Highmarket",
    position: [20, 0.3, -10],
    buildings: Array.from({ length: 10 }, (_, i) => ({
      id: `market-${i + 1}`,
      name: [
        "Guild Weighhouse",
        "Moth & Mortar",
        "Gold Finch",
        "Potter Arcade",
        "Civic Archive",
        "Spice Court",
        "Clockwright",
        "Carver's Steps",
        "Wool Exchange",
        "North Gatehouse",
      ][i]!,
      position: [(i % 5) * 13, 0, Math.floor(i / 5) * 18] as Vec3,
      rotation: [0, (i % 3) * 0.06, 0] as Vec3,
      enterable: i < 4,
      roof: i === 0 || i === 4 ? "copper-roof" : "red-tile",
    })),
  },
  {
    id: "pilgrim-field",
    name: "Pilgrim Field",
    position: [20, 0.3, 48],
    buildings: Array.from({ length: 10 }, (_, i) => ({
      id: `field-${i + 1}`,
      name: [
        "Wayfarer Chapel",
        "Three Kettles",
        "Herbalist Tent",
        "Drover Lodge",
        "Saddler",
        "Pilgrim Rest",
        "Apiary House",
        "Stonecutter",
        "Old Well House",
        "South Watch",
      ][i]!,
      position: [(i % 5) * 14, 0, Math.floor(i / 5) * 19] as Vec3,
      rotation: [0, i % 2 ? -0.12 : 0.1, 0] as Vec3,
      enterable: i < 4,
      roof: i === 2 ? "canvas" : "red-tile",
    })),
  },
];

function Building({
  spec,
  districtId,
  options,
}: {
  spec: BuildingSpec;
  districtId: string;
  options: ArchitectureOptions;
}) {
  const interiorId = `interior-${spec.id}`;
  const scope = `outside/region/valenreach/${districtId}/district/${spec.id}/building/shell-kit`;
  return (
    <Group
      key="building"
      name={spec.name}
      type="building"
      position={spec.position}
      rotation={spec.rotation}
      properties={{
        district: districtId,
        enterable: Boolean(spec.enterable),
        reference: "architecture-brief",
      }}
    >
      <HouseShell
        key="shell-kit"
        scopeId={scope}
        size={spec.size}
        options={{
          ...options,
          roofMaterial: spec.roof ?? options.roofMaterial,
        }}
      />
      {spec.enterable && (
        <Mesh
          key="door"
          name={`Enter ${spec.name}`}
          type="door"
          position={[0, 1.2, (spec.size?.[2] ?? 7) / 2 + 0.2]}
          geometry={{ shape: "box", size: [1.7, 2.4, 0.2] }}
          material="dark-timber"
        />
      )}
      {spec.enterable && (
        <Connection
          key="enter"
          id={`enter-${spec.id}`}
          to={interiorId}
          arrival={[0, 2, 2]}
          fromObject={`${scope.slice(0, -"/shell-kit".length)}/door`}
        />
      )}
    </Group>
  );
}

function District({
  id,
  name,
  position,
  buildings,
  options,
}: {
  id: string;
  name: string;
  position: Vec3;
  buildings: BuildingSpec[];
  options: ArchitectureOptions;
}) {
  return (
    <Group key="district" name={name} type="district" position={position}>
      <Mesh
        key="plaza"
        type="plaza"
        position={[26, -0.1, 8]}
        geometry={{ shape: "box", size: [65, 0.25, 34] }}
        material="river-stone"
      />
      {buildings.map((spec) => (
        <Building key={spec.id} spec={spec} districtId={id} options={options} />
      ))}
    </Group>
  );
}

function Region({ options }: { options: ArchitectureOptions }) {
  return (
    <Group key="valenreach" name="Valenreach Basin" type="region">
      <Landscape key="western-uplands" name="Western Uplands" centerX={-80} />
      <Landscape key="lume-valley" name="Lume Valley" centerX={0} />
      <Landscape key="eastern-ridge" name="Eastern Ridge" centerX={80} />
      <Surface key="terrain-surface" geometry={terrainGeometry(0, 240, 31)} />
      <Mesh
        key="lume-river"
        name="Lume River"
        type="river"
        position={[2, -0.35, 0]}
        geometry={{ shape: "box", size: [14, 0.3, 180] }}
        material="water"
      />
      <Group key="stone-bridge" name="Six-Arch Bridge" position={[2, 2, 15]}>
        <Mesh
          key="deck"
          type="bridge"
          geometry={{ shape: "box", size: [24, 1.2, 7] }}
          material="river-stone"
        />
        {[-8, 0, 8].map((x, i) => (
          <Mesh
            key={`pier-${i}`}
            type="bridge-pier"
            position={[x, -2, 0]}
            geometry={{ shape: "box", size: [2, 5, 5] }}
            material="river-stone"
          />
        ))}
      </Group>
      <Mesh
        key="king-road"
        type="road"
        position={[5, 0.5, 15]}
        geometry={{ shape: "box", size: [170, 0.18, 6] }}
        material="river-stone"
      />
      <Mesh
        key="ridge-road"
        type="road"
        position={[47, 0.7, 3]}
        rotation={[0, 0.58, 0]}
        geometry={{ shape: "box", size: [115, 0.18, 5] }}
        material="river-stone"
      />
      <Mesh
        key="pilgrim-road"
        type="road"
        position={[-5, 0.65, 48]}
        rotation={[0, 1.5, 0]}
        geometry={{ shape: "box", size: [120, 0.18, 5] }}
        material="river-stone"
      />
      <Exclusion
        key="king-road-clearance"
        position={[5, 0, 15]}
        size={[170, 5, 10]}
      />
      <Exclusion
        key="ridge-road-clearance"
        position={[47, 0, 3]}
        rotation={[0, 0.58, 0]}
        size={[115, 5, 9]}
      />
      <Exclusion
        key="pilgrim-road-clearance"
        position={[-5, 0, 48]}
        rotation={[0, 1.5, 0]}
        size={[120, 5, 9]}
      />
      <Exclusion
        key="river-clearance"
        position={[2, 0, 0]}
        size={[20, 5, 180]}
      />
      {districts.map((d) => (
        <Exclusion
          key={`clear-${d.id}`}
          position={[d.position[0] + 26, 0, d.position[2] + 8]}
          size={[70, 10, 40]}
        />
      ))}
      <Scatter
        key="basin-pines"
        type="pine"
        surface="outside/region/valenreach/terrain-surface"
        exclusions={[
          "outside/region/valenreach/king-road-clearance",
          "outside/region/valenreach/ridge-road-clearance",
          "outside/region/valenreach/pilgrim-road-clearance",
          "outside/region/valenreach/river-clearance",
          ...districts.map((d) => `outside/region/valenreach/clear-${d.id}`),
        ]}
        seed="valenreach-pines-v1"
        count={70}
        clearance={1.5}
        area={{ min: [-110, 0, -82], max: [110, 0, 82] }}
        geometry={{ shape: "cone", radius: 1.8, height: 7, segments: 8 }}
        material="foliage"
      />
      {districts.map((district) => (
        <District key={district.id} {...district} options={options} />
      ))}
      <Connection
        key="barrow-entry"
        id="enter-ash-barrow"
        to="ash-barrow"
        arrival={[0, 2, 4]}
        fromObject="outside/region/valenreach/ash-barrow-marker"
      />
      <Connection
        key="cistern-entry"
        id="enter-sunken-cistern"
        to="sunken-cistern"
        arrival={[0, 2, 5]}
        fromObject="outside/region/valenreach/cistern-marker"
      />
      <Mesh
        key="ash-barrow-marker"
        name="Ash Barrow"
        type="dungeon-entrance"
        position={[-82, terrainHeight(-82, -48) + 2, -48]}
        geometry={{ shape: "box", size: [5, 4, 2] }}
        material="dungeon"
      />
      <Mesh
        key="cistern-marker"
        name="Sunken Cistern"
        type="dungeon-entrance"
        position={[88, 1, 61]}
        geometry={{ shape: "cylinder", radius: 3, height: 2, segments: 12 }}
        material="dungeon"
      />
    </Group>
  );
}

function HouseInterior({
  spec,
  districtPosition,
}: {
  spec: BuildingSpec;
  districtPosition: Vec3;
}) {
  const id = `interior-${spec.id}`;
  return (
    <Space
      key={id}
      name={`${spec.name} interior`}
      properties={{ kind: "interior", exteriorBuilding: spec.id }}
    >
      <InteriorRoom
        key="architecture"
        material={spec.roof === "copper-roof" ? "river-stone" : "ochre-plaster"}
      />
      <Connection
        key="exit"
        id={`exit-${spec.id}`}
        to="outside"
        arrival={[
          districtPosition[0] + spec.position[0],
          districtPosition[1] + spec.position[1] + 2,
          districtPosition[2] + spec.position[2] + 6,
        ]}
      />
    </Space>
  );
}

function Dungeon({ id, name, variant }: { id: string; name: string; variant: number }) {
  return <DungeonSpace key="generated-space" id={id} name={name}
    plan={variant === 1 ? ashBarrowPlan : sunkenCisternPlan}
    returnArrival={variant === 1 ? [-82, terrainHeight(-82, -44) + 2, -44] : [88, 2, 56]} />;
}

export function createValenreach(overrides: ValenreachOptions = {}) {
  const options: ArchitectureOptions = {
    ...defaultArchitecture,
    ...overrides,
    extraVariant: overrides.extraBuildingVariant,
  };
  const interiors = districts.flatMap((district) =>
    district.buildings
      .filter((building) => building.enterable)
      .map((spec) => ({ spec, districtPosition: district.position })),
  );
  return (
    <World
      key="world"
      name="Valenreach"
      materials={[...materialKit, ...dungeonMaterials]}
      references={[
        {
          id: "architecture-brief",
          uri: "worlds/references/architecture.md",
          kind: "markdown",
          title: "Valenreach architecture brief",
        },
        {
          id: "dungeon-plan",
          uri: "worlds/references/dungeon.svg",
          kind: "image/svg+xml",
          title: "Underways plan",
        },
      ]}
      metadata={{
        authoring: "TSX",
        demoOptions: {
          wallMaterial: options.wallMaterial,
          clutterDensity: options.clutterDensity,
          extraBuildingVariant: overrides.extraBuildingVariant ?? null,
          extraInterior: overrides.extraInterior ?? false,
        },
      }}
    >
      <Space key="outside" name="Valenreach Region">
        <Region key="region" options={options} />
        {overrides.extraInterior && (
          <Group
            key="new-variant"
            name="Surveyor Lodge"
            position={[-60, 0.3, 55]}
          >
            <HouseShell
              key="shell-kit"
              scopeId="outside/new-variant/shell-kit"
              options={{ ...options, extraVariant: "tower" }}
            />
            <Mesh
              key="door"
              name="Enter Surveyor Lodge"
              type="door"
              position={[0, 1.2, 3.7]}
              geometry={{ shape: "box", size: [1.7, 2.4, 0.2] }}
              material="dark-timber"
            />
            <Connection
              key="enter"
              id="enter-new-variant"
              to="interior-new-variant"
              arrival={[0, 2, 2]}
              fromObject="outside/new-variant/door"
            />
          </Group>
        )}
      </Space>
      {interiors.map(({ spec, districtPosition }) => (
        <HouseInterior
          key={`space-${spec.id}`}
          spec={spec}
          districtPosition={districtPosition}
        />
      ))}
      {overrides.extraInterior && (
        <Space key="interior-new-variant" name="New variant interior">
          <InteriorRoom key="architecture" width={11} depth={8} />
          <Connection
            key="exit"
            id="exit-new-variant"
            to="outside"
            arrival={[-60, 2.3, 61]}
          />
        </Space>
      )}
      <Dungeon
        key="ash-barrow-space"
        id="ash-barrow"
        name="Ash Barrow Underways"
        variant={1}
      />
      <Dungeon
        key="sunken-cistern-space"
        id="sunken-cistern"
        name="Sunken Cistern"
        variant={2}
      />
    </World>
  );
}

export const world = createValenreach();
export default world;
