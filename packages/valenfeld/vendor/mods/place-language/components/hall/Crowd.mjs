// hall kit · Crowd
import { h, Fragment } from "../../lib/react.mjs";
import { nth } from "./_shared.mjs";
import { Patron } from "./Patron.mjs";
import { Resident } from "./Resident.mjs";

// Crowd({ prefix, from, npc, as, y, post, people }): a numbered set of ordinary folk sharing one record, each at their own spot
export function Crowd({ prefix, from = 1, npc, as = "patron", y, post, people = [] }) {
  const Body = as === "resident" ? Resident : Patron;
  return h(Fragment, null, people.map((p, i) => {
    const id = nth(prefix, from + i);
    return h(Body, { key: id, id, npc, y, ...(as === "resident" && post != null ? { post } : {}), ...p });
  }));
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "encounter",
  is: "a gathering of ordinary people with no story of their own (drinkers, travellers, petitioners in line), each in their own spot and pose",
  tags: ["crowd", "folk", "patrons", "guests", "petitioners", "people", "townsfolk", "drinkers"],
  props: { prefix: "id stem: people are <prefix>-<from>, -<from+1> …", from: "the first number (default 1)", npc: "the shared folk record (folk-traveler, folk-thief); a person may name their own", as: "patron (held in a pose at a table, default) | resident (a walking body)", y: "feet height m for all (default the room's floor)", post: "residents return to their spot and facing (a queue)", people: "[{ name, race, sex, at: [x, z], yaw, pose }, …]: one per person, in id order" },
  footprint: { kind: "area", cells: [4, 3] },
  topology: { under: ["Interior", "Room", "CommonRoom", "Cellar", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["seacave/Crew", "hall/Patron", "hall/Resident"],
  pitfalls: ["ids are by order: inserting a person mid-list renumbers everyone after (a save or quest that names one loses them); add at the end", "a person with a story (a quest giver, a fence) is a Resident of their own, not a crowd member", "pose belongs to patrons; residents walk"],
};

Crowd.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
