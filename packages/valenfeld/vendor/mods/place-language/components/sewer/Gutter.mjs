// sewer kit · Gutter
import { h } from "../../lib/react.mjs";

// ---- the dressing pass: sewer pieces ----------------------------------------------------------------------------------------
// Gutter({ at, along, width }): the slow black channel down a run, silt banks either side (along "x"|"z"; default the long axis)
export const Gutter = ({ at = (r) => r.center, along, width, meaning = "the old main drain's gutter" }) => h("place", { kind: "gutter", at, along, width, meaning });

// card: Gutter: the slow black channel down a run, silt banks either side.
export const meta = {
  "layer": "dressing",
  "is": "the slow black gutter of water running down the middle of a drain, silt banked either side",
  "tags": [
    "gutter",
    "channel",
    "water",
    "drain",
    "silt",
    "sewer",
    "stream"
  ],
  "props": {
    "at": "centre spot (default the room's centre)",
    "along": "x | z; default the room's long axis",
    "width": "gutter width, metres (1.2)",
    "meaning": "what this water is"
  },
  "footprint": {
    "kind": "line"
  },
  "topology": {
    "under": [
      "In",
      "Vault",
      "Tunnel",
      "Channel",
      "Cistern"
    ],
    "takes": [],
    "joins": [],
    "emits": [
      "prop"
    ]
  },
  "twins": [],
  "pitfalls": [
    "it runs the whole room minus 0.4 m: it does not turn corners or stop short",
    "a gutter wider than the room minus walkways swallows the floor",
    "a Tunnel/Channel already has a channel: do not add a Gutter on top"
  ]
};

Gutter.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
