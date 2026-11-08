using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace Wdl;

/// <summary>Portable reducer. No Godot dependencies; tested against the JS runtime.</summary>
public sealed class PortableRuntime
{
    public JsonObject Contract { get; }
    public string Instance { get; }
    public event Action? Changed;
    private JsonObject _state = new();
    private readonly HashSet<string> _pending = new();
    private readonly IReadOnlyDictionary<string, Func<JsonObject, Task>> _capabilities;
    public PortableRuntime(JsonObject contract, IReadOnlyDictionary<string, Func<JsonObject, Task>> capabilities, string instance = "world")
    {
        Contract = contract;
        Instance = instance;
        _capabilities = capabilities;
        if (contract["version"]!.GetValue<int>() != 1) throw new Exception("Unsupported behavior version");
        foreach (var capability in contract["capabilities"]!.AsObject())
            if (!capabilities.ContainsKey(capability.Key)) throw new Exception("Missing capability: " + capability.Key);
        foreach (var store in contract["stores"]!.AsObject())
            _state[store.Key] = store.Value!["initial"]!.DeepClone();
    }
    public JsonNode Evaluate(JsonNode expression)
    {
        if (expression is not JsonObject obj) return expression.DeepClone();
        if (obj.ContainsKey("not")) return JsonValue.Create(!Evaluate(obj["not"]!).GetValue<bool>())!;
        return _state[obj["store"]!.GetValue<string>()]![obj["read"]!.GetValue<string>()]!.DeepClone();
    }
    public bool Binding(string id, string name, bool fallback)
    {
        var expression = Contract["objects"]?[id]?["bindings"]?[name];
        return expression == null ? fallback : Evaluate(expression).GetValue<bool>();
    }
    public Task Interact(string id)
    {
        var reference = Contract["objects"]?[id]?["interact"];
        return reference == null ? Task.CompletedTask : Dispatch(reference["store"]!.GetValue<string>(), reference["action"]!.GetValue<string>());
    }
    public async Task Dispatch(string storeId, string action, int depth = 0)
    {
        if (depth > 32) throw new Exception("Effect completion cycle");
        var transition = Contract["stores"]?[storeId]?["actions"]?[action] ?? throw new Exception("Unknown action");
        if ((depth == 0 && _pending.Contains(storeId)) || (transition["when"] is JsonNode condition && !Evaluate(condition).GetValue<bool>())) return;
        var next = _state[storeId]!.DeepClone().AsObject();
        var effects = new List<(JsonNode Step, JsonObject Args)>();
        foreach (var entry in transition["steps"]!.AsArray())
        {
            var step = entry!;
            var op = step["op"]!.GetValue<string>();
            if (op == "effect")
            {
                var args = new JsonObject();
                foreach (var arg in step["args"]!.AsObject()) args[arg.Key] = Evaluate(arg.Value!);
                effects.Add((step, args));
                continue;
            }
            var field = step["field"]!.GetValue<string>();
            switch (op)
            {
                case "set": next[field] = Evaluate(step["value"]!); break;
                case "toggle": next[field] = !next[field]!.GetValue<bool>(); break;
                case "add":
                    var value = next[field]!.GetValue<double>() + step["value"]!.GetValue<double>();
                    if (!double.IsFinite(value)) throw new Exception("Non-finite state");
                    next[field] = value;
                    break;
                default: throw new Exception("Unsupported reducer operation: " + op);
            }
        }
        _state[storeId] = next;
        var ownsPending = effects.Count > 0 && !_pending.Contains(storeId);
        if (ownsPending) _pending.Add(storeId);
        Changed?.Invoke();
        try
        {
            foreach (var (step, args) in effects)
            {
                var completion = step["success"]?.GetValue<string>();
                try { await _capabilities[step["capability"]!.GetValue<string>()](args); }
                catch
                {
                    completion = step["failure"]?.GetValue<string>();
                    if (completion == null) throw;
                }
                if (completion != null)
                {
                    await Dispatch(storeId, completion, depth + 1);
                }
            }
        }
        finally { if (ownsPending) _pending.Remove(storeId); }
    }
    public JsonObject Snapshot()
    {
        if (_pending.Count > 0) throw new Exception("Cannot save while effects are pending");
        var stores = new JsonObject();
        foreach (var store in Contract["stores"]!.AsObject())
            if (store.Value!["persistenceKey"] is JsonNode key) stores[key.GetValue<string>()] = _state[store.Key]!.DeepClone();
        return new JsonObject { ["version"] = 1, ["instance"] = Instance, ["stores"] = stores };
    }
    public void Restore(JsonObject snapshot)
    {
        if (_pending.Count > 0) throw new Exception("Cannot restore while effects are pending");
        if (snapshot["version"]?.GetValue<int>() != 1 || snapshot["instance"]?.GetValue<string>() != Instance) throw new Exception("Incompatible snapshot");
        var expected = Contract["stores"]!.AsObject().Where(s => s.Value!["persistenceKey"] != null).ToArray();
        var saved = snapshot["stores"]!.AsObject();
        if (!saved.Select(s => s.Key).Order().SequenceEqual(expected.Select(s => s.Value!["persistenceKey"]!.GetValue<string>()).Order()))
            throw new Exception("Incompatible persistent stores");
        var next = _state.DeepClone().AsObject();
        foreach (var store in expected)
        {
            var values = saved[store.Value!["persistenceKey"]!.GetValue<string>()]!.AsObject();
            var initial = store.Value!["initial"]!.AsObject();
            if (!values.Select(s => s.Key).Order().SequenceEqual(initial.Select(s => s.Key).Order())
                || initial.Any(s => Kind(values[s.Key]) != Kind(s.Value))) throw new Exception("Incompatible state schema");
            next[store.Key] = values.DeepClone();
        }
        _state = next;
        Changed?.Invoke();
    }
    private static string Kind(JsonNode? value) => value?.GetValueKind() switch
    {
        System.Text.Json.JsonValueKind.True or System.Text.Json.JsonValueKind.False => "boolean",
        System.Text.Json.JsonValueKind.Number => "number",
        System.Text.Json.JsonValueKind.String => "string",
        _ => "invalid",
    };
}
