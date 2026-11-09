// HIGHBRIDGE ROOF PIECES: one set of slabs and gables, drawn by hb-arcade, hb-guildhall and hb-span (and buildkit's ROOF,
// whose ridge runs along x). All take the roof's eaves height ye, ridge height yr and a thickness.
//   roofZ(c, x0, x1, z0, z1, ye, yr, t)     two slopes, ridge along z at the x middle
//   gableWedgeX(c, x, z0, z1, ye, yr, th)   a solid triangular gable wall in the plane x, th either side
//   gableWedgeZ(c, z, x0, x1, ye, yr, th)   the same in the plane z
//   gableFill(c, x0, x1, z, ye, yr, d)      a thin gable: two triangles at z and z + d, joined along the rakes
import { HX } from "../buildkit.js";
export function roofZ(c, x0, x1, z0, z1, ye, yr, t) { const xm = (x0 + x1) / 2;
  HX(c, [[x0, ye, z0], [xm, yr, z0], [xm, yr, z1], [x0, ye, z1], [x0, ye + t, z0], [xm, yr + t, z0], [xm, yr + t, z1], [x0, ye + t, z1]]);
  HX(c, [[xm, yr, z0], [x1, ye, z0], [x1, ye, z1], [xm, yr, z1], [xm, yr + t, z0], [x1, ye + t, z0], [x1, ye + t, z1], [xm, yr + t, z1]]); }
export function gableWedgeX(c, x, z0, z1, ye, yr, th) { const zm = (z0 + z1) / 2;
  HX(c, [[x - th, ye, z0], [x + th, ye, z0], [x + th, ye, z1], [x - th, ye, z1], [x - th, yr, zm], [x + th, yr, zm], [x + th, yr, zm], [x - th, yr, zm]]); }
export function gableWedgeZ(c, z, x0, x1, ye, yr, th) { const xm = (x0 + x1) / 2;
  HX(c, [[x0, ye, z - th], [x1, ye, z - th], [x1, ye, z + th], [x0, ye, z + th], [xm, yr, z - th], [xm, yr, z - th], [xm, yr, z + th], [xm, yr, z + th]]); }
export function gableFill(c, x0, x1, z, ye, yr, d) { const xm = (x0 + x1) / 2; for (const zz of [z, z + d]) c.tri(x0, ye, zz, x1, ye, zz, xm, yr, zz); c.quad(x0, ye, z, xm, yr, z, xm, yr, z + d, x0, ye, z + d); c.quad(xm, yr, z, x1, ye, z, x1, ye, z + d, xm, yr, z + d); }
