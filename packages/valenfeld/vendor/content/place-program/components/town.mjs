// TOWN: the Place Language's town vocabulary. Each verb is a part harvested from rows that stand (town-kit.mjs: the BASE every
// standing member shares, the props that differ) or a composite of them. A town tree renders <row> hosts; stand() owns them.
//   <TownData.Provider value={{ LOC, ROWS, DISTRICTS }}>   the town's location data: anchors, every row by id, rows by district
//   <District name>      one district: its rows, each by its part; a door nests under the building it opens, a leaf under its door
//   <TownWall> <Square> <GuildClose> <HammerLane> <KeepApproach> <BuryingGround> <LanternQuarter> <EastFields> <Roads> <Streets>
//   <Piece id>           one standing row through its part (or <Hold> carried whole, with why)
import { h, Fragment, createContext, useContext } from "../../../tools/place/react.mjs";
import * as K from "./town-kit.mjs";
export { TownContext, LocContext, Hold, part, spotOf } from "./town-kit.mjs";
export const TownData = createContext(null, "town-data");

// the named parts (harvested name → the language's word)
export const WallCurtain = K.Curtain, Tower = K.Tower, Gate = K.Gate, GateTowerDoor = K.DoorDoor, Door = K.Door, DoorLeaf = K.DoorLeaf;
export const Casemate = K.Casemate, CasemateLight = K.CasemateLight, Lamp = K.Lamp, Sign = K.Sign, Signpost = K.Signpost, Milestone = K.Milestone;
export const Mound = K.Mound, Gravestone = K.Gravestone, Washline = K.Wash, Dress = K.Dress, Hedge = K.Hedge, Flowerbed = K.Flowerbed;
export const SquareProp = K.SquareProp, YardFence = K.YardFence, Pigeon = K.Pigeon, StreetProp = K.Crate, FarmPart = K.FarmKit, FarmProp = K.FarmKitProp;
export const Horse = K.FarmKitHorse, FarmHouse = K.FarmKitHouse, FarmDoor = K.FarmKitPlain, Lowfield = K.Lowfield;
const PART = { Curtain: WallCurtain, DoorDoor: GateTowerDoor, Wash: Washline, Crate: StreetProp, FarmKit: FarmPart, FarmKitProp: FarmProp,
  FarmKitHorse: Horse, FarmKitHouse: FarmHouse, FarmKitPlain: FarmDoor };
const partOf = (name) => PART[name] ?? K[name];

// why a row is held whole: it has no second standing row of its shape to harvest a part from
export const HOLD_WHY = "one of a kind: no second standing row shares its template and shape, so there is no part to harvest yet";

export function Piece({ id }) {
  const { ROWS } = useContext(TownData), r = ROWS[id];
  if (!r) throw new Error(`Piece: no standing row ${id}`);
  const kids = (r.kids ?? []).map((k) => h(Piece, { id: k, key: k }));
  if (r.part === "Hold") return h(K.Hold, { id, spec: r.spec, why: HOLD_WHY }, ...kids);
  const { part, kids: _k, in: _i, ...props } = r;
  return h(partOf(part), props, ...kids);
}
// District: every row of one district, grouped by the parts named first (in that order), the rest after
export function District({ name, parts = [], drop = null, children }) {   // drop: a pattern of row ids a component now lays
  const { ROWS, DISTRICTS } = useContext(TownData), ids = (DISTRICTS[name] ?? []).filter((i) => !drop?.test(i));
  const groups = parts.map((p) => ids.filter((i) => ROWS[i].part === p));
  const rest = ids.filter((i) => !parts.includes(ROWS[i].part));
  return h(Fragment, null, ...groups.map((g, n) => h(Fragment, { key: parts[n] }, ...g.map((i) => h(Piece, { id: i, key: i })))),
    ...rest.map((i) => h(Piece, { id: i, key: i })), ...(children ?? []));
}
export const TownWall = ({ children }) => h(District, { name: "wall", parts: ["Curtain", "Tower", "Gate", "Casemate"] }, ...(children ?? []));

// CrateRun: crates and barrels set down in a line from `start` to `end` (local metres off the `from` anchor), evenly spaced;
// an id written right after another at the same spot in the source rows sits on top of it. The row keeps what it IS
// (barrel or crate, its loot, its turn); the run decides WHERE. <CrateRun from="square" start={[-9.35,-14.7]} end={[-9.4,-12.1]} ids={[…]} />
export function CrateRun({ from, start, end, ids, lift = 0.7 }) {
  const { ROWS } = useContext(TownData), r2 = (v) => Math.round(v * 100) / 100, base = [];
  for (const id of ids) { const r = ROWS[id], prev = base.at(-1), at = r.at, p = prev && ROWS[prev.ids[0]].at;
    if (prev && Math.hypot(p.dx - at.dx, p.dz - at.dz) < 0.05) prev.ids.push(id); else base.push({ ids: [id] }); }
  const n = base.length, out = [];
  base.forEach((b, k) => { const t = n > 1 ? k / (n - 1) : 0, dx = r2(start[0] + (end[0] - start[0]) * t), dz = r2(start[1] + (end[1] - start[1]) * t);
    b.ids.forEach((id, up) => { const r = ROWS[id], y = typeof r.at.y === "number" ? r.at.y : r.at.y;
      const { part, ...row } = r; out.push(h(K.Crate, { ...row, key: id, at: { from, dx, dz, y: up && typeof ROWS[b.ids[0]].at.y === "number" ? ROWS[b.ids[0]].at.y + lift * up : y } })); }); });
  return h(Fragment, null, ...out);
}
const SQUARE_CRATES = /^vf-scatter-\d+$/;   // the hand rows CrateRun replaced (Nov 8)
const CRATE_RUNS = [{"start": [-9.35, -14.7], "end": [-9.35, -12.07], "ids": ["vf-scatter-1", "vf-scatter-2", "vf-scatter-3", "vf-scatter-4"]}, {"start": [-14.4, -9.5], "end": [-13.6, -9.6], "ids": ["vf-scatter-5", "vf-scatter-6", "vf-scatter-7"]}, {"start": [-21.7, -9.5], "end": [-22.5, -9.6], "ids": ["vf-scatter-8", "vf-scatter-9"]}, {"start": [-20.76, -11.77], "end": [-20.76, -11.77], "ids": ["vf-scatter-10"]}, {"start": [-10.88, 11.79], "end": [-10.34, 13.42], "ids": ["vf-scatter-11", "vf-scatter-12", "vf-scatter-13"]}, {"start": [-8.92, 15.66], "end": [-8.92, 15.66], "ids": ["vf-scatter-14"]}, {"start": [15.87, -9.69], "end": [14.38, -10.54], "ids": ["vf-scatter-15", "vf-scatter-16", "vf-scatter-17", "vf-scatter-18"]}, {"start": [11.85, -11.24], "end": [11.85, -11.24], "ids": ["vf-scatter-19"]}, {"start": [13.6, 21.52], "end": [12.08, 19.65], "ids": ["vf-scatter-20", "vf-scatter-21", "vf-scatter-22", "vf-scatter-23"]}, {"start": [17.32, 10.16], "end": [19.84, 10.65], "ids": ["vf-scatter-24", "vf-scatter-25", "vf-scatter-26", "vf-scatter-27", "vf-scatter-28"]}, {"start": [28.23, 25.7], "end": [27.48, 25.4], "ids": ["vf-scatter-29", "vf-scatter-30"]}, {"start": [7.95, -29.77], "end": [7.39, -28.13], "ids": ["vf-scatter-31", "vf-scatter-32", "vf-scatter-33", "vf-scatter-34"]}, {"start": [19.16, -30.45], "end": [19.16, -30.45], "ids": ["vf-scatter-35", "vf-scatter-36"]}, {"start": [24.53, -19.6], "end": [25.15, -21.19], "ids": ["vf-scatter-37", "vf-scatter-38", "vf-scatter-39"]}, {"start": [25.46, -23.8], "end": [25.46, -23.8], "ids": ["vf-scatter-40"]}, {"start": [-42.97, -17.09], "end": [-42.12, -19.35], "ids": ["vf-scatter-41", "vf-scatter-42", "vf-scatter-43", "vf-scatter-44", "vf-scatter-45"]}, {"start": [-33.31, -13.78], "end": [-30.78, -13.41], "ids": ["vf-scatter-46", "vf-scatter-47", "vf-scatter-48", "vf-scatter-49", "vf-scatter-50", "vf-scatter-51"]}, {"start": [30.13, 5.87], "end": [32.38, 6.79], "ids": ["vf-scatter-52", "vf-scatter-53", "vf-scatter-54", "vf-scatter-55"]}, {"start": [27.17, -7.71], "end": [26.84, -10.41], "ids": ["vf-scatter-56", "vf-scatter-57", "vf-scatter-58", "vf-scatter-59", "vf-scatter-60"]}, {"start": [28.49, 28.34], "end": [28.43, 26.59], "ids": ["vf-scatter-61", "vf-scatter-62", "vf-scatter-63"]}, {"start": [11.41, 28.38], "end": [13.86, 27.73], "ids": ["vf-scatter-64", "vf-scatter-65", "vf-scatter-66", "vf-scatter-67"]}, {"start": [15.69, 26.57], "end": [15.69, 26.57], "ids": ["vf-scatter-68"]}];
export const Square = ({ children }) => h(District, { name: "square", parts: ["Pigeon", "Flowerbed", "YardFence", "Crate"], drop: SQUARE_CRATES },
  ...CRATE_RUNS.map((c, i) => h(CrateRun, { key: i, from: "square", ...c })), ...(children ?? []));
export const GuildClose = ({ children }) => h(District, { name: "guildclose" }, ...(children ?? []));
export const HammerLane = ({ children }) => h(District, { name: "hammer" }, ...(children ?? []));
export const KeepApproach = ({ children }) => h(District, { name: "keep", parts: ["Lamp"] }, ...(children ?? []));

// GravePlots: a burying ground's plots as rows and columns, each plot a headstone with its grassed mound before it.
// Laid by the grid, never by hand: rows run east along +x, the mound sits `mound` m south of its stone; `skip` leaves a lane
// ([[row, col], …]); `stagger` shifts every odd row; `jitter` and the tilt are seeded off the id, so one grid never repeats
// another. Stones and mounds ride the ground (y from the terrain), so a slope tilts nothing out of the earth.
// <GravePlots id="yard" from="burying" at={[-15.3, -2]} rows={3} cols={6} pitch={[3.4, 3.2]} skip={[[2, 2], [2, 3]]} />
export function GravePlots({ id = "plots", from, at = [0, 0], rows = 3, cols = 6, pitch = [3.4, 3.2], stagger = 1.2, jitter = 0.45, mound = 1.1, skip = [], tilt = 5 }) {
  const hsh = (k) => { let x = 2166136261; for (const ch of `${id}/${k}`) { x ^= ch.charCodeAt(0); x = Math.imul(x, 16777619); } return ((x >>> 0) % 100000) / 100000; };
  const sk = new Set(skip.map(([r, c]) => `${r}-${c}`)), out = [], r3 = (v) => Math.round(v * 1000) / 1000;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = `${r}-${c}`; if (sk.has(k)) continue;
    const dx = r3(at[0] + c * pitch[0] + (r % 2) * stagger + (hsh(k + "x") - 0.5) * 2 * jitter), dz = r3(at[1] + r * pitch[1]);
    out.push(h(Gravestone, { key: `s${k}`, id: `${id}-stone-${k}`, at: { from, dx, dz, y: { terrain: 0 } },
      material: { color: `oklch(${r3(0.5 + hsh(k + "l") * 0.1)} 0.015 ${r3(80 + hsh(k + "h") * 40)})`, metalness: 0, roughness: 0.95 },
      primitive: { kind: "box", width: r3(0.5 + hsh(k + "w") * 0.2), height: r3(0.8 + hsh(k + "t") * 0.3), depth: 0.16 },
      face: { pitch: r3((hsh(k + "p") - 0.5) * 2 * tilt), roll: r3((hsh(k + "r") - 0.5) * 2 * tilt), yaw: r3((hsh(k + "y") - 0.5) * 2 * tilt * 1.3) } }));
    out.push(h(Mound, { key: `m${k}`, id: `${id}-mound-${k}`, at: { from, dx, dz: r3(dz + mound), y: { terrain: -0.1 } },
      material: { color: "oklch(0.42 0.06 130)", roughness: 1 }, primitive: { kind: "capsule", radius: 0.45, halfHeight: 0.6 }, size: { x: 1, y: 0.45, z: 1 } }));
  }
  return h(Fragment, null, ...out);
}
const YARD = /^yard-(stone|mound)-\d+-\d+$/;   // the hand rows GravePlots replaced (Nov 8)
export const BuryingGround = ({ children }) => h(District, { name: "burying", parts: ["Mound", "Gravestone"], drop: YARD },
  h(GravePlots, { id: "yard", from: "burying", at: [-15.3, -2], rows: 3, cols: 6, pitch: [3.4, 3.2], skip: [[2, 2], [2, 3], [1, 4], [2, 4]] }), ...(children ?? []));
// WashLine: a washing line strung between two posts. `a` and `b` are the posts' feet [dx, dz, y] off the `from` anchor,
// `top` the height the rope is tied at; the rope sags `sag` m at its middle and the laundry hangs from it, evenly spaced, top edge on the rope (a plane's feet are its centre).
// ids: <id> rope, <id>-a / <id>-b posts, <id>-c1… cloths. <WashLine id="lq-wash1" from="lantern" a={[-4, 3.2, 4.03]} b={[0.5, 3.4, 4.59]} top={7.04} />
const CLOTHS = [["oklch(0.5 0.05 140)", 0.76, 0.9], ["oklch(0.85 0.02 90)", 0.64, 0.7], ["oklch(0.6 0.08 30)", 0.52, 0.5], ["oklch(0.55 0.06 250)", 0.4, 0.9], ["oklch(0.75 0.06 80)", 0.76, 0.7]];
export function WashLine({ id, from, a, b, top, sag = 0.18, cloths = CLOTHS }) {
  const r2 = (v) => Math.round(v * 1000) / 1000, len = Math.hypot(b[0] - a[0], b[1] - a[1]), yaw = Math.atan2(b[0] - a[0], b[1] - a[1]) * 180 / Math.PI;
  const at = (t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], ropeY = (t) => top - sag * 4 * t * (1 - t);
  const post = (k, p) => h(K.Wash, { key: k, id: `${id}-${k}`, castShadow: true, at: { from, dx: p[0], dz: p[1], y: p[2] }, material: { color: "oklch(0.38 0.05 55)" }, physics: "static", primitive: { kind: "cylinder", height: r2(top + 0.05 - p[2]), radiusBottom: 0.08, radiusTop: 0.06 } });
  const mid = at(0.5), out = [post("a", a), post("b", b),
    h(K.Wash, { key: "rope", id, at: { from, dx: r2(mid[0]), dz: r2(mid[1]), y: r2(ropeY(0.5) + sag / 3 - len / 2) }, material: { color: "oklch(0.7 0.03 80)" }, pivot: "center", primitive: { kind: "cylinder", height: r2(len), radiusBottom: 0.012, radiusTop: 0.012 }, face: { pitch: 90, yaw } })];
  cloths.forEach(([color, w, ht], i) => { const t = (i + 1) / (cloths.length + 1), p = at(t);
    out.push(h(K.Wash, { key: "c" + i, id: `${id}-c${i + 1}`, castShadow: true, at: { from, dx: r2(p[0]), dz: r2(p[1]), y: r2(ropeY(t) - ht / 2) }, material: { color, roughness: 1, side: "double" }, primitive: { kind: "plane", width: w, height: ht }, face: { yaw: yaw + 90 } })); });
  return h(Fragment, null, ...out);
}
export const LanternQuarter = ({ children }) => h(District, { name: "lantern", parts: ["Wash"], drop: /^lq-wash[12](-|$)/ },
  h(WashLine, { id: "lq-wash1", from: "lantern", a: [-4, 3.2, 4.03], b: [0.5, 3.4, 4.59], top: 7.04 }),
  h(WashLine, { id: "lq-wash2", from: "lantern", a: [7, 3, 4.75], b: [11.5, 3.6, 5.42], top: 7.87 }), ...(children ?? []));

// HedgeRow: a field hedge drawn as a line: bushes every `step` m along `points` (local metres from the `from` anchor),
// seed, size and turn cycling so no two neighbours match; `first` starts the count past a gap (a field gate).
// <HedgeRow id="ef-hedge-s1" from="fields" points={[[7.3, -23], [33.5, -15.4], [48.4, -4.2], [63.3, -1.5]]} count={37} />
export function HedgeRow({ id, from, points, step = 1.7, count, first = 0, sink = -0.15, sizes = [0.85, 1.08, 1.01, 0.94] }) {
  const legs = []; let total = 0;
  for (let i = 1; i < points.length; i++) { const [ax, az] = points[i - 1], [bx, bz] = points[i], L = Math.hypot(bx - ax, bz - az); legs.push({ ax, az, bx, bz, L, s: total }); total += L; }
  const n = count ?? Math.floor(total / step) + 1, at = (d) => { const g = legs.find((l) => d <= l.s + l.L) ?? legs.at(-1), t = Math.min(1, (d - g.s) / g.L); return [g.ax + (g.bx - g.ax) * t, g.az + (g.bz - g.az) * t]; };
  const out = [], r2 = (v) => Math.round(v * 100) / 100;
  for (let i = first; i < n; i++) { const [dx, dz] = at(Math.min(total, i * step));
    out.push(h(Hedge, { key: i, id: `${id}-b${i}`, at: { from, dx: r2(dx), dz: r2(dz), y: { terrain: sink } }, primitive: { kind: "scripted", script: "scripts/gen/hedgebush.js", params: { seed: 4 - (i % 4) } }, face: { yaw: (i * 137) % 360 }, size: sizes[i % sizes.length] })); }
  return h(Fragment, null, ...out);
}
const FIELD_HEDGE = /^ef-hedge-(n1|n1b|s1)-b\d+$/;   // the hand rows HedgeRow replaced (Nov 8)
export const EastFields = ({ children }) => h(District, { name: "fields", parts: ["Hedge", "FarmKitHouse", "FarmKit", "FarmKitProp", "FarmKitHorse", "Lowfield"], drop: FIELD_HEDGE },
  h(HedgeRow, { id: "ef-hedge-n1", from: "fields", points: [[-4.76, -2.96], [8.35, -10.85], [14.78, -9.04]], count: 14 }),
  h(HedgeRow, { id: "ef-hedge-n1b", from: "fields", points: [[19.9, -7.38], [27.98, -4.73], [44.41, 7.33]], count: 18, first: 1 }),
  h(HedgeRow, { id: "ef-hedge-s1", from: "fields", points: [[7.32, -22.96], [33.46, -15.44], [48.41, -4.22], [63.34, -1.54]], count: 37 }), ...(children ?? []));
export const Roads = ({ children }) => h(District, { name: "roads", parts: ["Signpost", "Sign", "Milestone"] }, ...(children ?? []));
export const Streets = ({ children }) => h(District, { name: "streets", parts: ["Door", "Dress"] }, ...(children ?? []));

// TownCore: the town's root (kits#townWall, held whole: one of a kind) and the props that ride it, plus its life director.
// <TownCore core watch dress> renders the root, then each dress prop as <SquareProp in={root id}> nested under it.
export const CORE_WHY = "the town root: kits#townWall with its own wall ring, torches and houses as inline children; one of a kind";
export const WATCH_WHY = "the town-life director (scripts/townsfolk.js), an invisible manager row below ground; not a built thing";
export function TownCore({ core, watch, dress, id = "town" }) {
  return h(Fragment, null,
    h(K.Hold, { id, spec: core, why: CORE_WHY, key: id }, ...Object.values(dress).map(({ id: d, ...p }) => h(SquareProp, { id: d, key: d, in: id, ...p }))),
    h(K.Hold, { id: id + "-watch", spec: watch, why: WATCH_WHY, key: id + "-watch" }));
}

// BackYard: the lived-in ground behind a house: a washing line (WashLine) strung across it, a hedge (HedgeRow) closing its
// far edge and, when `pile` is given, a barrel with a crate beside it at the corner (searchable, like every container).
// Composed from the shared verbs, nothing new placed by hand. ids: <id>-wash…, <id>-hedge-b…, <id>-barrel / <id>-crate.
// <BackYard id="yard-h2" from="streets" wash={{ a: [-34.6, 16.2, 4.14], b: [-29.4, 16.2, 4] }} hedge={[[-36.5, 19.5], [-27.5, 19.5]]} pile={[-27.9, 14.2, 4]} />
const yardBin = (id, from, kind, p, yaw) => h(K.Crate, { key: kind, id, at: { from, dx: p[0], dz: p[1], y: p[2] },
  primitive: { kind: "scripted", script: "scripts/gen/prop.js", params: { kind } }, face: { yaw },
  state: { container: { kind, level: 1, tier: 1 }, gold: 0, items: {}, name: kind === "barrel" ? "Barrel" : "Crate", prompt: "Search" },
  tags: ["lookable", "interactable", "container"] });
export function BackYard({ id, from, wash, hedge, pile = null, tall = 2.1 }) {
  const top = Math.round((Math.max(wash.a[2], wash.b[2]) + tall) * 100) / 100, out = [
    h(WashLine, { key: "w", id: `${id}-wash`, from, a: wash.a, b: wash.b, top }),
    h(HedgeRow, { key: "h", id: `${id}-hedge`, from, points: hedge, step: 1.6 })];
  if (pile) { const [x, z, y] = pile; out.push(yardBin(`${id}-barrel`, from, "barrel", [x, z, y], 20), yardBin(`${id}-crate`, from, "crate", [x + 0.9, z + 0.2, y], 75)); }
  return h(Fragment, null, ...out);
}
// Valenfeld's yards, one row a house (feet read off the ground as it stands). Houses 1 and 6 back onto the square's crates
// and the mages' hall, 3 and 4 onto the kingsway and the aurenmar road, so they keep none; 7 skips the pile (a steep bank).
const YARDS = [
  { id: "yard-h2", wash: { a: [-34.6, 16.2, 4.14], b: [-29.4, 16.2, 4] }, hedge: [[-36.5, 19.5], [-27.5, 19.5]], pile: [-27.9, 14.2, 4] },
  { id: "yard-h5", wash: { a: [27.4, 16.2, 4], b: [32.6, 16.2, 4.03] }, hedge: [[25.5, 19.5], [34.5, 19.5]], pile: [34.1, 14.2, 4.04] },
  { id: "yard-h7", wash: { a: [29.9, 33.2, 4.52], b: [33.2, 33.2, 5.4] }, hedge: [[28, 36.5], [36, 36.5]] },
  { id: "yard-h8", wash: { a: [11.4, 36.7, 4.74], b: [16.6, 36.7, 4.92] }, hedge: [[9.5, 40], [18.5, 40]], pile: [18.1, 34.7, 4.92] },
];
export const Yards = () => h(Fragment, null, ...YARDS.map((y) => h(BackYard, { key: y.id, from: "streets", ...y })));
