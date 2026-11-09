import { z } from "zod";
import type { WorldManifest } from "./types.js";

export type Scalar = string | number | boolean;
export type Expr = Scalar | { read: string; store?: string } | { not: Expr };
export type ActionRef = { action: string; store?: string };
export type Step =
  | { op: "set"; field: string; value: Expr }
  | { op: "add"; field: string; value: number }
  | { op: "toggle"; field: string }
  | { op: "effect"; capability: string; args: Record<string, Expr>; success?: string; failure?: string };
export type Transition = { when?: Expr; steps: Step[] };
export type Store = { initial: Record<string, Scalar>; actions: Record<string, Transition>; persistenceKey?: string };
export type BehaviorDefinition = {
  version: 1; stores: Record<string, Store>;
  capabilities: Record<string, Record<string, "string" | "number" | "boolean">>;
};
export type ObjectBehavior = {
  scope?: Store; interact?: ActionRef; label?: string; solid?: boolean;
  bindings?: Record<string, Expr>;
};
export type BehaviorArtifact = BehaviorDefinition & {
  objects: Record<string, Omit<ObjectBehavior, "scope">>;
};

const scalar = z.union([z.string(), z.number().finite(), z.boolean()]);
const expr: z.ZodType<Expr> = z.lazy(() => z.union([
  scalar, z.object({ read: z.string(), store: z.string().optional() }).strict(),
  z.object({ not: expr }).strict(),
]));
const step = z.discriminatedUnion("op", [
  z.object({ op: z.literal("set"), field: z.string(), value: expr }).strict(),
  z.object({ op: z.literal("add"), field: z.string(), value: z.number().finite() }).strict(),
  z.object({ op: z.literal("toggle"), field: z.string() }).strict(),
  z.object({ op: z.literal("effect"), capability: z.string(), args: z.record(z.string(), expr), success: z.string().optional(), failure: z.string().optional() }).strict(),
]);
const storeSchema = z.object({
  initial: z.record(z.string(), scalar),
  actions: z.record(z.string(), z.object({ when: expr.optional(), steps: z.array(step) }).strict()),
  persistenceKey: z.string().min(1).optional(),
}).strict();
const definitionSchema = z.object({
  version: z.literal(1), stores: z.record(z.string(), storeSchema),
  capabilities: z.record(z.string(), z.record(z.string(), z.enum(["string", "number", "boolean"]))),
}).strict();
const objectSchema = z.object({
  scope: storeSchema.optional(),
  interact: z.object({ action: z.string(), store: z.string().optional() }).strict(),
}).partial();
const behaviorSchema = z.object({
  scope: storeSchema.optional(), interact: objectSchema.shape.interact,
  label: z.string().optional(), solid: z.boolean().optional(),
  bindings: z.partialRecord(z.enum(["visible", "solid"]), expr).optional(),
}).strict();

export function defineStore<S extends Record<string, Scalar>>(
  initial: S, actions: Record<string, { when?: Expr; steps: Array<
    | { op: "set"; field: keyof S & string; value: Expr }
    | { op: "add"; field: keyof S & string; value: number }
    | { op: "toggle"; field: keyof S & string }
    | Extract<Step, { op: "effect" }>
  > }>,
): Store { return { initial, actions }; }
export const local = (store: Store, persistenceKey?: string): Store => ({ ...store, persistenceKey });
export const read = (field: string, store = "$self"): Expr => ({ read: field, store });
export const not = (value: Expr): Expr => ({ not: value });
export const action = (name: string, store = "$self"): ActionRef => ({ action: name, store });

/** Resolve local references once at the compiler boundary; engines never inspect JSX paths. */
export function compileBehavior(manifest: WorldManifest): BehaviorArtifact {
  const definition = definitionSchema.parse(manifest.metadata.behavior ?? { version: 1, stores: {}, capabilities: {} });
  const stores: Record<string, Store> = structuredClone(definition.stores);
  const authored = new Map(manifest.objects.map(o => [o.id, behaviorSchema.parse(o.properties.wdl ?? {})]));
  const byId = new Map(manifest.objects.map(o => [o.id, o]));
  for (const [id, value] of authored) {
    if (value.scope) {
      if (Object.hasOwn(stores, id)) throw new Error("Duplicate store " + id);
      stores[id] = value.scope;
    }
  }
  const resolveStore = (name: string | undefined, self?: string) => {
    const id = !name || name === "$self" ? self : name;
    if (!id || !Object.hasOwn(stores, id)) throw new Error("Missing state scope " + (id ?? "$self"));
    return id;
  };
  const expression = (value: Expr, self?: string): Expr => {
    if (typeof value !== "object") return value;
    if ("not" in value) return { not: expression(value.not, self) };
    const id = resolveStore(value.store, self);
    if (!Object.hasOwn(stores[id]!.initial, value.read)) throw new Error("Unknown state field " + id + "." + value.read);
    return { read: value.read, store: id };
  };
  const typeOf = (value: Expr): string => typeof value !== "object" ? typeof value
    : "not" in value ? (typeOf(value.not) === "boolean" ? "boolean" : (() => { throw new Error("not requires boolean"); })())
    : typeof stores[value.store!]!.initial[value.read];
  const keys = new Set<string>();
  for (const [id, store] of Object.entries(stores)) {
    if (store.persistenceKey) {
      if (keys.has(store.persistenceKey)) throw new Error("Duplicate persistence key " + store.persistenceKey);
      keys.add(store.persistenceKey);
    }
    for (const transition of Object.values(store.actions)) {
      if (transition.when !== undefined) {
        transition.when = expression(transition.when, id);
        if (typeOf(transition.when) !== "boolean") throw new Error("Action condition must be boolean");
      }
      for (const item of transition.steps) {
        if (item.op === "effect") {
          const schema = definition.capabilities[item.capability];
          if (!schema) throw new Error("Unknown capability " + item.capability);
          if (Object.keys(schema).sort().join() !== Object.keys(item.args).sort().join()) throw new Error("Capability argument mismatch: " + item.capability);
          for (const [key, value] of Object.entries(item.args)) {
            item.args[key] = expression(value, id);
            if (typeOf(item.args[key]!) !== schema[key]) throw new Error("Capability argument type: " + key);
          }
          for (const target of [item.success, item.failure]) {
            if (target && !Object.hasOwn(store.actions, target)) throw new Error("Unknown effect completion action " + target);
          }
        } else {
          if (!Object.hasOwn(store.initial, item.field)) throw new Error("Unknown reducer field " + item.field);
          const required = typeof store.initial[item.field];
          if (item.op === "set") {
            item.value = expression(item.value, id);
            if (typeOf(item.value) !== required) throw new Error("Reducer field type: " + item.field);
          } else if (required !== (item.op === "toggle" ? "boolean" : "number")) throw new Error("Invalid reducer operation for " + item.field);
        }
      }
    }
  }
  const objects: BehaviorArtifact["objects"] = {};
  for (const [id, value] of authored) {
    let cursor: string | undefined = id;
    while (cursor && !authored.get(cursor)?.scope) cursor = byId.get(cursor)?.parentId;
    const { scope: _, ...resolved } = value;
    if (!byId.get(id)?.geometry && (resolved.solid !== undefined || resolved.bindings?.solid !== undefined))
      throw new Error("Solid bindings require mesh geometry: " + id);
    if (resolved.interact) {
      const store = resolveStore(resolved.interact.store, cursor);
      if (!Object.hasOwn(stores[store]!.actions, resolved.interact.action)) throw new Error("Unknown interaction action " + resolved.interact.action);
      resolved.interact = { ...resolved.interact, store };
    }
    if (resolved.bindings) {
      resolved.bindings = Object.fromEntries(Object.entries(resolved.bindings).map(([key, val]) => {
        const result = expression(val, cursor);
        if (typeOf(result) !== "boolean") throw new Error("Binding must be boolean: " + key);
        return [key, result];
      }));
    }
    objects[id] = resolved;
  }
  return { ...definition, stores, objects };
}
