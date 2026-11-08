import { World, Space } from "../src/wdl/index.js";
import { action, defineStore, read, type BehaviorDefinition } from "../src/runtime/contract.js";
import { Block, Chest, Gate, House, Lever, Portal, Room, Tree, materials } from "./rpg-kit.js";

const behavior: BehaviorDefinition = {
  version: 1,
  stores: { quest: { ...defineStore({ gateOpen: false }, {
    toggleGate: { steps: [{ op: "toggle", field: "gateOpen" }] },
  }), persistenceKey: "quest" } },
  capabilities: {
    "world.travel": { space: "string", x: "number", y: "number", z: "number" },
    "inventory.grant": { item: "string" },
  },
};
export default function RpgWorld() {
  return <World key="rpg" name="Alder Vale" materials={materials} metadata={{ behavior, start: { space: "town", position: [0, 1, 10] } }}>
    <Space key="town" name="Alder Vale · Town">
      <Room key="grounds" width={40} depth={36} floor="grass" />
      <Block key="road" size={[5, 0.04, 32]} position={[0, 0.02, 0]} />
      <House key="inn" position={[-7, 0, -5]} to="inn" label="Enter the Lantern Inn" />
      <House key="cottage" position={[7, 0, -5]} to="cottage" label="Enter the Keeper's Cottage" />
      <Portal key="outskirts" position={[0, 0, -15]} to="exterior" arrival={[0, 1, 10]} label="Follow the woodland path" />
      {[-15, 15].flatMap(x => [-10, 0, 10].map(z => <Tree key={x + ":" + z} position={[x, 0, z]} />))}
    </Space>
    <Space key="exterior" name="Whispering Wood">
      <Room key="grounds" width={28} depth={36} floor="grass" />
      <Block key="path" size={[4, 0.04, 32]} position={[0, 0.02, 0]} material="wood" />
      <Portal key="town" position={[0, 0, 15]} to="town" arrival={[0, 1, -11]} label="Return to Alder Vale" />
      <Portal key="ruins" position={[0, 0, -15]} to="dungeon" arrival={[0, 1, 9]} label="Descend into the old vault" />
      {[-9, 9].flatMap(x => [-10, -3, 5, 11].map(z => <Tree key={x + ":" + z} position={[x, 0, z]} />))}
    </Space>
    {["inn", "cottage"].map((name, index) => <Space key={name} name={name === "inn" ? "The Lantern Inn" : "Keeper's Cottage"}>
      <Room key="shell" />
      <Portal key="exit" position={[0, 0, 6.5]} to="town" arrival={[index ? 7 : -7, 1, 0]} label="Return to town" />
      <Block key="table" size={[4, 1.2, 2]} position={[-3, 0.6, -2]} material="wood" />
      <Chest key="chest" position={[4, 0, -4]} persistenceKey={name + "-chest"} />
    </Space>)}
    <Space key="dungeon" name="The Old Vault">
      <Room key="shell" width={16} depth={28} />
      <Portal key="exit" position={[0, 0, 12]} to="exterior" arrival={[0, 1, -11]} label="Return to the wood" />
      <Block key="partition-left" size={[6, 4, 0.5]} position={[-5, 2, -2]} />
      <Block key="partition-right" size={[6, 4, 0.5]} position={[5, 2, -2]} />
      <Lever key="lever" position={[-4, 0, 3]} onInteract={action("toggleGate", "quest")} />
      <Gate key="gate" position={[0, 1.5, -2]} open={read("gateOpen", "quest")} />
      <Chest key="relic" position={[0, 0, -9]} persistenceKey="vault-relic" />
    </Space>
  </World>;
}
