// THE WINDOW alone, for the Codex bench: the shared Highbridge window (scripts/lib/pieces/window.js) on a bit of wall.
// params.look: castle (round-headed ashlar) | span (tar-board casement) | lancet | rose (guild quarter; params.glass violet|red|warm, r); params.w, h; params.lit (span, default true);
// params.shut: shutter colour (span); params.pane: "warm" | "cold" | "green" | "dark".
import { paint, BX, TORUS } from "../lib/buildkit.js";
import { castleWindow, spanWindow, lancetZ, roseX } from "../lib/pieces/window.js";
const PANES = { warm: null, cold: { pane: "oklch(0.88 0.08 230)", paneGlow: [1.2, 2.0, 3.4] }, green: { pane: "oklch(0.88 0.14 150)", paneGlow: [1.0, 3.0, 1.2] }, dark: { pane: "oklch(0.24 0.03 230)", paneGlow: [0, 0, 0] } };
const ASH = "cdn/texture-ashlar-cream-limestone-two-courses-big-dressed-blocks-thin-pale-mortar-subtle-weathering.png", PL = "cdn/texture-lime-plaster-wall.png";
export function geometry(c) {
  const p = c.params ?? {}, look = p.look ?? "castle", lod = c.lod ?? 1, o = PANES[p.pane] ?? undefined;
  const EM = { violet: ["oklch(0.6 0.12 300)", [1.1, 0.6, 2.2]], red: ["oklch(0.6 0.15 25)", [2.4, 0.5, 0.4]], warm: ["oklch(0.7 0.1 70)", [1.7, 0.9, 0.34]] }[p.glass ?? "violet"];
  if (look === "lancet") { const w = p.w ?? 0.9, h = p.h ?? 3;
    paint(c, ASH, "oklch(0.9 0.02 80)"); BX(c, -1.6, 0, -0.4, 1.6, 5, 0.4);
    lancetZ(c, 0, 0, -1, 0.8, h, w, EM[1], EM[0], 0.8);
  } else if (look === "rose") { const r = p.r ?? 1.5;
    paint(c, ASH, "oklch(0.9 0.02 80)"); BX(c, -0.4, 0, -2.3, 0, 4.6, 2.3);
    roseX(c, 0.02, 2.3, 1, r, EM[0], EM[1], "oklch(0.86 0.02 80)", TORUS, !!p.tracery);
  } else if (look === "span") { const w = p.w ?? 1.2, h = p.h ?? 1.1;
    paint(c, PL, "oklch(0.95 0.04 195)"); BX(c, -1.5, 0, 0, 1.5, 2.6, 0.25);
    spanWindow(c, 0, 0.9, 0, -1, w, h, p.lit ?? true, lod, p.shut ?? null, o);
  } else { const w = p.w ?? 1.0, h = p.h ?? 1.7; const P = (u, y, oo) => [u, y, -oo];
    paint(c, ASH, "oklch(0.94 0.05 78)"); BX(c, -1.8, 0, 0, 1.8, 3.6, 0.3);
    castleWindow(c, P, 0, 0.9, w, h, lod, o);
  }
  c.albedo(null); c.color(null); c.emissive(null); c.metalness?.(null); c.roughness?.(null);
}
