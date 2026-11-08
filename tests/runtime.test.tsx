import { describe, it, expect } from "vitest";
import { World, Space, Group, Mesh, compileWorld } from "../src/wdl/index.js";
import { compileBehavior, defineStore, local, read, action, not, type BehaviorDefinition } from "../src/runtime/contract.js";
import { WorldRuntime } from "../src/runtime/runtime.js";

const chest = defineStore({ opened: false, pending: false }, {
  interact: { when: not(read("opened")), steps: [
    { op: "set", field: "pending", value: true },
    { op: "effect", capability: "inventory.grant", args: { item: "coin" }, success: "collected", failure: "failed" },
  ] },
  collected: { steps: [{ op: "set", field: "opened", value: true }, { op: "set", field: "pending", value: false }] },
  failed: { steps: [{ op: "set", field: "pending", value: false }] },
});
function fixture() {
  return compileBehavior(compileWorld(
    <World key="world" name="Runtime" metadata={{ behavior: { version: 1, stores: {}, capabilities: { "inventory.grant": { item: "string" } } } satisfies BehaviorDefinition }}>
      <Space key="room" name="Room">
        {["a", "b"].map(key => <Group key={key} properties={{ wdl: { scope: local(chest, key) } }}>
          <Mesh key="body" geometry={{ shape: "box", size: [1, 1, 1] }}
            properties={{ wdl: { interact: action("interact"), bindings: { visible: not(read("opened")) } } }} />
        </Group>)}
      </Space>
    </World>,
  ));
}
describe("portable world interactions", () => {
  it("does not grant a pending chest twice and retries a failed grant", async () => {
    let finish!: () => void;
    let grants = 0;
    let reject = true;
    const runtime = new WorldRuntime(fixture(), { "inventory.grant": async () => {
      grants++;
      await new Promise<void>(resolve => { finish = resolve; });
      if (reject) throw new Error("Inventory full");
    } });
    const first = runtime.interact("room/a/body");
    await runtime.interact("room/a/body");
    expect(grants).toBe(1);
    expect(() => runtime.snapshot()).toThrow("pending");
    finish(); await first;
    expect(runtime.binding("room/a/body", "visible")).toBe(true);
    reject = false;
    const retry = runtime.interact("room/a/body"); finish(); await retry;
    expect(runtime.binding("room/a/body", "visible")).toBe(false);
    await runtime.interact("room/a/body");
    expect(grants).toBe(2);
  });
  it("rejects missing capability registrations and incompatible snapshots", () => {
    expect(() => new WorldRuntime(fixture(), {})).toThrow("Missing capability");
    const runtime = new WorldRuntime(fixture(), { "inventory.grant": () => {} });
    const save = runtime.snapshot();
    save.stores.a!.opened = "wrong type";
    expect(() => runtime.restore(save)).toThrow("schema");
    expect(runtime.binding("room/a/body", "visible")).toBe(true);
    expect(() => new WorldRuntime(fixture(), { "inventory.grant": () => {} }, "other").restore(runtime.snapshot())).toThrow("snapshot");
  });
  it("isolates component state and restores only persistent state", async () => {
    const contract = fixture();
    const runtime = new WorldRuntime(contract, { "inventory.grant": async () => {} });
    await runtime.interact("room/a/body");
    expect(runtime.binding("room/a/body", "visible")).toBe(false);
    expect(runtime.binding("room/b/body", "visible")).toBe(true);
    const restored = new WorldRuntime(contract, { "inventory.grant": async () => {} });
    restored.restore(runtime.snapshot());
    expect(restored.binding("room/a/body", "visible")).toBe(false);
    expect(restored.binding("room/b/body", "visible")).toBe(true);
  });
});
