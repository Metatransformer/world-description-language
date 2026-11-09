// mine kit · Timbering
import { h, Fragment } from "../../lib/react.mjs";

// Timbering({ rooms: { id: every } }): the timber sets, laid last so no stull stands in a doorway any way opened
export const Timbering = ({ rooms }) => h(Fragment, null, Object.entries(rooms).filter(([, every]) => every > 0).map(([id, every]) => h("timbers", { key: `timbers-${id}`, in: id, every })));

// meta card (lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "the mine's timber sets: oak stulls and caps standing every few metres down each working, laid last so none blocks a doorway",
  tags: ["mine", "timber", "stulls", "props", "supports", "sets", "beams"],
  props: { rooms: "{ roomId: every }: set spacing in m per room; 0 skips that room" },
  footprint: { kind: "none" },
  topology: { under: ["Mine", "Dig"], takes: [], joins: [], emits: ["timbers"] },
  twins: [],
  pitfalls: ["must come after every link (last in the tree) or sets can stand in doorways laid later", "a room left out gets no timbers: Working's timbered prop is ignored", "every under ~2 m crowds the walking line"],
};

Timbering.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
