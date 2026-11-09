// wilds kit · Keep
import { row } from "./_shared.mjs";

// Keep({ id, spec, why }): a one-of-a-kind wilds row carried whole (a shrine, a campfire's fx)
export const Keep = ({ id, spec, why }) => row(id, spec, why, "hold");

// the card: what this component means, for picking and reasoning (contract: lib/meta.mjs)
export const meta = {
  layer: "dressing",
  is: "a one-of-a-kind thing out in the wilds kept exactly as it was built (a shrine, a campfire) because no word in the kit says it yet",
  tags: ["keep", "hold", "held", "authored", "one-off", "shrine", "campfire"],
  props: { id: "the row id (usually <wilds id>/<name>)", spec: "the whole scene row (usually from <region>.held.json)", why: "a note of why it stands here (shown in the design view)" },
  footprint: { kind: "point" },
  topology: { under: ["Wilds", "Site"], takes: [], joins: [], emits: ["row"] },
  twins: ["hall/Keep", "masonry/Hold", "mine/Kept", "seacave/Kept"],
  pitfalls: ["no parent is added: the spec must already say parent: <wilds id>", "a second Keep of the same idea (another campfire) means a component is missing"],
};

Keep.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
