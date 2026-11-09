import { Group } from "../../src/wdl/index.js";
import { action, defineStore, local, read } from "../../src/runtime/contract.js";
import { Block, Gate, Lever, Portal, Room } from "../rpg-kit.js";
import { TreasureChest } from "./components.js";
import type { SpawnPalette } from "./capture.js";

/** WDL-authored demo interiors complementing the imported Spawn architecture. */
export function CottageInterior({ palette }: { palette: SpawnPalette }) {
  return <Group key="cottage">
    <Room key="shell" width={12} depth={12} floor="wood" />
    <Portal key="exit" position={[0, 0, 5]} to="town" arrival={[-32, 1, 3]} label="Return to the west lane" />
    <Block key="bed-frame" size={[2.4, 0.5, 3.4]} position={[-3.5, 0.25, -3]} material="wood" />
    <Block key="bed-cover" size={[2.2, 0.2, 2.8]} position={[-3.5, 0.6, -2.8]} material="water" />
    <Block key="table" size={[2.4, 1, 1.4]} position={[3, 0.5, 0]} material="wood" />
    <Block key="hearth" size={[2.5, 1.8, 1]} position={[0, 0.9, -5]} />
    <TreasureChest key="keepsake" palette={palette} at={[3, 0, -3]} persistenceKey="valenfeld-cottage-chest" />
  </Group>;
}

export function WorkshopInterior({ palette }: { palette: SpawnPalette }) {
  const latch = defineStore({ open: false }, { toggle: { steps: [{ op: "toggle", field: "open" }] } });
  return <Group key="workshop" properties={{ wdl: { scope: local(latch, "valenfeld-workshop-latch") } }}>
    <Room key="shell" width={14} depth={14} />
    <Portal key="exit" position={[0, 0, 6]} to="town" arrival={[30, 1, 3]} label="Return to the east lane" />
    <Block key="bench" size={[3, 1, 1.4]} position={[4.5, 0.5, 2]} material="wood" />
    <Block key="partition-left" size={[5.1, 3, 0.35]} position={[-4.45, 1.5, -1]} />
    <Block key="partition-right" size={[5.1, 3, 0.35]} position={[4.45, 1.5, -1]} />
    <Gate key="storeroom-gate" position={[0, 1.5, -1]} open={read("open")} />
    <Lever key="latch" position={[-3, 0, 1]} onInteract={action("toggle")} label="Toggle workshop storeroom" />
    <TreasureChest key="tools" palette={palette} at={[0, 0, -4]} persistenceKey="valenfeld-workshop-chest" />
  </Group>;
}
