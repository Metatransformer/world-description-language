import { mesher } from "../lib/mesh.js";
export function geometry(ctx) {
  const m = mesher(ctx, { vertexColors: true });
  // the archer stands on +z (the draw pulls the string that way). A braced recurve: the grip is the bow's
  // forward-most point, the limbs sweep back toward the archer and the tips flick forward again; the string
  // runs straight between the tips on the archer's side and never crosses a limb (creator Oct 30: "bow its totally backwards")
  const points = [
    [0, -0.67, 0.12],
    [0, -0.56, 0.15],
    [0, -0.3, 0.08],
    [0, 0, 0],
    [0, 0.3, 0.08],
    [0, 0.56, 0.15],
    [0, 0.67, 0.12],
  ];
  m.tube(
    points.map((p) => ({ p, rx: 0.024, ry: 0.018 })),
    { sides: 6, k: 2, colorOf: () => "#81522e" },
  );
  const draw = ctx.params?.draw ?? 0;
  m.tube(
    [
      { p: points[0], rx: 0.003, ry: 0.003 },
      { p: [0, 0, 0.12 + draw * 0.42], rx: 0.003, ry: 0.003 },
      { p: points[6], rx: 0.003, ry: 0.003 },
    ],
    { sides: 4, colorOf: () => "#dfd0a8" },
  );
  if (ctx.params?.arrow) {   // a nocked arrow: nock on the string, shaft along the grip's side, head out past the bow
    const nz = 0.12 + draw * 0.42;
    m.tube([{ p: [0.012, 0.012, nz], rx: 0.005, ry: 0.005 }, { p: [0.012, 0.012, -0.34], rx: 0.005, ry: 0.005 }], { sides: 5, colorOf: () => "#a98a5c" });
    m.tube([{ p: [0.012, 0.012, -0.34], rx: 0.011, ry: 0.011 }, { p: [0.012, 0.012, -0.41], rx: 0.001, ry: 0.001 }], { sides: 4, colorOf: () => "#5d5a55" });
    for (const a of [0, 2.09, 4.19]) m.box([0.012 + Math.cos(a) * 0.004 - 0.002, 0.012 + Math.sin(a) * 0.004 - 0.012, nz - 0.13], [0.012 + Math.cos(a) * 0.014 + 0.002, 0.012 + Math.sin(a) * 0.014 + 0.012, nz - 0.03], "#b8382a");
  }
  for (let i = 0; i < 8; i++)
    m.box(
      [-0.029, -0.09 + i * 0.023, -0.024],
      [0.029, -0.075 + i * 0.023, 0.024],
      "#34261c",
    );
  return m.done();
}
