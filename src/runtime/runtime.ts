import type { ActionRef, BehaviorArtifact, Expr, Scalar } from "./contract.js";

export type Capability = (args: Record<string, Scalar>) => Promise<void> | void;
export type Snapshot = { version: 1; instance: string; stores: Record<string, Record<string, Scalar>> };

/** Engine-independent execution. Engine APIs enter only through capability registrations. */
export class WorldRuntime {
  private state: Record<string, Record<string, Scalar>>;
  private pending = new Set<string>();
  onChange: () => void = () => {};
  constructor(readonly contract: BehaviorArtifact, private capabilities: Record<string, Capability>, readonly instance = "world") {
    for (const name of Object.keys(contract.capabilities)) {
      if (typeof capabilities[name] !== "function") throw new Error("Missing capability: " + name);
    }
    this.state = Object.fromEntries(Object.entries(contract.stores).map(([id, store]) => [id, structuredClone(store.initial)]));
  }
  evaluate(expr: Expr): Scalar {
    if (typeof expr !== "object") return expr;
    if ("not" in expr) return !this.evaluate(expr.not);
    return this.state[expr.store!]![expr.read]!;
  }
  binding(id: string, name: string): Scalar | undefined {
    const value = this.contract.objects[id]?.bindings?.[name];
    return value === undefined ? undefined : this.evaluate(value);
  }
  interact(id: string): Promise<void> {
    const ref = this.contract.objects[id]?.interact;
    return ref ? this.dispatch(ref) : Promise.resolve();
  }
  async dispatch(ref: ActionRef, depth = 0): Promise<void> {
    if (depth > 32) throw new Error("Effect completion cycle");
    const id = ref.store!;
    const transition = this.contract.stores[id]?.actions[ref.action];
    if (!transition) throw new Error("Unknown action " + id + "." + ref.action);
    if ((depth === 0 && this.pending.has(id)) || (transition.when !== undefined && !this.evaluate(transition.when))) return;
    const next = { ...this.state[id] };
    const effects: Array<{ step: Extract<typeof transition.steps[number], { op: "effect" }>; args: Record<string, Scalar> }> = [];
    // Commit reducer updates atomically before invoking external code.
    for (const step of transition.steps) {
      if (step.op === "set") next[step.field] = this.evaluate(step.value);
      else if (step.op === "toggle") next[step.field] = !next[step.field];
      else if (step.op === "add") {
        const value = Number(next[step.field]) + step.value;
        if (!Number.isFinite(value)) throw new Error("Non-finite state");
        next[step.field] = value;
      } else effects.push({ step, args: Object.fromEntries(Object.entries(step.args).map(([k, v]) => [k, this.evaluate(v)])) });
    }
    this.state[id] = next;
    const ownsPending = effects.length > 0 && !this.pending.has(id);
    if (ownsPending) this.pending.add(id);
    this.onChange();
    try {
      for (const { step, args } of effects) {
        let completion = step.success;
        try { await this.capabilities[step.capability]!(args); }
        catch (error) { if (!step.failure) throw error; completion = step.failure; }
        if (completion) {
          await this.dispatch({ store: id, action: completion }, depth + 1);
        }
      }
    } finally { if (ownsPending) this.pending.delete(id); }
  }
  snapshot(): Snapshot {
    if (this.pending.size) throw new Error("Cannot save while effects are pending");
    return { version: 1, instance: this.instance, stores: Object.fromEntries(
      Object.entries(this.contract.stores).filter(([, s]) => s.persistenceKey)
        .map(([id, s]) => [s.persistenceKey!, structuredClone(this.state[id]!)]),
    ) };
  }
  restore(snapshot: Snapshot): void {
    if (this.pending.size) throw new Error("Cannot restore while effects are pending");
    if (snapshot.version !== 1 || snapshot.instance !== this.instance) throw new Error("Incompatible snapshot");
    const expected = Object.entries(this.contract.stores).filter(([, s]) => s.persistenceKey);
    if (Object.keys(snapshot.stores).sort().join() !== expected.map(([, s]) => s.persistenceKey).sort().join()) throw new Error("Incompatible persistent stores");
    const next = structuredClone(this.state);
    for (const [id, store] of expected) {
      const values = snapshot.stores[store.persistenceKey!]!;
      if (Object.keys(values).sort().join() !== Object.keys(store.initial).sort().join()
        || Object.entries(store.initial).some(([k, v]) => typeof values[k] !== typeof v || (typeof values[k] === "number" && !Number.isFinite(values[k]))))
        throw new Error("Incompatible state schema: " + store.persistenceKey);
      next[id] = structuredClone(values);
    }
    this.state = next;
    this.onChange();
  }
}
