// cave kit · SpiderNest
import { h, Fragment } from "../../lib/react.mjs";
import { Cobweb } from "./Cobweb.mjs";

// SpiderNest({ corner, webs, sacs, kind, count, lv, why }): spiders guarding their egg sacs in a webbed corner
export const SpiderNest = ({ corner = "nw", webs, sacs = 4, kind = "cave-spider", count = 2, lv, why = "spiders over their eggs", size = 2.2 }) => h(Fragment, null,
  h(Cobweb, { corners: webs ?? [corner], size, why: "the nest's webs" }),
  h("place", { kind: "eggsacs", at: (r) => r.corner(corner, 0.9), count: sacs, meaning: "a clutch of silk egg sacs" }),
  ...Array.from({ length: count }, (_, i) => h("foe", { key: `spider-${i}`, kind, at: (r) => r.corner(corner, 2 + i * 1.2).by(i % 2 ? 0.8 : -0.4, i % 2 ? -0.4 : 0.8), lv, why })));

export const meta = {
  layer: "meaning",
  is: "a spider nest: a webbed corner with a clutch of egg sacs and the spiders that guard it, who come at whoever walks in",
  tags: ["spider", "nest", "web", "cobweb", "eggs", "egg sacs", "lair", "brood", "encounter", "cave"],
  props: { corner: "corner the nest fills: nw | ne | sw | se", webs: "corners that carry webs (default: the nest's corner)", sacs: "egg sacs on the floor (4)", kind: "spider foe kind (cave-spider; mine-spider)", count: "spiders guarding (2)", lv: "level or [min, max]", why: "why they nest here", size: "web reach along each wall, metres (2.2)" },
  footprint: { kind: "area", cells: [3, 3], height: 3.6 },
  topology: { under: ["In"], takes: [], joins: [], emits: ["prop", "foe"] },
  twins: ["cave/Lair", "cave/Beasts", "sewer/RatPack", "mine/Foe", "cave/Cobweb"],
  pitfalls: ["the room needs 3+ cells each way: spiders stand up to 4 cells out from the corner", "a nest corner with a door in it blocks the door with web and sacs", "the boss version is plan/Boss with a spider kind, not this"],
};
SpiderNest.meta = meta;
