// wilds kit · Site
import { h } from "../../lib/react.mjs";
import { useWilds } from "./_shared.mjs";
import { WildsContext } from "./WildsContext.mjs";

// Site({ id }): a named place in the wilds (content/site/<id>.yml); what stands in it is its children
// Site({ id, at }): with `at`, every piece inside is written in the site's own metres from that point (its origin)
export function Site({ id, at, children }) { const w = useWilds(); return h(WildsContext.Provider, { value: { ...w, site: id, ...(at ? { origin: w.origin ? [at[0] + w.origin[0], at[1] + w.origin[1], at[2] + w.origin[2]] : at } : {}) } }, children); }

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "meaning",
  is: "a named spot in the wilds a player would point to (the ruined watchtower, the bandit camp, the wolf dens), made of the pieces gathered inside it",
  tags: ["site", "poi", "landmark", "place", "camp", "ruin", "location", "group"],
  props: { id: "the content/site record id it stands for", at: "optional [x, y, z] origin in the Wilds frame: pieces inside are then written in the site's own metres", children: "the pieces that make the place" },
  footprint: { kind: "area" },
  topology: { under: ["Wilds"], takes: ["Rock", "Log", "Den", "Tower", "Chest", "Lamp", "CampProp", "Tent", "Palisade", "Entrance", "Keep"], joins: [], emits: [] },
  twins: ["hall/Wing", "plan/In"],
  pitfalls: ["it adds no row and no offset: children still place in the Wilds root's metres", "id must match a content/site record or the map and quests can't find it", "its position is read from its children: an empty Site stands nowhere"],
};

Site.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
