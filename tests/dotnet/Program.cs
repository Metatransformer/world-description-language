using System.Text.Json.Nodes;
using Wdl;

var contract = JsonNode.Parse(File.ReadAllText(args[0]))!.AsObject();
var objects = contract["objects"]!.AsObject();
var lever = objects.First(o => o.Value?["label"]?.GetValue<string>() == "Toggle dungeon gate").Key;
var gate = objects.First(o => o.Value?["bindings"]?["solid"] != null).Key;
var chest = objects.First(o => o.Key.StartsWith("dungeon/") && o.Value?["label"]?.GetValue<string>() == "Collect ancient coin").Key;
var grants = 0;
var fail = true;
TaskCompletionSource<bool>? completion = null;
var handlers = new Dictionary<string, Func<JsonObject, Task>> {
    ["world.travel"] = _ => Task.CompletedTask,
    ["inventory.grant"] = async _ => {
        grants++;
        completion = new TaskCompletionSource<bool>();
        await completion.Task;
        if (fail) throw new Exception("Inventory full");
    },
};
var runtime = new PortableRuntime(contract, handlers);
var trace = new JsonArray();
trace.Add(runtime.Binding(gate, "solid", false));
await runtime.Interact(lever);
trace.Add(runtime.Binding(gate, "solid", true));
var first = runtime.Interact(chest);
await runtime.Interact(chest);
trace.Add(grants);
try { runtime.Snapshot(); throw new Exception("Pending save was accepted"); } catch (Exception e) when (e.Message.Contains("pending")) { trace.Add("pending-save-rejected"); }
completion!.SetResult(true); await first;
trace.Add(runtime.Binding(chest, "visible", true));
fail = false;
var retry = runtime.Interact(chest); completion!.SetResult(true); await retry;
await runtime.Interact(chest);
trace.Add(grants); trace.Add(runtime.Binding(chest, "visible", true));
var saved = runtime.Snapshot();
var restored = new PortableRuntime(contract, handlers);
restored.Restore(saved);
trace.Add(restored.Binding(chest, "visible", true));
trace.Add(new PortableRuntime(contract, handlers, "second").Binding(chest, "visible", true));
var invalid = saved.DeepClone().AsObject();
invalid["stores"]!["quest"]!["gateOpen"] = "wrong";
try { restored.Restore(invalid); throw new Exception("Invalid schema was accepted"); } catch (Exception e) when (e.Message.Contains("schema")) { trace.Add("schema-rejected"); }
Console.WriteLine("WDL_PARITY:" + new JsonObject { ["trace"] = trace, ["snapshot"] = saved }.ToJsonString());
