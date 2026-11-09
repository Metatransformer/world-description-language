// A two-handed great axe, 1.2 m: origin at the grip centre, long haft along +Y, a broad bearded blade toward +X, a curved spike behind.
import { buildAxe } from "./axe-build.js";
export function geometry(ctx) { return buildAxe(ctx, { length: 0.95, haft: 0.017, grip: 0.36, head: 0.26, reach: 1.05, beard: 0.42, thick: 0.007, spike: true }); }
