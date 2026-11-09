// THE DROWNED TEMPLE, mouth: a limestone temple half sunk in the Saltmarch seabed, tilted 7° to starboard and 2° nose-up.
// Origin = the seabed at the temple's centre; the doorway faces -z. Stepped plinth, a cella with a dark doorway framed
// by two kneeling faceless bronze statues, a broken colonnade of 8 (two fallen), the pediment collapsed onto the steps.
import { dk } from "../lib/drowned-kit.js";
import { xf } from "./barrow-kit.js";
export const TILT = { y: -0.9, pitch: 2, roll: 7 };
const tilt = xf(0, TILT.y, 0, 0, TILT.pitch, TILT.roll);
// the doorway threshold and the light just outside it, in the root's frame (the gate and lamp stand here)
export const DOOR = tilt(0, 1.0, -5.55), LAMP = tilt(0, 2.8, -6.6);
const COLS = [ // x, z, h, state: "up" | "broken" | "fallen" (yaw)
  [-5.7, -8.2, 5.6, "up"], [-3.2, -8.2, 5.6, "up"], [3.2, -8.2, 3.3, "broken"], [5.7, -8.2, 0, "fallen", 100],
  [-5.7, -2.2, 5.6, "up"], [5.7, -2.2, 2.4, "broken"], [-5.7, 3.6, 0, "fallen", 200], [5.7, 3.6, 5.6, "up"],
];
function temple(D, ctx, col) {
  const K = D.K;
  // stepped plinth, its lowest course buried
  for (const [hx, hz, y0, y1] of [[8, 11, -1.6, 0], [7.2, 10.2, 0, 0.5], [6.4, 9.4, 0.5, 1.0]]) { D.lime(0.9); K.bbox(-hx, y0, -hz, hx, y1, hz, 0.05); }
  // the cella: four walls, a doorway 2.6 x 3.4 in the front one, the front wall broken down on the right
  const Y = 1.0, T = 0.7, X = 4.4, Z0 = -5.5, Z1 = 7.5, H = 6.6;
  D.lime();
  K.box(-X, Y, Z0, -X + T, H, Z1); K.box(X - T, Y, Z0, X, H - 1.2, Z1); K.box(-X, Y, Z1 - T, X, H, Z1);
  K.box(-X, Y, Z0, -1.3, H, Z0 + T); K.box(1.3, Y, Z0, X, H - 1.6, Z0 + T); K.box(-1.3, Y + 3.4, Z0, 1.3, H - 0.4, Z0 + T);
  if (!col) { // the dark inside: black faces just within the walls, so the door reads as a hole
    D.dark(); K.box(-X + T, Y + 0.01, Z0 + T, X - T, Y + 0.02, Z1 - T);
    K.quad([-X + T + 0.02, Y, Z1 - T - 0.02], [X - T - 0.02, Y, Z1 - T - 0.02], [X - T - 0.02, H, Z1 - T - 0.02], [-X + T + 0.02, H, Z1 - T - 0.02], [0, 3, 0]);
    // a bronze door frame: jambs and a lintel plate
    D.bronze(); for (const s of [-1, 1]) K.box(s * 1.3 - 0.14, Y, Z0 - 0.08, s * 1.3 + 0.14, Y + 3.4, Z0 + T + 0.04);
    K.box(-1.55, Y + 3.4, Z0 - 0.1, 1.55, Y + 3.75, Z0 + 0.1);
    // rubble on the broken right wall-top, a cornice course
    D.lime(0.85); for (let k = 0; k < 4; k++) K.rock(1.8 + k * 0.7, H - 1.4 + D.R() * 0.2, Z0 + 0.35, 0.3, 0.18, 0.28, 6, 3, 0.25);
    K.box(-X - 0.15, H, Z1 - T - 0.15, X + 0.15, H + 0.25, Z1 + 0.15);
  }
  // the rear half of the roof still stands; the front half lies on the steps
  D.lime(0.88); K.box(-X - 0.4, H, 1.4, X + 0.4, H + 0.5, Z1 + 0.4);
  // the colonnade
  for (const [x, z, h, st, yaw] of COLS) {
    if (st === "fallen") { D.lime(); K.box(x - 0.6, Y, z - 0.6, x + 0.6, Y + 0.28, z + 0.6); continue; } // only the base remains
    D.column(x, Y, z, h, st === "broken");
  }
  D.lime(0.86); K.bbox(-6.3, Y + 6.02, -8.8, -2.6, Y + 6.62, -7.6, 0.04); // an architrave span left on the two left columns
  // the statues flanking the door
  D.statue(-1.95, Y, -6.7, 0); D.statue(1.95, Y, -6.7, 0);
  D.barn(-4.4, Y + 0.2, Y + 2.2, Z0, 0.05, 14); D.barn(4.4, Y + 0.2, Y + 1.8, Z0, 0.05, 14);
}
function build(ctx, col) {
  const D = dk(ctx, col), K = D.K;
  K.at(() => temple(D, ctx, col), 0, TILT.y, 0, 0, TILT.pitch, TILT.roll);
  // what fell off it, lying flat on the seabed
  D.fallen(7.6, -0.25, -8.4, 100, 4);
  D.fallen(-7.4, -0.1, 3.0, 205, 4);
  D.pediment(-1.2, 0.15, -13.2, 12, -14, 8, 9, 2.2, 1.1, -4.5, 0.6);
  D.pediment(3.6, -0.2, -12.4, -28, 9, -12, 9, 2.2, 1.1, 0.9, 4.5);
  // the sand that buries its starboard side and its back
  D.drift(8.6, -0.4, 1.5, 3.2, 1.9, 7.5); D.drift(7.2, -0.6, -6, 2.4, 1.3, 3); D.drift(0, -0.5, 11.5, 8, 1.6, 2.8); D.drift(-8.8, -0.7, -3, 1.8, 0.9, 4);
  if (!col) {
    D.lime(0.8); for (let k = 0; k < 14; k++) { const a = D.R() * 6.283, r = 9 + D.R() * 6; K.rock(Math.cos(a) * r, 0, Math.sin(a) * r, 0.25 + D.R() * 0.4, 0.2 + D.R() * 0.25, 0.25 + D.R() * 0.4, 6, 3, 0.3); }
    D.kelp(-9.5, -0.1, -9, 5, 4.5); D.kelp(9.8, -0.2, -10.5, 4, 3.5); D.kelp(-10, -0.1, 7.5, 6, 5); D.kelp(4.5, 0.6, 12.5, 4, 3); D.kelp(-4.6, -0.1, -12.2, 3, 2.8);
  }
}
export function geometry(ctx) { build(ctx, false); }
export function collider(ctx) { build(ctx, true); }
