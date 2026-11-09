// cave kit · Hollow
import { h } from "../../lib/react.mjs";
import { Space } from "../plan/index.mjs";
import { NaturalRoom } from "../common/NaturalRoom.mjs";

// Hollow({ id, rect, name, kind, floor, height, purpose, sightline, from, how, side, at, bat, oneway, lock }): a room the water cut
// a hollow is natural ground unless it says built: rough mounds clear of every door and the walking line (natural={false} opts out)
export const Hollow = (p) => NaturalRoom({ ...p, style: "cave", mound: 0.35 });

export const meta = {
  layer: "space",
  is: "a natural cave room the water cut, with rough rock mounds on its floor that keep clear of doors and the walking line",
  tags: ["cave", "room", "hollow", "chamber", "natural", "rock", "cavern"],
  props: { id: "room id", rect: "[x, z, w, d] cells (2 m)", name: "shown name", kind: "entry | hall | cavern | chamber ...", floor: "floor y metres (defaults to its Shelf)", height: "ceiling height metres", purpose: "what the room is for", sightline: "what the player sees on entering", from: "room it opens off", how: "the way in: ramp | tunnel | crawl | climb | drop ...", side: "n|s|e|w wall of `from` the way leaves by", at: "cell along that wall", bat: "cell along this room's wall where the way lands", oneway: "the way in cannot be walked back", lock: "lock id barring the way in", natural: "false = a built room with no mounds", bumps: "rock mounds on the floor (3)", level: "level number override" },
  footprint: { kind: "room", cells: [6, 6], height: 5 },
  topology: { under: ["Shelf"], takes: [], joins: ["Hollow", "Lair", "Passage", "Rockfall", "OneWayGate"], emits: ["room", "link", "natural"] },
  twins: ["common/NaturalRoom", "plan/Space", "seacave/Grotto", "mine/NaturalCavern", "crypt/Burial", "masonry/Chamber"],
  pitfalls: ["no from= and no Passage/Rockfall into it = an unreachable room", "side/at must name a cell on from's wall that faces this rect, or the link runs through rock", "its JSX children do NOT stand in it: dress a hollow with a sibling <In room={id}> (Fungus, Beasts... as children of a Hollow fail with \"give in:\")", "a room under ~3x3 cells with bumps fills with mounds; pass bumps={0} or natural={false}"],
};

Hollow.meta = meta;   // the card rides the component: layouts read its footprint (room or point)
