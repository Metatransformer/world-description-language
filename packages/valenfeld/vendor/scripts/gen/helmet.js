// #332 a helm worn on a rigged body's Head bone (scripts/lib/arms.js wear()). params.kind: cap | kettle | horned | hood.
// local frame: origin at the head bone, +y up the skull, -z the face. sizes in metres for a 1.8 m body.
import BK from "../lib/data/building-kit.json";
import { LA, BXR as BX, paint, flatc } from "../lib/buildkit.js";
const { iron: IR, oak: OAK } = BK.textures;
const IRONC = "oklch(0.62 0.01 250)", DARK = "oklch(0.32 0.01 250)", CLOTH = "oklch(0.36 0.04 60)", HORN = "oklch(0.86 0.04 85)";
export function geometry(c) {
  const k = c.params?.kind ?? "cap", D = c.lod, n = D <= 2 ? 14 : 8;
  if (k === "hood") {   // a wool hood: a soft cowl over the crown, open at the face
    flatc(c, c.params?.color ?? CLOTH); LA(c, 0, -0.06, 0.02, [[0.15, 0], [0.155, 0.1], [0.14, 0.2], [0.09, 0.27], [0, 0.29]], n, true);
    flatc(c, "oklch(0.18 0.02 60)"); BX(c, -0.075, 0.02, -0.15, 0.075, 0.17, -0.12); return;   // the shadowed face opening
  }
  paint(c, IR, IRONC);
  LA(c, 0, 0.04, 0, [[0.128, 0], [0.13, 0.05], [0.118, 0.12], [0.08, 0.175], [0, 0.195]], n, true);   // the skull
  paint(c, IR, DARK); LA(c, 0, 0.03, 0, [[0.136, 0], [0.136, 0.03]], n, false);   // the brow band
  if (k === "kettle") { paint(c, IR, IRONC); LA(c, 0, 0.035, 0, [[0.13, 0.012], [0.24, -0.02], [0.245, -0.005], [0.13, 0.03]], n, true); }   // the wide kettle brim
  if (k === "cap" || k === "horned") { paint(c, IR, DARK); BX(c, -0.014, -0.05, -0.145, 0.014, 0.08, -0.125); }   // the nasal bar
  if (k === "horned") { flatc(c, HORN); for (const s of [-1, 1]) {   // two curled horns off the temples
    let x = s * 0.12, y = 0.12; for (let i = 0; i < (D <= 2 ? 6 : 3); i++) { const r = 0.035 - i * 0.004, nx = x + s * 0.035, ny = y + 0.03 + i * 0.006; BX(c, Math.min(x, nx) - 0.004, y - r / 2, -r / 2, Math.max(x, nx) + 0.004, ny + r / 2, r / 2); x = nx; y = ny; } } }
}
