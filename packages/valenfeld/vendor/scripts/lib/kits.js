// The kit resolver: the one switch point for everything drawn from code. A kit id → its gen in the active set of its
// category (scripts/lib/data/kits.yml), base set as fallback. Callers never name scripts/gen/*.js.
import KITS from "./data/kits.json";

const BASE = KITS.sets.base;
export function kitDef(id) {
  const cat = BASE[id]?.category, set = KITS.sets[KITS.active?.[cat] ?? "base"] ?? BASE;
  const def = set[id] ?? BASE[id];
  if (!def) throw new Error(`no kit "${id}" in scripts/lib/data/kits.yml`);
  return def;
}
// the primitive a kit draws; params/seed are this placement's
export function kitPrimitive(id, params, seed) {
  const d = kitDef(id), p = { kind: "scripted", script: d.gen };
  if (params || d.params) p.params = { ...(d.params ?? {}), ...(params ?? {}) };
  if (seed != null) p.seed = seed;
  return p;
}
// a placement spec naming its kit: { template, primitive: { params, seed } }, merged over the kit's template
export const kitTemplate = (id) => `templates/kits.js#${id.replace(/-(\w)/g, (_, c) => c.toUpperCase())}`;
export function kit(id, params, seed) {
  const out = { template: kitTemplate(id) };
  if (params || seed != null) out.primitive = { ...(params ? { params } : {}), ...(seed != null ? { seed } : {}) };
  return out;
}
// is this primitive drawn by that kit (for scripts that read a body back)
export const isKit = (primitive, id) => !!primitive?.script && primitive.script === kitDef(id).gen;
