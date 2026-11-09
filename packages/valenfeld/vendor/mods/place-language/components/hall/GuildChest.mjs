// hall kit · GuildChest
import { useHall, row, pos } from "./_shared.mjs";

// GuildChest({ id, guild, at, name, refuse, scale }): the members' chest; it opens for the guild's members, refuses the rest
export function GuildChest({ id, guild, at, y, yaw = 0, scale = 1.25, name = "Guild supplies (members)", refuse, why }) {
  const hall = useHall();
  return row(id, { overrides: { feetPosition: pos(hall, at, y), physics: "static", rotation: yaw, scale, "state.act": "Open", "state.guild": guild, "state.name": name,
    "state.refuse": refuse, tags: ["interactable"] }, template: `${hall.kits}#chest` }, why);
}

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "loot",
  is: "a guild's supply chest that opens for its members and refuses everyone else with a line of its own",
  tags: ["chest", "guild", "members", "supplies", "locked", "restock", "container"],
  props: { id: "row id", guild: "guild key that may open it (fighters, mages)", at: "[x, z] m", y: "height m (default the floor)", yaw: "facing, degrees", scale: "mesh scale (default 1.25)", name: "prompt name (default \"Guild supplies (members)\")", refuse: "what a non-member reads when it won't open", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point", cells: [1, 1] },
  topology: { under: ["Interior", "Wing"], takes: [], joins: [], emits: ["row"] },
  twins: ["wilds/Chest", "masonry/Cache", "seacave/Strongbox"],
  pitfalls: ["its contents restock from the guild's own list, not a table prop", "no refuse line = a silent no to outsiders", "it is not tagged container: thieving/lockpick paths that look for containers skip it"],
};

GuildChest.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
