// GAOL: a lock-up's parts. Harvested from the prison's hand rows (gaol#gaol grates, the gaol-scene logic row, cell torches).
// Used by: prison. (Coiners' Hollow's kits#gaol rows are the next taker.)
import { h, Fragment } from "../../../tools/place/react.mjs";
import { Chamber, Hold } from "./masonry.mjs";
// Cellblock({ id, rect, ... }, children): fieldstone cells under an oak ceiling.
export const Cellblock = ({ children, ...p }) => h(Chamber, { kind: "cellblock", wall: "fs", ground: "flag", ceil: "oak", ...p }, children);
// Cell({ name, torch, grate, stone }): one cell; its torch (row + light), its floor grate (row + glimmer + draft + glow), its loose stone.
export function Cell({ torch, grate, stone, why }) {
  return h(Fragment, null,
    torch && h(Torch, { id: torch.id, at: torch.at }),
    grate && h(Fragment, null, ["", "-glimmer", "-draft"].map((sfx) => h(Hold, { key: grate.id + sfx, id: grate.id + sfx, at: grate.at, why: sfx === "-glimmer" ? "the quest glint: main-escape points here" : why ?? "the cell's floor grate" }))),
    stone && h(Fragment, null, h(Hold, { id: stone.id, at: stone.at, why: "the loose stone the last prisoner worked" }), h(Hold, { id: stone.id + "-scratch", at: stone.at, why: "his tally scratched beside it" })));
}
// Torch({ id, at }): a wall torch row and its light row (<id>-light).
export const Torch = ({ id, at }) => h(Fragment, null, h(Hold, { id, at, why: "torch" }), h(Hold, { id: id + "-light", at, why: "its light" }));
// Grate({ id, at, glimmer, why }): an iron grate the player opens, with its glint when the quest wants it.
export const Grate = ({ id, at, glimmer = true, why }) => h(Fragment, null, h(Hold, { id, at, why }), glimmer && h(Hold, { id: id + "-glimmer", at, why: "its glint" }));
