// A drowned sentinel's head on its own: the bronze skull with its worn-flat face toward -z, origin at its centre.
// It sits on a headless D.statue in the reliquary; scripts/sentinel-head.js turns it toward whoever walks the passage.
import { dk } from "../lib/drowned-kit.js";
function build(ctx, col) { if (col) return; const D = dk(ctx, col); D.head(0, 0, 0); }
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
