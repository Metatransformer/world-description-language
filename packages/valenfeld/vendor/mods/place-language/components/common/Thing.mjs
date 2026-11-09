// common · Thing: the one body under every kit piece in the library: a kit row standing where its parent says.
// Thing({ kit, id, at, yaw, scale, params, parent, why }): template templates/kits.js#<kit>, feet at `at` in the parent's metres.
// Reads the nearest frame it stands in (a Wilds root, a town, an interior) through FrameContext; `parent` overrides it.
import { h, useContext, createContext } from "../../lib/react.mjs";
export const FrameContext = createContext({ id: null, kits: "templates/kits.js" }, "frame");
export function Thing({ kit, id, at = [0, 0, 0], yaw, scale, params, parent, tags, state, why }) {
  const f = useContext(FrameContext), p = parent ?? f.id, rid = p ? `${p}/${id ?? kit}` : (id ?? kit);
  const [x, y, z] = at;
  return h("row", { key: "@" + rid, via: "row", ...(why ? { why } : {}), spec: { template: `${f.kits ?? "templates/kits.js"}#${kit}`, overrides: {
    feetPosition: { x, y, z }, castShadow: true, receiveShadow: true, physics: "static",
    ...(p ? { parent: p } : {}), ...(yaw != null ? { rotation: { yaw } } : {}), ...(scale != null ? { scale } : {}),
    ...(params ? { primitive: { params } } : {}), ...(tags ? { tags } : {}), ...(state ? { state } : {}) } } });
}
export const meta = {
  layer: "dressing",
  is: "any kit piece standing at a point under the frame it is placed in: the shared body every things-kit component wraps",
  tags: ["thing", "kit", "prop", "piece", "place", "row"],
  props: { kit: "the kit id in scripts/lib/data/kits.json", id: "row name under the parent (default the kit)", at: "[x, y, z] m in the parent's frame", yaw: "degrees", scale: "number or {x,y,z}", params: "the kit's own params", parent: "a row id; default the FrameContext id", why: "design note" },
  footprint: { kind: "point", cells: [1, 1], height: 1 },
  topology: { under: ["Wilds", "Site", "Interior", "Town", "FrameContext"], takes: [], joins: [], emits: ["row"] },
  twins: ["wilds/Rock", "wilds/Log", "wilds/Milestone"],
  pitfalls: ["`at` is local to the parent: under a town root it is town metres, not world"],
};
Thing.meta = meta;
