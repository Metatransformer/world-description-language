// plan kit · Arrival
import { h } from "../../lib/react.mjs";

// Arrival({ room, door, at, text }): the way in from the overworld and the first beat a player reads standing there.
export const Arrival = ({ room, door, place = "main", at = [0, 0.78], text, beat = "arrival", rows }) => [
  h("exit", { key: "exit", room, to: `+${place}#${door}`, at, ...(rows ? { rows } : {}) }),
  h("beat", { key: "beat", n: 1, beat, room, text }),
];

export const meta = {
  layer: "relation",
  is: "where you come in from the open world: the door back out, and the first thing you notice standing on the threshold",
  tags: ["arrival", "entry", "exit", "door", "mouth", "way out", "overworld", "beat", "hook"],
  props: {
    room: "the entry room's id (the parent room when nested)",
    door: "the overworld door's id it leads back to (e.g. ash-assize-door)",
    place: "the overworld place (default main)",
    at: "where the exit stands: [u, v] fractions across the room (default [0, 0.78]) or a Loc such as gate.wall(\"s\", \"middle\", 1.2)",
    text: "the arrival beat: what the player sees first",
    beat: "the first beat's kind (default arrival; a guarded door is threshold)",
    rows: "ids of hand rows that ARE the exit (a gate the exit rides), when it is not a bare door",
  },
  footprint: { kind: "point" },
  topology: { under: ["Plan", "Level", "Space", "In"], takes: [], joins: ["Space"], emits: ["exit", "beat"] },
  twins: ["mine/Adit", "wilds/Entrance", "hall/ExitDoor", "verbs/exit", "crypt/BoneStair"],
  pitfalls: [
    "one per place: a second Arrival overwrites the first exit",
    "door must name the overworld door's id, or the way out lands at the overworld's default spawn",
    "it is beat 1: number the program's other beats from 2",
  ],
};

Arrival.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
