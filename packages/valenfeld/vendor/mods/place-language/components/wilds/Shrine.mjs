// wilds kit · Shrine: a standing-stone shrine in the wood with one lit wick; touch it to wake what it holds
import { piece } from "./_shared.mjs";
import { FIRES } from "../hall/fires.mjs";

export const Shrine = ({ name = "shrine", at, yaw, title, prompt = "Touch", summon, candle = [0.18, 1.42, -0.42], fire = "shrineCandle", why }) =>
  piece("shrine", name, { at, yaw, shade: false, tags: ["interactable"],
    state: { name: title, prompt, ...(summon ? { summon } : {}) },
    extra: candle ? { children: [{ feetPosition: { x: candle[0], y: candle[1], z: candle[2] }, fx: { script: FIRES[fire] }, id: "candle-flame" }] } : {}, why });

export const meta = {
  layer: "landmark",
  is: "a mossy shrine of standing stones in the wilds, a candle burning on it; a player touches it, and a summon can raise a foe for a quest",
  tags: ["shrine", "stones", "candle", "landmark", "quest", "summon", "touch", "wayside"],
  props: { name: "suffix of its row (default shrine)", at: "[x, y, z] m in the Wilds root's frame", yaw: "facing, degrees", title: "what the player reads (e.g. Humming Stones)", prompt: "the verb (default Touch)", summon: "{ flag, quest, slot, say, idle }: the quest foe it raises", candle: "[x, y, z] of the wick on the stones, or null", fire: "hall/fires name (default shrineCandle)", why: "design note" },
  footprint: { kind: "point", cells: [2, 2], height: 2 },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: ["things/Shrine", "things/Wayshrine"],
  pitfalls: ["a summon's slot must exist in the encounter roster"],
};
Shrine.meta = meta;
