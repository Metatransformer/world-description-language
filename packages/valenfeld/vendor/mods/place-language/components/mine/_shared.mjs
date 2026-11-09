// mine kit · helpers its components share (not components)
import { h } from "../../lib/react.mjs";

// the way in from the parent working: link({ to, side, t, how }) as a child of the room it opens from
export const Way = ({ from, to, how = "tunnel", side, t, bt, oneway, lock }) => from ? h("link", { key: `way-${from}-${to}`, a: from, b: to, how, side, t, bt, oneway, lock }) : null;
