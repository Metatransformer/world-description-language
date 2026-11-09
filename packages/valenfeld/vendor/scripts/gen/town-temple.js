import { SB, SOLIDS, XF } from "../lib/furnkit.js";
import { flatc, paint, LA, HX, CY, TORUS, BX, OAK, WOOD } from "../lib/buildkit.js";
import { candle } from "../lib/furnkit.js";
function layout(c) {
  const wallTexture =
    c.params?.style === "hof"
      ? "cdn/texture-dark-oak-planks.png"
      : (c.params?.style === "dome" || c.params?.style === "tide")
        ? "cdn/texture-weathered-sandstone-blocks.png"
        : "cdn/texture-rough-fieldstone-wall.png";
  const style = c.params?.style ?? "chapel",
    hof = style === "hof",
    sea = style === "sea",
    col = hof ? "#50392a" : style === "dome" || style === "tide" ? "#d7b783" : "#92928b";
  SB(c, null, "#89877b", -7, -0.6, -9, 7, 0.15, 9);
  SB(c, wallTexture, col, -6, 0.15, 7.5, 6, 5, 8);
  for (const x of [-1, 1]) {
    // creator Nov 4 "this thing needs walls": the sea shrine is walled like every other; its columns stand as pilasters against the walls
    {
      SB(
        c,
        wallTexture,
        col,
        x < 0 ? -6 : 5.5,
        0.15,
        -8,
        x < 0 ? -5.5 : 6,
        5,
        8,
      );
    }
    if (sea)
      for (const z of [-7, 0, 7])
        SB(
          c,
          null,
          col,
          x * 5.5 - 0.25,
          0.15,
          z - 0.25,
          x * 5.5 + 0.25,
          5,
          z + 0.25,
        );
  }
  {
    SB(c, wallTexture, col, -6, 0.15, -8, -1.6, 5, -7.5);
    SB(c, wallTexture, col, 1.6, 0.15, -8, 6, 5, -7.5);
    SB(c, wallTexture, col, -1.6, 3.6, -8, 1.6, 5, -7.5);
  }
  if (style === "tide") tide(c, wallTexture, col);
  else if (style === "dome") {
    flatc(c, "#3c8b92");
    LA(
      c,
      0,
      5,
      0,
      [
        [6, 0],
        [5.8, 1.5],
        [4.6, 3],
        [2.8, 4.5],
        [0, 5],
      ],
      24,
      false,
    );
  } else {
    flatc(c, hof ? "#354336" : sea ? "#40757d" : "#4d5358");
    for (const side of [-1, 1]) {
      const base = [
        [side * 7, 5, -9],
        [0, 8, -9],
        [0, 8, 9],
        [side * 7, 5, 9],
      ];
      HX(c, [...base, ...base.map(([x, y, z]) => [x, y + 0.25, z])]);
    }
    // #1599 gable ends: the walls stop at 5 m and the ridge is at 8 m, so close each end with a stone triangle under the roof
    if (!sea) for (const [z0, z1] of [[-8, -7.5], [7.5, 8]]) {
      paint(c, wallTexture, col);
      HX(c, [[-6, 5, z0], [6, 5, z0], [6, 5, z1], [-6, 5, z1], [-0.01, 7.6, z0], [0.01, 7.6, z0], [0.01, 7.6, z1], [-0.01, 7.6, z1]]);
      c.solid?.(-3, 5, z0, 3, 6.5, z1);
    }
    if (hof)
      for (const x of [-6, 6])
        SB(c, null, "#d3c7a7", x - 0.1, 5, -8.6, x + 0.1, 8, -8.3);
  }
  // #1599 the altar: a stepped stone table under a linen cloth, two tall iron-and-brass candlesticks, a book and a pair of small candles
  SB(c, null, "#a9a08a", -2.4, 0.15, 4.4, 2.4, 0.35, 6.8);   // dais step
  SB(c, null, "#c8bd9a", -1.6, 0.35, 5.0, 1.6, 1.15, 6.2);   // altar block
  SB(c, null, "#d9d0b4", -1.75, 1.15, 4.9, 1.75, 1.27, 6.3);  // mensa slab, overhanging
  flatc(c, "#e9e2cf"); BX(c, -1.2, 1.27, 4.88, 1.2, 1.29, 6.32); BX(c, -1.2, 0.75, 4.86, 1.2, 1.29, 4.88);   // linen cloth and its front fall
  flatc(c, "#8c2f2a"); BX(c, -0.25, 0.7, 4.85, 0.25, 1.29, 4.87);   // a red stole down the cloth
  paint(c, OAK, "#5a3c26"); BX(c, -0.28, 1.29, 5.45, 0.28, 1.35, 5.85); flatc(c, "#efe6cc"); BX(c, -0.25, 1.35, 5.48, 0.25, 1.37, 5.82);   // the open book
  candle(c, -0.9, 1.29, 5.6, 0.18); candle(c, 0.9, 1.29, 5.6, 0.18);
  for (const x of [-2.1, 2.1]) {
    flatc(c, "#3a3632"); CY(c, x, 0.35, 5.6, 0.18, 0.08, 10); CY(c, x, 0.43, 5.6, 0.04, 1.35, 6);
    flatc(c, "#c7a557"); CY(c, x, 1.78, 5.6, 0.12, 0.05, 10); c.solid?.(x - 0.18, 0.35, 5.42, x + 0.18, 1.85, 5.78);
    candle(c, x, 1.83, 5.6, 0.32);
  }
  // pews: plank seat, raked back, carved end boards, a kneeler; facing the altar (+z), aisle down the middle
  for (const x of [-3.5, 3.5])
    for (const z of [-3, 0, 3]) {
      const x0 = x - 1.25, x1 = x + 1.25;
      c.solid?.(x0, 0.15, z - 0.3, x1, 0.62, z + 0.3); c.solid?.(x0, 0.15, z - 0.36, x1, 1.1, z - 0.26);
      paint(c, OAK, WOOD);
      BX(c, x0, 0.58, z - 0.28, x1, 0.64, z + 0.24);   // seat
      HX(c, [[x0, 0.64, z - 0.3], [x1, 0.64, z - 0.3], [x1, 0.64, z - 0.24], [x0, 0.64, z - 0.24], [x0, 1.12, z - 0.4], [x1, 1.12, z - 0.4], [x1, 1.12, z - 0.34], [x0, 1.12, z - 0.34]]);   // back, raked
      for (const e of [x0, x1 - 0.07]) HX(c, [[e, 0.15, z - 0.34], [e + 0.07, 0.15, z - 0.34], [e + 0.07, 0.15, z + 0.3], [e, 0.15, z + 0.3], [e, 1.2, z - 0.44], [e + 0.07, 1.2, z - 0.44], [e + 0.07, 0.72, z + 0.3], [e, 0.72, z + 0.3]]);   // end boards
      BX(c, x0 + 0.07, 0.15, z + 0.12, x1 - 0.07, 0.3, z + 0.2);   // stretcher
      flatc(c, "#6e2a26"); BX(c, x0 + 0.1, 0.15, z + 0.42, x1 - 0.1, 0.27, z + 0.62);   // kneeler cushion
    }
  // a worn runner up the aisle to the altar
  flatc(c, "#7a2d28"); BX(c, -0.7, 0.15, -7.4, 0.7, 0.17, 4.4);
  flatc(c, "#b48a4a"); BX(c, -0.7, 0.17, -7.4, -0.6, 0.175, 4.4); BX(c, 0.6, 0.17, -7.4, 0.7, 0.175, 4.4);
  if (!sea) SB(c, null, "#b99b61", -0.8, 2.3, 7.2, 0.8, 3.9, 7.4);
}
// the Temple of the Tide-Mother: stepped plinth, six-column portico under a pediment, corner pilasters, a drum and a tall sea-green dome with a lantern
function tide(c, tex, col) {
  // steps up to the portico (front is -z)
  for (let i = 0; i < 3; i++) SB(c, null, "#bfb39a", -6.5 + i * 0.2, -0.6, -13.4 + i * 0.7, 6.5 - i * 0.2, -0.3 + i * 0.3 + 0.15, -8);
  SB(c, null, "#cfc3a6", -6.4, -0.6, -11.3, 6.4, 0.75, -8);
  // columns: base, shaft, capital
  for (const x of [-5.2, -3.1, -1.05, 1.05, 3.1, 5.2]) {
    flatc(c, "#a99e86"); CY(c, x, 0.75, -10.4, 0.55, 0.3, 10);
    flatc(c, "#e2d6bb"); LA(c, x, 1.05, -10.4, [[0.42, 0], [0.4, 2], [0.36, 3.9]], 12, false);
    flatc(c, "#cdbf9f"); CY(c, x, 4.95, -10.4, 0.55, 0.25, 10);
    c.solid?.(x - 0.4, 0.75, -10.8, x + 0.4, 5.2, -10);
  }
  // entablature and pediment
  SB(c, tex, col, -6.3, 5.2, -11.2, 6.3, 6.1, -7.6);
  flatc(c, "#3c8b92"); SB(c, null, "#3c8b92", -6.4, 6.1, -11.3, 6.4, 6.25, -7.5);
  const pd = [[-6.3, 6.25, -11.2], [6.3, 6.25, -11.2], [6.3, 6.25, -7.6], [-6.3, 6.25, -7.6]];
  paint(c, tex, col); HX(c, [...pd, [0, 8.4, -11.2], [0, 8.4, -11.2], [0, 8.4, -7.6], [0, 8.4, -7.6]].map((v, i) => i < 4 ? v : [i === 4 ? -0.01 : i === 5 ? 0.01 : i === 6 ? 0.01 : -0.01, v[1], v[2]]));
  // tide-wave medallion in the pediment
  flatc(c, "#3c8b92"); TORUS(c, 0, 7.05, -11.25, 0.55, 0.09, 16, 6, "z");
  // corner pilasters and a cornice round the hall
  for (const x of [-6.2, 5.6]) for (const z of [-8.2, 7.6]) SB(c, tex, "#c9a974", x, 0.15, z, x + 0.6, 5.3, z + 0.6);
  SB(c, null, "#bca57a", -6.4, 5, -8.2, 6.4, 5.4, 8.2);
  // drum, ring and dome
  paint(c, tex, col); CY(c, 0, 5.4, 0, 5.2, 2.2, 24);
  flatc(c, "#bca57a"); TORUS(c, 0, 7.6, 0, 5.25, 0.18, 24, 6);
  flatc(c, "#3c8b92");
  LA(c, 0, 7.6, 0, [[5.3, 0], [5.1, 1.6], [4.4, 3.2], [3.2, 4.6], [1.6, 5.6], [0.9, 5.85]], 24, false);
  // lantern cupola and spire
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; flatc(c, "#e2d6bb"); CY(c, Math.cos(a) * 0.75, 13.4, Math.sin(a) * 0.75, 0.1, 1.2, 6); }
  flatc(c, "#3c8b92"); LA(c, 0, 14.6, 0, [[1.05, 0], [0.9, 0.35], [0.4, 0.9], [0.05, 2.2]], 12, true);
  flatc(c, "#c7a557"); CY(c, 0, 16.7, 0, 0.12, 0.25, 8);
  c.solid?.(-5.2, 5.4, -5.2, 5.2, 11, 5.2);
}
export function geometry(c) {
  const w = XF(c, 0, 0);
  w.params = c.params;
  layout(w);
}
export function collider(c) {
  const w = SOLIDS();
  w.params = c.params;
  layout(w);
  return w.list;
}
