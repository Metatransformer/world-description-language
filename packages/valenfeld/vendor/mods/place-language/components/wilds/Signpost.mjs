// wilds kit · Signpost: the wayside post at a fork in the wood, its arrow boards lettered from words (things/boards.mjs)
import { piece } from "./_shared.mjs";
import { signBoards } from "../things/boards.mjs";

export const Signpost = ({ name = "signpost", at, yaw = 0, boards, title, look = "carved", why }) => {
  const words = boards.map((b) => b.word[0] + b.word.slice(1).toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()));
  return piece("signpost", name, { at, yaw, shade: false, tags: ["interactable"],
    state: { name: title ?? boards.map((b, i) => `${words[i]}, ${b.way}`).join(" · "), prompt: "Signpost", sign: true },
    extra: { children: signBoards(boards, look) }, why });
};

export const meta = {
  layer: "dressing",
  is: "a weathered signpost where wild paths fork: arrow boards lettered with where each way goes; a player can read it",
  tags: ["signpost", "sign", "wayside", "fork", "path", "direction", "read"],
  props: { name: "suffix: the row is <wilds id>/<name> (default signpost)", at: "[x, y, z] m in the Wilds root's frame", yaw: "facing, degrees", boards: "[{ id, word, way, x, y }]: each board's words, the way it points (east, west…), its spot on the post", title: "the read line (default: each board's word and way, in board order)", look: "lettering from things/boards.mjs BOARD_LOOKS (default carved)", why: "design note" },
  footprint: { kind: "point", cells: [1, 1], height: 2.6 },
  topology: { under: ["Wilds", "Site"], takes: [], joins: ["the paths it names"], emits: ["row"] },
  twins: ["things/Signpost", "town-kit Signpost (same boards, town frame)"],
  pitfalls: ["the read line is built from the boards' words and ways: name the way plainly (east, west)", "words are drawn as cut capitals in the carved look: write them as they should read"],
};
Signpost.meta = meta;
