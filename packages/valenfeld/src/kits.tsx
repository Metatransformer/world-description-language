import * as React from "react";
import { Group, type Vec3 } from "@generative-world-studio/core";
import { House, Well, MarketStall, Pine, Birch, Fern, Boulder } from "./library.js";
import type { SpawnPalette } from "./capture.js";

/** A biome composition with a clear central lane; variants are stable per instance. */
export function Woodland({ palette, at = [0, 0, 0], count = 8, seed = 1 }: { palette: SpawnPalette; at?: Vec3; count?: number; seed?: number }) {
  if (!Number.isInteger(count) || count < 0 || count > 100) throw new Error("Woodland count must be 0–100");
  return <Group key="woodland" name="Woodland kit" position={at}>
    {Array.from({ length: count }, (_, i) => {
      const x = (i % 2 ? 1 : -1) * (7 + ((seed + i * 7) % 4)), z = Math.floor(i / 2) * 10;
      const Tree = i % 3 ? Pine : Birch;
      return <Group key={"patch-" + i} position={[x, 0, z]}>
        <Tree key="tree" palette={palette} seed={seed + i} />
        <Fern key="fern" palette={palette} at={[2, 0, 2]} seed={seed + i} />
        {i % 3 === 0 && <Boulder key="rock" palette={palette} at={[-2, 0, 3]} scale={[0.4, 0.4, 0.4]} />}
      </Group>;
    })}
  </Group>;
}

/** A reusable architectural arrangement; callers can compose their own doors and state. */
export function Village({ palette, at = [0, 0, 0], homes = 4, seed = 1 }: { palette: SpawnPalette; at?: Vec3; homes?: number; seed?: number }) {
  if (!Number.isInteger(homes) || homes < 0 || homes > 40) throw new Error("Village homes must be 0–40");
  return <Group key="village" name="Village kit" position={at}>
    <Well key="well" palette={palette} />
    <MarketStall key="market" palette={palette} at={[7, 0, 0]} />
    {Array.from({ length: homes }, (_, i) => <House key={"home-" + i} palette={palette}
      at={[(i % 2 ? 1 : -1) * 16, 0, Math.floor(i / 2) * 14 - 12]}
      rotation={[0, i % 2 ? Math.PI / 2 : -Math.PI / 2, 0]} seed={seed + i}
      params={{ w: 6 + i % 3, d: 6, two: i % 3 !== 0 }} />)}
  </Group>;
}
