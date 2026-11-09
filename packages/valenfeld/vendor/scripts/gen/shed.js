// THE SHED KIT, alone: the open-front lean-to shell (scripts/lib/shells/open-shed.js) with nothing under it.
// params: walls (stone | timber | plaster), w, d (m; default 10 × 10, Hroald's smithy), eave, rise, posts. Staged by the Codex's Kits chapter.
import { BXR, CB, HX, RB, paint } from "../lib/buildkit.js";
import BK from "../lib/data/building-kit.json";
import { openShed, openShedColliders, openShedFront, openShedFrontColliders } from "../lib/shells/open-shed.js";
const { fieldstone: FS, oak: OAK, slate: SL, flagstone: FLAG, plaster: PL, iron: IR } = BK.textures;
const { stone: STONE, wood: WOOD, white: WHITE, iron: IRONC } = BK.tints;
const WALLS = { stone: [FS, STONE], timber: [OAK, WOOD], plaster: [PL, WHITE] };
const opts = (p = {}) => ({ w: p.w, d: p.d, eave: p.eave, rise: p.rise, posts: p.posts, pal: { FS, OAK, SL, FLAG, STONE, WOOD, PL, WHITE, IR, IRONC, BX: BXR, HX, RB, paint, WALL: (WALLS[p.walls] ?? WALLS.stone)[0], WALLC: (WALLS[p.walls] ?? WALLS.stone)[1] } });
export function geometry(ctx) { const o = opts(ctx.params); if (ctx.params?.enclosed) openShedFront(ctx, o); openShed(ctx, o); }
export function collider(ctx) { const b = CB(), o = opts(ctx.params); openShedColliders(b, o, "walls"); openShedColliders(b, o, "roof"); if (ctx.params?.enclosed) openShedFrontColliders(b, o); return b.list; }
