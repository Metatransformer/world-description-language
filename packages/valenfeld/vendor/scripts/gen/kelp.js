// A kelp clump: params.n ribbons, params.len tall. Swayed whole by scripts/sway.js.
import { dk } from "../lib/drowned-kit.js";
export function geometry(ctx) { const p = ctx.params ?? {}; dk(ctx, false).kelp(0, 0, 0, p.n ?? 6, p.len ?? 4, true); }
