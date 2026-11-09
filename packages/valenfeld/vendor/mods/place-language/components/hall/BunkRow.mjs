// hall kit · BunkRow
import { h, Fragment } from "../../lib/react.mjs";
import { useHall, mm, nth } from "./_shared.mjs";
import { Bed } from "./Bed.mjs";

// BunkRow({ prefix, from, at, along, step, beds | names | n+name, as, bed }): a row of beds down a wall: a [lower, upper] pair is a two-high bunk, a name or { … } one bed
export function BunkRow({ prefix = "bed-bunk", from = 1, at, along = "z", step = 3.25, rise = 1.1, over = -1.5, y, names, beds, n, name, as = Bed, bed = {} }) {
  const hall = useHall(), list = beds ?? names ?? Array.from({ length: n ?? 0 }, () => name);
  const spot = (i, d = 0) => along === "x" ? [mm(at[0] + i * step + d), at[1]] : [at[0], mm(at[1] + i * step + d)];
  let k = from;
  const one = (s, yy, e) => { const id = nth(prefix, k++); return h(as, { key: id, id, at: s, y: yy, ...bed, ...(typeof e === "string" ? { name: e } : e) }); };
  return h(Fragment, null, list.flatMap((e, i) => Array.isArray(e)
    ? [one(spot(i), y, e[0]), one(spot(i, over), (y ?? hall.floor) + rise, e[1])]
    : [one(spot(i), y, e)]));
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "placement",
  is: "a row of beds down one wall of a dormitory, barracks or inn: single cots, or two-high bunks with each lower and upper bed its own sleep spot",
  tags: ["bunk", "bunks", "dormitory", "barracks", "beds", "row", "sleep", "cots", "rented"],
  props: { prefix: "id stem; beds are <prefix>-<from>, -<from+1> … counted bed by bed (default bed-bunk)", from: "the first number (default 1)", at: "[x, z] m: the first bed", along: "z (default) | x: the axis the row runs down, +", step: "m between frames (default 3.25)", rise: "m an upper bunk stands above the floor (default 1.1)", over: "m an upper bunk's spot shifts along the row from its lower (default -1.5)", y: "height m of the lower beds (default the floor)", beds: "[entry, …]: a name (one bed), [lower, upper] (a bunk) or { name, col, … } (one bed's own props)", names: "the same as beds (older name)", n: "with name: n identical beds", name: "with n: their prompt name", as: "the bed component (default Bed; InnBed for rented beds)", bed: "props every bed shares ({ inn, keeper } for InnBed)" },
  footprint: { kind: "line", cells: [1, 5] },
  topology: { under: ["Interior", "Room", "Bunkroom", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["verbs/grid", "hall/Bunkroom"],
  pitfalls: ["ids are counted bed by bed: two rows with one prefix collide unless the second says from", "it runs along + of one axis: a row that runs the other way starts at its far end", "beds/names/n is required: the list's length is the row's length"],
};

BunkRow.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
