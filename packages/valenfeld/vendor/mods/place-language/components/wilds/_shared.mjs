// wilds kit · helpers its components share (not components)
import { h, useContext } from "../../lib/react.mjs";
import { WildsContext } from "./WildsContext.mjs";

export const useWilds = () => useContext(WildsContext);
export const row = (id, spec, why, via = "row") => h("row", { key: "@" + id, spec, via, ...(why ? { why } : {}) });
export const xyz = ([x, y, z]) => ({ x, y, z });
// a Site with `at` sets an origin: its pieces are written in the site's own metres, added here
export const placed = (w, at) => w.origin ? [at[0] + w.origin[0], at[1] + w.origin[1], at[2] + w.origin[2]] : at;
// one kit piece under the root: the shared shape of every row here
export function piece(kit, name, { at, yaw, scale, shade = true, cast = true, prim, state, tags, extra, why }) {
  const w = useWilds(), id = `${w.id}/${name}`;
  return row(id, { overrides: { ...(cast ? { castShadow: true } : {}), feetPosition: xyz(placed(w, at)), parent: w.id, physics: "static", ...(prim ?? { primitive: { params: {} } }),
    ...(shade ? { receiveShadow: true } : {}), ...(yaw != null ? { rotation: { yaw } } : {}), ...(scale != null ? { scale } : {}), ...(state ? { state } : {}), ...(tags ? { tags } : {}), ...(extra ?? {}) },
    template: `${w.kits}#${kit}` }, why);
}
