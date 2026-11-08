import { Group, Mesh, type Vec3 } from "../src/wdl/index.js";
import { action, defineStore, local, not, read, type ActionRef, type Expr } from "../src/runtime/contract.js";

export const materials = [
  { id: "grass", color: "#598452", texture: { kind: "noise" as const, colors: ["#4d7448", "#749653"] as [string, string], seed: "grass", scale: 3 } },
  { id: "stone", color: "#8d969f", texture: { kind: "checker" as const, colors: ["#7e8791", "#929ca2"] as [string, string], scale: 2 } },
  { id: "plaster", color: "#e4cd9b" }, { id: "roof", color: "#a54e42" },
  { id: "wood", color: "#775035" }, { id: "gold", color: "#e9b94e", metallic: 0.6 },
  { id: "water", color: "#4c9fa8" }, { id: "leaf", color: "#3d6654" },
];
export function Block({ size, position, material = "stone", solid = true }: { size: Vec3; position?: Vec3; material?: string; solid?: boolean }) {
  return <Mesh key="mesh" geometry={{ shape: "box", size }} position={position} material={material} properties={{ wdl: { solid } }} />;
}
export function Tree({ position }: { position: Vec3 }) {
  return <Group key="root" position={position}>
    <Block key="trunk" size={[0.65, 3, 0.65]} position={[0, 1.5, 0]} material="wood" />
    <Mesh key="canopy" position={[0, 3.6, 0]} material="leaf" geometry={{ shape: "cone", radius: 2, height: 4, segments: 8 }} />
  </Group>;
}
export function Portal({ position, to, arrival, label }: { position: Vec3; to: string; arrival: Vec3; label: string }) {
  const store = defineStore({}, { enter: { steps: [
    { op: "effect", capability: "world.travel", args: { space: to, x: arrival[0], y: arrival[1], z: arrival[2] } },
  ] } });
  return <Group key="root" position={position} properties={{ wdl: { scope: local(store) } }}>
    <Block key="left" size={[0.4, 3, 0.6]} position={[-1.3, 1.5, 0]} />
    <Block key="right" size={[0.4, 3, 0.6]} position={[1.3, 1.5, 0]} />
    <Block key="lintel" size={[3, 0.4, 0.6]} position={[0, 3, 0]} />
    <Mesh key="door" geometry={{ shape: "box", size: [2.2, 2.8, 0.2] }} position={[0, 1.4, 0]} material="water"
      properties={{ wdl: { solid: true, interact: action("enter"), label } }} />
  </Group>;
}
export function House({ position, to, label }: { position: Vec3; to: string; label: string }) {
  return <Group key="root" position={position}>
    <Block key="body" size={[7, 4, 5]} position={[0, 2, 0]} material="plaster" />
    <Mesh key="roof" position={[0, 4.8, 0]} rotation={[0, Math.PI / 4, 0]} scale={[1, 0.55, 0.85]} material="roof"
      geometry={{ shape: "cone", radius: 5.8, height: 4, segments: 4 }} />
    <Portal key="entrance" position={[0, 0, 2.7]} to={to} arrival={[0, 1, 4]} label={label} />
    <Block key="window-a" size={[1.2, 1.2, 0.15]} position={[-2.2, 2.5, 2.55]} material="water" solid={false} />
    <Block key="window-b" size={[1.2, 1.2, 0.15]} position={[2.2, 2.5, 2.55]} material="water" solid={false} />
  </Group>;
}
export function Lever({ position, onInteract }: { position: Vec3; onInteract: ActionRef }) {
  return <Group key="root" position={position}>
    <Block key="base" size={[1.2, 0.5, 1.2]} position={[0, 0.25, 0]} />
    <Mesh key="handle" position={[0, 1.1, 0]} material="gold" geometry={{ shape: "box", size: [0.3, 1.3, 0.3] }}
      properties={{ wdl: { interact: onInteract, label: "Toggle dungeon gate" } }} />
  </Group>;
}
export function Gate({ position, open }: { position: Vec3; open: Expr }) {
  return <Mesh key="mesh" position={position} geometry={{ shape: "box", size: [3.8, 3, 0.35] }} material="wood"
    properties={{ wdl: { bindings: { visible: not(open), solid: not(open) } } }} />;
}
export function Chest({ position, persistenceKey }: { position: Vec3; persistenceKey: string }) {
  const store = defineStore({ collected: false }, {
    interact: { when: not(read("collected")), steps: [
      { op: "effect", capability: "inventory.grant", args: { item: "ancient coin" }, success: "collected", failure: "failed" },
    ] },
    collected: { steps: [{ op: "set", field: "collected", value: true }] },
    failed: { steps: [] },
  });
  return <Group key="root" position={position} properties={{ wdl: { scope: local(store, persistenceKey) } }}>
    <Block key="base" size={[1.5, 0.7, 0.9]} position={[0, 0.35, 0]} material="wood" />
    <Group key="reward" position={[0, 0.85, 0]}
      properties={{ wdl: { interact: action("interact"), label: "Collect ancient coin", bindings: { visible: not(read("collected")) } } }}>
      <Mesh key="treasure" material="gold" geometry={{ shape: "box", size: [1.5, 0.3, 0.9] }} />
    </Group>
  </Group>;
}
export function Room({ width = 16, depth = 16, floor = "stone" }: { width?: number; depth?: number; floor?: string }) {
  return <Group key="root">
    <Block key="floor" size={[width, 0.5, depth]} position={[0, -0.25, 0]} material={floor} />
    <Block key="back" size={[width, 4, 0.5]} position={[0, 2, -depth / 2]} />
    <Block key="left" size={[0.5, 4, depth]} position={[-width / 2, 2, 0]} />
    <Block key="right" size={[0.5, 4, depth]} position={[width / 2, 2, 0]} />
    <Block key="front" size={[width, 4, 0.5]} position={[0, 2, depth / 2]} />
  </Group>;
}

