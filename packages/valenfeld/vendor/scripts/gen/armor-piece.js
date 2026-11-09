// #332 a worn armour piece on a rigged limb bone (scripts/lib/arms.js wear()). params.kind: pauldron | bracer | greave; params.metal: mail | plate.
// local frame: origin at the bone's head, +y runs down the limb toward its child bone. metres for a 1.8 m body.
import BK from "../lib/data/building-kit.json";
import { LA, BXR as BX, paint, flatc } from "../lib/buildkit.js";
const { iron: IR } = BK.textures;
export function geometry(c) {
  const k = c.params?.kind ?? "pauldron", plate = c.params?.metal === "plate", n = c.lod <= 2 ? 12 : 7;
  const METAL = plate ? "oklch(0.7 0.01 250)" : "oklch(0.55 0.01 250)", STRAP = "oklch(0.3 0.04 50)";
  if (k === "pauldron") {   // a domed shoulder cap, layered lames under it on plate
    paint(c, IR, METAL); LA(c, 0, -0.02, 0, [[0.1, 0], [0.095, 0.05], [0.06, 0.09], [0, 0.1]], n, true);
    if (plate) LA(c, 0, 0.05, 0, [[0.105, 0], [0.105, 0.035]], n, true);
  } else if (k === "bracer") {   // a forearm cuff with a leather strap
    paint(c, IR, METAL); LA(c, 0, 0.04, 0, [[0.055, 0], [0.06, 0.16]], n, true);
    flatc(c, STRAP); LA(c, 0, 0.1, 0, [[0.063, 0], [0.063, 0.025]], n, false);
  } else if (k === "cuirass") {   // a breastplate over the chest, a fauld below on plate (bone: Spine2, +y up the back)
    paint(c, IR, METAL); LA(c, 0, -0.18, 0.01, [[0.15, 0], [0.165, 0.12], [0.17, 0.24], [0.12, 0.3]], n, true);
    if (plate) LA(c, 0, -0.3, 0.01, [[0.16, 0], [0.155, 0.12]], n, true);
    flatc(c, STRAP); LA(c, 0, -0.06, 0.01, [[0.172, 0], [0.172, 0.03]], n, false);
  } else if (k === "boot") {   // an iron-shod boot cuff over the ankle (bone: Foot)
    flatc(c, STRAP); LA(c, 0, -0.06, 0, [[0.06, 0], [0.065, 0.12]], n, true);
    paint(c, IR, METAL); LA(c, 0, 0.0, 0, [[0.068, 0], [0.068, 0.03]], n, false);
  } else if (k === "tabard") {   // #28 a house tabard over the mail, front and back, trim at the hem and a device on the chest (bone: Spine2)
    const [A, B] = c.params?.colors ?? ["#2f3d52", "#c9a45a"];
    for (const z of [-1, 1]) {
      flatc(c, A); BX(c, -0.15, -0.66, z * 0.19 - 0.008, 0.15, 0.13, z * 0.19 + 0.008);
      flatc(c, B); BX(c, -0.155, -0.7, z * 0.19 - 0.01, 0.155, -0.64, z * 0.19 + 0.01);
      BX(c, -0.155, 0.11, z * 0.19 - 0.01, 0.155, 0.14, z * 0.19 + 0.01);
    }
    flatc(c, B); BX(c, -0.05, -0.12, -0.205, 0.05, 0.0, -0.195); BX(c, -0.015, -0.2, -0.205, 0.015, 0.06, -0.196);
    flatc(c, STRAP); BX(c, -0.18, -0.36, -0.2, 0.18, -0.32, 0.2);
  } else if (k === "apron") {   // a smith's leather apron hung from the chest (bone: Spine2)
    flatc(c, "oklch(0.38 0.05 45)"); BX(c, -0.17, -0.62, -0.165, 0.17, 0.12, -0.14);
    flatc(c, STRAP); BX(c, -0.18, -0.12, -0.17, 0.18, -0.09, 0.15);
  } else {   // a greave over the shin, a knee cop on plate
    paint(c, IR, METAL); LA(c, 0, 0.08, 0, [[0.068, 0], [0.072, 0.3]], n, true);
    if (plate) LA(c, 0, -0.03, 0, [[0.07, 0], [0.075, 0.05], [0.05, 0.1]], n, true);
  }
}
