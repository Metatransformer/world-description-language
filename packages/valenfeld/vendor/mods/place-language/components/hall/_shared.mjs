// hall kit · helpers its components share (not components)
import { h, useContext } from "../../lib/react.mjs";
import { HallContext } from "./HallContext.mjs";

export const useHall = () => useContext(HallContext);
export const row = (id, spec, why, via = "row") => h("row", { key: "@" + id, spec, via, ...(why ? { why } : {}) });
export const pos = (hall, [x, z], y) => ({ x: hall.at[0] + x, y: y ?? hall.floor, z: hall.at[1] + z });
// mm(v): a length held to the millimetre, so a stepped row (10.7 + 2 × 2.8) lands on the number a hand would write
export const mm = (v) => Math.round(v * 1000) / 1000;
// nth(prefix, n, kind): the id of the nth thing in a numbered set: <prefix>-<kind>-<n>, or <prefix>-<n> with no kind
export const nth = (prefix, n, kind) => kind ? `${prefix}-${kind}-${n}` : `${prefix}-${n}`;
