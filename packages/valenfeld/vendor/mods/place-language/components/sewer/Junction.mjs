// sewer kit · Junction
import { h } from "../../lib/react.mjs";

// Junction({ hub, arms: [{ to, side, at, note }] }): where runs meet; each arm is a link off the hub.
export const Junction = ({ hub, arms }) => arms.map((a) => h("link", { key: `${hub}-${a.to}`, a: hub, b: a.to, side: a.side, at: a.at, ...(a.note ? { note: a.note } : {}) }));

// card: Junction: where several runs meet one hub; each arm is a link off it.
export const meta = {
  "layer": "relation",
  "is": "the place where several sewer runs meet, with one way off it to each",
  "tags": [
    "junction",
    "crossing",
    "hub",
    "link",
    "sewer",
    "branch",
    "meet"
  ],
  "props": {
    "hub": "id of the room the runs meet in",
    "arms": "[{ to, side, at, note }]: to = room id, side = hub wall n s e w, at = metres along it, note = what the way is"
  },
  "footprint": {
    "kind": "edge"
  },
  "topology": {
    "under": [
      "Drains",
      "Depth",
      "fragment"
    ],
    "takes": [],
    "joins": [
      "Channel",
      "Tunnel",
      "Space"
    ],
    "emits": [
      "link"
    ]
  },
  "twins": [
    "mine/Tunnel",
    "plan/Way"
  ],
  "pitfalls": [
    "every arm's `to` room must already exist and touch the hub wall at `at`, or the link has nowhere to open",
    "it adds only links: lock or gate an arm with Sluice/Barrier instead",
    "at is metres on the wall's axis (z for e/w walls, x for n/s), not a fraction"
  ]
};

Junction.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
