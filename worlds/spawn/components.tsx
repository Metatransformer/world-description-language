import { Children, isValidElement, type ReactNode } from "react";
import { Group, Mesh, type Vec3 } from "../../src/wdl/index.js";
import { action, defineStore, local, not, read } from "../../src/runtime/contract.js";
import { capture, type Generator, SpawnPalette } from "./capture.js";
import * as house from "./vendor/scripts/gen/house.js";
import * as well from "./vendor/scripts/gen/well.js";
import * as market from "./vendor/scripts/gen/market-stall.js";
import * as tavern from "./vendor/scripts/gen/tavern.js";
import * as inn from "./vendor/scripts/gen/inn-hall.js";
import * as chest from "./vendor/scripts/gen/chest.js";

type PartProps = { two?: boolean; shape?: "gable" | "hip" | "steep" | "saltbox"; color?: string; texture?: string; shutters?: string; side?: number; enabled?: boolean };
export const Storey = (_props: PartProps) => null;
export const Roof = (_props: PartProps) => null;
export const Windows = (_props: PartProps) => null;
export const Chimney = (_props: PartProps) => null;
type Placement = { palette: SpawnPalette; at?: Vec3; yaw?: number; seed?: number; children?: ReactNode };
function Geometry({ generator, palette, params = {}, seed = 1 }: { generator: Generator; palette: SpawnPalette; params?: Record<string, unknown>; seed?: number }) {
  const result = capture(generator, palette, params, seed);
  return <Group key="geometry">
    {result.batches.map(batch => <Mesh key={batch.material} geometry={batch.geometry} material={batch.material}
      properties={{ spawn: { source: "procedural-geometry", material: batch.material } }} />)}
    {result.colliders.map((shape, index) => <Mesh key={"collider-" + index}
      position={shape.center ?? [0, shape.height / 2, 0]}
      geometry={shape.kind === "box" ? { shape: "box", size: [shape.width!, shape.height, shape.depth!] }
        : { shape: "cylinder", radius: Math.max(shape.radiusTop!, shape.radiusBottom!), height: shape.height }}
      properties={{ wdl: { solid: true, bindings: { visible: false } }, spawn: { role: "collision-proxy" } }} />)}
  </Group>;
}
export function House({ palette, at = [0, 0, 0], yaw = 0, seed = 1, w = 7, d = 6, children }: Placement & { w?: number; d?: number }) {
  const params: Record<string, unknown> = { w, d, shut: "#2f3d52" };
  Children.forEach(children, child => {
    if (!isValidElement<PartProps>(child)) return;
    const p = child.props;
    if (child.type === Storey) params.two = p.two;
    else if (child.type === Roof) Object.assign(params, { roof: p.shape, roofCol: p.color, roofTex: p.texture });
    else if (child.type === Windows) params.shut = p.shutters;
    else if (child.type === Chimney) Object.assign(params, { chim: p.side, chimney: p.enabled });
    else throw new Error("Unsupported House part");
  });
  return <Group key="house" position={at} rotation={[0, yaw * Math.PI / 180, 0]} properties={{ spawn: { source: "scripts/gen/house.js", params } }}>
    <Geometry key="parts" generator={house} palette={palette} params={params} seed={seed} />
  </Group>;
}
export function Well({ palette, at = [0, 0, 0] }: Placement) {
  return <Group key="well" position={at}><Geometry key="parts" generator={well} palette={palette} /></Group>;
}
export function MarketStall({ palette, at = [0, 0, 0], yaw = 0, goods = "produce" }: Placement & { goods?: string }) {
  return <Group key="market" position={at} rotation={[0, yaw * Math.PI / 180, 0]}>
    <Geometry key="parts" generator={market} palette={palette} params={{ goods }} />
  </Group>;
}
export function Tavern({ palette, at = [0, 0, 0] }: Placement) {
  return <Group key="tavern" position={at}><Geometry key="parts" generator={tavern} palette={palette} params={{ closed: true }} /></Group>;
}
export function DrownedLantern({ palette }: Placement) {
  return <Group key="inn" position={[0, -0.12, 0]}><Geometry key="parts" generator={inn} palette={palette} seed={17} /></Group>;
}
export function TreasureChest({ palette, at = [0, 0, 0], persistenceKey }: Placement & { persistenceKey: string }) {
  const state = defineStore({ collected: false }, {
    take: { when: not(read("collected")), steps: [
      { op: "effect", capability: "inventory.grant", args: { item: "Valenfeld keepsake" }, success: "collected", failure: "failed" },
    ] },
    collected: { steps: [{ op: "set", field: "collected", value: true }] }, failed: { steps: [] },
  });
  return <Group key="chest" position={at} properties={{ wdl: { scope: local(state, persistenceKey) } }}>
    <Group key="reward" properties={{ wdl: { interact: action("take"), label: "Open Valenfeld chest", bindings: { visible: not(read("collected")) } } }}>
      <Geometry key="parts" generator={chest} palette={palette} />
    </Group>
  </Group>;
}
