// wilds kit · Strewn: the loose stuff of open country (boulders, fallen logs, milestones) laid from a table, not one element each.
// <Strewn of={Rock} rows={TABLE.rocks} />: each row is that component's props ({ n, at, yaw, scale, seed } for a Rock).
import { h, Fragment } from "../../lib/react.mjs";
export const Strewn = ({ of, rows = [] }) => h(Fragment, null, ...rows.map((r) => h(of, r)));
export const meta = {
  layer: "placement",
  is: "many of one wilds piece laid from a table of placements (a boulder field, fallen logs, a line of milestones), so a region reads as places, not a wall of coordinates",
  tags: ["strewn", "scatter", "field", "many", "table", "rocks", "logs", "boulders", "placement"],
  props: { of: "the component (Rock, Log, Milestone…)", rows: "its props, one per piece" },
  footprint: { kind: "none" },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: ["common/Scatter"], pitfalls: ["rows are kept placements (hand-tuned, terrain-read): a fresh field wants a seeded scatter instead"],
};
Strewn.meta = meta;
