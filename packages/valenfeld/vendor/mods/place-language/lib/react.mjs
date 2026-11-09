// Place React: the place language's core, literally React's model for worlds.
//   h(type, props, ...children)      an element. type = a component function, a host primitive name ("room", "prop"...), or Fragment
//   components                       (props) => element | element[] | null; props.children holds what was nested inside
//   key                              every element's key joins its parent's path; the path IS the entity id ("sewer/junction-2/grate");
//                                    key "@vf-gate-w" is absolute: a standing row keeps its id however deep the tree nests it
//   createContext / Provider / useContext   style, biome, level, seed flow down without prop drilling
//   useSeed / useRandom              deterministic randomness per path: a procedural layer rolls the same every compile
//   useSpot                          the parent's spot (a room rect, a wall, a point): children place themselves semantically
//   render(tree)                     → host rows: { id, type, props } in tree order, ids unique, a compile error on a clash
//   reconcile(rows, standing, hand)  → { add, update, remove, keep }: diffs against what stands; a row the hand layer moved keeps the hand's fields
// Hosts (what a primitive compiles to) are plugged in by the program's kind: lib/ddl.mjs for dungeons and interiors; a world plugs in its own.
// Creator, Nov 6: "react is actually literally what we should be building."

export const Fragment = Symbol("Fragment");
const ELEMENT = Symbol("PlaceElement");

export function h(type, props, ...children) {
  props = props ? { ...props } : {};
  const flat = children.flat(Infinity).filter((c) => c != null && c !== false && c !== true);
  if (flat.length) props.children = flat;
  return { $$: ELEMENT, type, key: props.key ?? null, props };
}
// JSX: the build's runtime (bun) may emit React-shaped elements ({ $$typeof, type, key, props }); they are read as ours
const REACT_FRAGMENT = Symbol.for("react.fragment");
function adopt(x) {
  if (!x || x.$$ === ELEMENT || !x.$$typeof) return x;
  const props = { ...(x.props ?? {}) };
  if (props.children !== undefined) props.children = [props.children].flat(Infinity).filter((c) => c != null && c !== false && c !== true);
  const type = x.type === REACT_FRAGMENT ? Fragment : x.type;
  return { $$: ELEMENT, type, key: x.key ?? props.key ?? null, props };
}
export const isElement = (x) => x && (x.$$ === ELEMENT || !!x.$$typeof);

// ---- context ---------------------------------------------------------------------------------------------
export function createContext(defaultValue, name = "context") {
  const ctx = { name, defaultValue };
  ctx.Provider = ({ value, children }) => h(Fragment, null, children);
  ctx.Provider.$context = ctx;
  return ctx;
}
let frame = null; // the render frame of the component being called: its path, the context stack, its spot
export function useContext(ctx) {
  for (let f = frame; f; f = f.parent) if (f.provides && f.provides.has(ctx)) return f.provides.get(ctx);
  return ctx.defaultValue;
}

// ---- deterministic randomness ----------------------------------------------------------------------------
function hash32(str) { let h = 2166136261 >>> 0; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; }
function mulberry(a) { return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export const SeedContext = createContext("world", "seed");
export function useSeed(salt = "") { return hash32(`${useContext(SeedContext)}|${frame?.path ?? ""}|${salt}`); }
export function useRandom(salt = "") {
  const next = mulberry(useSeed(salt));
  const r = () => next();
  r.range = (a, b) => a + (b - a) * next();
  r.int = (a, b) => Math.floor(a + (b - a + 1) * next());
  r.pick = (arr) => arr[Math.floor(next() * arr.length)];
  r.chance = (p) => next() < p;
  r.shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return r;
}

// ---- spots: semantic location flowing down the tree --------------------------------------------------------
export const SpotContext = createContext(null, "spot");
export function useSpot() { return useContext(SpotContext); }

// ---- render ----------------------------------------------------------------------------------------------
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const nameOf = (type) => (typeof type === "string" ? type : type === Fragment ? "" : slug(type.displayName || type.name || "c"));

export function render(tree, { root = "", hosts = null } = {}) {
  const rows = [], seen = new Map(), errors = [];
  function walk(node, parent, index) {
    if (node == null || node === false || node === true) return;
    if (Array.isArray(node)) { node.forEach((n, i) => walk(n, parent, i)); return; }
    node = adopt(node);
    if (!isElement(node)) { errors.push(`${parent.path}: a child is not an element (${typeof node})`); return; }
    const { type, props } = node;
    if (node.key != null && typeof node.key !== "string" && typeof node.key !== "number") errors.push(`${parent.path}: <${nameOf(type)}> was given an object as its key. key is the element's identity, never data: name that prop something else (opener, lock, item)`);
    const seg = node.key != null ? slug(node.key) : type === Fragment || type?.$context ? "" : `${nameOf(type)}${index ? "-" + index : ""}`;
    // a key "@<id>" is absolute: the row keeps the entity id it already has in the world, wherever the tree nests it
    const abs = typeof node.key === "string" && node.key.startsWith("@") ? node.key.slice(1) : null;
    const path = abs ?? (seg ? (parent.path ? `${parent.path}/${seg}` : seg) : parent.path);
    const f = { parent, path, provides: null };
    if (type?.$context) { f.provides = new Map([[type.$context, props.value]]); }
    if (typeof type === "string") {           // a host primitive: one row; its children nest under its id and see it as their spot
      if (seen.has(path)) errors.push(`${path}: two elements share this id; give one a key`);
      seen.set(path, true);
      const { children, key, ...rest } = props;
      const row = { id: path, type, props: rest, parent: parentHost(parent), via: viaOf(f) };   // via: the component chain that made it (trace reads it)
      rows.push(row);
      f.provides = new Map([[SpotContext, row]]);
      (children ?? []).forEach((c, i) => walk(c, f, i));
      return;
    }
    if (type === Fragment || type?.$context) { (props.children ?? []).forEach((c, i) => walk(c, f, i)); return; }
    if (typeof type !== "function") { errors.push(`${path}: unknown element type`); return; }
    f.comp = type.displayName || type.name || "anonymous";
    const prev = frame; frame = f;
    let out; try { out = type(props); } finally { frame = prev; }
    walk(out, f, 0);
  }
  function viaOf(f) { const out = []; for (; f; f = f.parent) if (f.comp) out.unshift(f.comp); return out; }
  function parentHost(f) { for (; f; f = f.parent) if (f.provides?.has(SpotContext)) return f.provides.get(SpotContext).id; return null; }
  walk(tree, { parent: null, path: root, provides: null }, 0);
  if (errors.length) throw new Error("place render failed:\n  " + errors.join("\n  "));
  return hosts ? rows.map((r) => (hosts[r.type] ? { ...r, out: hosts[r.type](r) } : r)) : rows;
}

// ---- reconcile: the compile diffs against what stands, React-style ---------------------------------------------
// standing: { id: row } as the world holds it now; hand: { id: { field: value } } the hand layer (moves made in-engine).
// A row whose id persists is updated in place, never destroyed and respawned; a hand-moved field wins over the program.
export function reconcile(rows, standing = {}, hand = {}) {
  const add = [], update = [], keep = [], remove = [];
  const next = new Set();
  for (const r of rows) {
    next.add(r.id);
    const merged = hand[r.id] ? { ...r, props: { ...r.props, ...hand[r.id] } } : r;
    const old = standing[r.id];
    if (!old) add.push(merged);
    else if (JSON.stringify(old.props ?? old) !== JSON.stringify(merged.props)) update.push(merged);
    else keep.push(merged);
  }
  for (const id of Object.keys(standing)) if (!next.has(id)) remove.push(id);
  return { add, update, keep, remove };
}

// ---- outline: the tree as the creator reads it on the design page --------------------------------------------
export function outline(tree, depth = 0, lines = []) {
  if (tree == null || tree === false) return lines;
  if (Array.isArray(tree)) { tree.forEach((t) => outline(t, depth, lines)); return lines; }
  if (!isElement(tree)) return lines;
  tree = adopt(tree);
  const { type, props } = tree;
  const label = type === Fragment ? null : type?.$context ? `<${type.$context.name}>` : typeof type === "string" ? type : `<${type.displayName || type.name}>`;
  if (label) {
    const shown = Object.entries(props).filter(([k, v]) => k !== "children" && (typeof v !== "object" || Array.isArray(v))).slice(0, 4).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(" ");
    lines.push(`${"  ".repeat(depth)}${label}${tree.key != null ? ` #${tree.key}` : ""}${shown ? " " + shown : ""}`);
  }
  (props.children ?? []).forEach((c) => outline(c, label ? depth + 1 : depth, lines));
  if (typeof type === "function" && !type.$context) {
    // components are listed by name with their nested children; their expansion is the render, shown by `expand`
  }
  return lines;
}
// the rendered depth: the outline of what the components expanded into, host rows nested by parent
export function expand(rows) {
  const kids = new Map(); for (const r of rows) { const p = r.parent ?? ""; if (!kids.has(p)) kids.set(p, []); kids.get(p).push(r); }
  const lines = []; const go = (p, d) => (kids.get(p) ?? []).forEach((r) => { lines.push(`${"  ".repeat(d)}${r.type} ${r.id}`); go(r.id, d + 1); });
  go("", 0); return lines;
}
// the component depth as it rendered: every row's `via` chain folded into one tree, each component with the rows it made.
// What a design page shows: <Valenfeld> › <Square> › <TownCore> › <Stall> · 6 rows, as deep as the program really nests.
export function componentTree(rows) {
  const root = { kids: new Map(), n: 0 };
  for (const r of rows) { let node = root; node.n++; for (const c of r.via ?? []) { if (!node.kids.has(c)) node.kids.set(c, { kids: new Map(), n: 0 }); node = node.kids.get(c); node.n++; } }
  const lines = []; const go = (node, d) => { for (const [name, k] of node.kids) { lines.push(`${"  ".repeat(d)}<${name}> · ${k.n} row${k.n === 1 ? "" : "s"}`); go(k, d + 1); } };
  go(root, 0); return lines;
}
