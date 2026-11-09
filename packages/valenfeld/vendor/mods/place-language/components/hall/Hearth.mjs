// hall kit · Hearth
import { row, useHall, pos } from "./_shared.mjs";
import { FIRES } from "./fires.mjs";

// Hearth({ id, fire, at, y, crackle, gain, reach, why }): a fire burning in the room (fires.mjs by name) with its own crackle:
// the sound sits on the flame, spatial, fading out by `reach` metres. The stone or iron it burns in is the shell's or a Fixture's.
export function Hearth({ id, fire = "roundHearth", at = [0, 0], y, crackle = "cdn/sfx-crackling-hearth-fire-loop.mp3", gain = 0.35, reach = 16, why }) {
  const hall = useHall();
  if (!FIRES[fire]) throw new Error(`Hearth ${id}: no fire named ${fire}`);
  const spec = {
    ...(crackle ? { audio: { clip: crackle, gain, loop: true, maxDistance: reach, spatial: true } } : {}),
    feetPosition: pos(hall, at, y), fx: { script: FIRES[fire] }, id,
  };
  return row(id, spec, why);
}

export const meta = {
  layer: "light",
  is: "an open fire in a room, named from the fire library, with its crackle heard nearby: a firepit, a hearth, a brazier, a forge bed",
  tags: ["hearth", "fire", "firepit", "fireplace", "brazier", "crackle", "warmth", "light", "sound"],
  props: { id: "row id", fire: "a fires.mjs name (trenchFire, roundHearth, cottageHearth, keepFireplace, forge, candle…)", at: "[x, z] in the hall's metres", y: "height of the coals",
    crackle: "the loop it plays (null: silent)", gain: "loudness, 0.35 default", reach: "metres the crackle carries" },
  footprint: { kind: "point", cells: [1, 1], height: 1 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["hall/Shell flames (a fire riding the building)", "hall/Lamp"],
  pitfalls: ["the fire's own light comes from its program's glow pop; add a Lamp only for fill"],
};
Hearth.meta = meta;
