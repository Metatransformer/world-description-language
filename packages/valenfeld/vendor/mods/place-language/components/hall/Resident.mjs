// hall kit · Resident
import { useHall, row, pos } from "./_shared.mjs";

// Resident({ id, npc, name, race, sex, at, y, yaw, pitch, still, act }): someone who lives or works here, at their post
// post: they return to this spot and facing (a petitioner in line); look: how they are drawn (hair, beard, outfit, colors, seed);
// role: an extra tag the town reads (guard)
export function Resident({ id, npc, name, race, sex, at, y, yaw = 0, pitch, still = false, scale, post = false, look, role, act = "Talk to", armed = false, why }) {
  const hall = useHall(), p = pos(hall, at, y);
  return row(id, { behavior: still ? [] : ["scripts/humanoid-locomotion.js"], feetPosition: p, id, physics: still ? "none" : "character",
    rotation: pitch != null ? { pitch, yaw } : { yaw }, ...(scale != null ? { scale } : {}),
    state: { act, eq: armed, name, npc, race, sex, ...(look ?? {}), ...(post ? { home: { x: p.x, yaw, z: p.z }, post: true } : {}) },
    tags: ["npc", "interactable", ...(role ? [role] : [])] }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "encounter",
  is: "a person who lives or works in this building (the guildmaster, the smith, a guard), standing where they belong and ready to talk",
  tags: ["npc", "person", "resident", "villager", "guildmaster", "guard", "talk", "townsfolk"],
  props: { id: "row id", npc: "the content/npc record id (their dialogue, shop, quests)", name: "shown name", race: "body race (human, korl, hessk, reshi, stoneborn)", sex: "m or f", at: "[x, z] m in the hall/wing", armed: "true: wears and carries their kit (eq), a captain or guard", y: "feet height m (default the floor)", yaw: "facing, degrees", pitch: "tilt, degrees (90 with still = lying down asleep)", still: "true: no walking body, no collider (a sleeper, a set pose)", scale: "body scale", post: "true: they return to this spot and facing after being moved (a petitioner in line)", look: "drawing state merged in (hair, beard, outfit, colors, seed)", role: "an extra tag the town reads (\"guard\")", act: "the E prompt verb (default \"Talk to\")", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1], height: 1.8 },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: [],
  pitfalls: ["npc must name a content/npc record or the talk has nothing to say", "still drops physics: a still resident can be walked through and never moves", "pitch without still tips a walking character over", "not a foe: hostile people are encounter foes in a dungeon kit"],
};

Resident.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
