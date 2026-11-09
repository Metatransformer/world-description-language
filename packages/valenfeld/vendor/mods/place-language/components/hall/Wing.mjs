// hall kit · Wing
import { h } from "../../lib/react.mjs";
import { useHall } from "./_shared.mjs";
import { HallContext } from "./HallContext.mjs";

// Wing({ name, at: [x, z] }): a part of the hall (the dormitory, the yard); spots inside it are relative to its at
export function Wing({ name, at = [0, 0], children }) {
  const up = useHall();
  return h(HallContext.Provider, { value: { ...up, wing: name, at: [up.at[0] + at[0], up.at[1] + at[1]] } }, children);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "context",
  is: "one named part of a building (the dormitory, the high table, the yard) whose pieces are placed from its own corner",
  tags: ["wing", "area", "part", "room", "zone", "group", "interior"],
  props: { name: "what the part is called (the dormitory, the yard)", at: "[x, z] m: its origin inside the hall (or the wing around it); children's spots add to it", children: "what stands in this part" },
  footprint: { kind: "area" },
  topology: { under: ["Interior", "Wing"], takes: ["Resident", "Bed", "BunkRow", "Coffer", "Container", "Dummy", "Lamp", "GuildChest", "Keep"], joins: [], emits: [] },
  twins: ["wilds/Site", "plan/In"],
  pitfalls: ["it shifts only the hall pieces' at; a Keep's spec is carried whole and does NOT move with the wing", "wings nest and their ats add: a spot written in hall metres inside a wing lands doubled-offset", "it draws no walls: it is a name and an origin, not a room"],
};

Wing.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
