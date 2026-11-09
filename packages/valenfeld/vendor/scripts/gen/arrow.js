import { mesher } from "../lib/mesh.js";
export function geometry(ctx) {
  const m = mesher(ctx, { vertexColors: true });
  m.tube(
    [
      { p: [0, 0, 0.35], rx: 0.009, ry: 0.009 },
      { p: [0, 0, -0.35], rx: 0.009, ry: 0.009 },
    ],
    { sides: 5, colorOf: () => "#ad8957" },
  );
  m.box([-0.02, -0.008, -0.42], [0.02, 0.008, -0.34], "#aab4bd");
  m.box([-0.055, -0.004, 0.18], [0.055, 0.004, 0.33], "#ded2b7");
  m.box([-0.004, -0.055, 0.18], [0.004, 0.055, 0.33], "#ded2b7");
  return m.done();
}
