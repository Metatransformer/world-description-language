// masonry kit · Chamber
import { h } from "../../lib/react.mjs";

// Chamber({ id, rect, name, kind, level, floor, purpose, wall, ground, ceil }, children): a room built of one masonry.
//   wall "fs" fieldstone | "brick" | "vault" dressed vault stone; ground "flag" | "wet" | "earth"; ceil "oak" | "earth" | "vault" | "iron"
//   or Chamber({ table, id, ... }): its shape read from a generator's room table (gaol.js ROOMS): the procedural layer decides the rect
export function Chamber({ id, wall, ground, ceil, children, table, grid = 2, ...room }) {
  if (table) {   // the table is the truth for shape, stone and water: a component's style defaults never overrule what the generator builds
    const t = table.find((r) => r.id === id); if (!t) throw new Error(`Chamber: no row "${id}" in its table`);
    const rect = [t.x0 / grid, t.z0 / grid, (t.x1 - t.x0) / grid, (t.z1 - t.z0) / grid];   // exact, half cells allowed
    const water = (c) => c && typeof c === "object" && (c.type === "channel" || c.type === "pool");
    const strip = (c) => Array.isArray(c) ? c.map(strip).filter((x) => x != null) : water(c) ? null : c;
    return h("room", { key: id, id, rect, floor: t.y ?? 0, height: t.h ?? 3, ...room },
      t.shell === false ? null : h("shell", { wall: t.wall, floor: t.floor, ...(t.ceil ? { ceil: t.ceil } : {}) }),   // shell: false = another builder draws its walls
      t.chan ? h("channel", { walkway: "both" }) : null, t.pool ? h("pool", { depth: 1.2 }) : null,
      strip(children));
  }
  return h("room", { key: id, id, ...room }, h("shell", { wall, floor: ground, ...(ceil ? { ceil } : {}) }), children);
}

export const meta = {
  layer: "space",
  is: "a room built of one kind of masonry (fieldstone, brick or dressed vault stone) with a chosen floor and ceiling",
  tags: ["room", "chamber", "masonry", "built", "stone", "brick", "prison", "cellar", "shell"],
  props: { id: "room id", rect: "[x, z, w, d] cells (2 m)", name: "shown name", kind: "entry | hall | chamber ...", level: "level number", floor: "floor y metres", height: "ceiling metres", purpose: "what the room is for", wall: "fs fieldstone | brick | vault", ground: "flag | wet | earth", ceil: "oak | earth | vault | iron", table: "a generator's room table (gaol.js ROOMS): shape, stone and water read from its row instead", grid: "metres per cell when reading table (2)" },
  footprint: { kind: "room", cells: [5, 5], height: 3 },
  topology: { under: [], takes: ["Cell", "Door", "Hold", "Cache", "Pack", "Dressing"], joins: [], emits: ["room", "shell", "channel", "pool"] },
  twins: ["crypt/Vault", "sewer/Vault", "mine/Cut", "plan/Space", "cave/Hollow"],
  pitfalls: ["it cuts no way in: add link rows (or a plan Space) or the room is sealed", "with table, an id missing from the table throws; and wall/ground/ceil you pass are ignored in favour of the row", "water rows (channel, pool) among children are stripped in table mode: the table decides water"],
};

Chamber.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
