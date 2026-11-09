// A one-handed bearded war axe, 0.75 m: origin at the grip centre, haft along +Y, blade toward +X, a hammer poll behind.
import { buildAxe } from "./axe-build.js";
export function geometry(ctx) { return buildAxe(ctx, { length: 0.72, haft: 0.0145, grip: 0.2, head: 0.17, reach: 0.95, beard: 0.32, thick: 0.006, spike: false }); }
