using Godot;
using System;
using System.Collections.Generic;
using System.Text.Json.Nodes;
using System.Threading.Tasks;

namespace Wdl;

/// <summary>Public interface for an imported component; internal nodes are adapter-owned.</summary>
public partial class WdlScene : Node3D
{
    [Export] public string InstanceId { get; set; } = "";
    [Export(PropertyHint.File, "*.json")] public string BehaviorPath { get; set; } = "res://generated/behavior.json";
    public PortableRuntime? Runtime { get; private set; }
    private readonly Dictionary<string, Node3D> _objects = new();
    public void Initialize(IReadOnlyDictionary<string, Func<JsonObject, Task>> capabilities)
    {
        if (string.IsNullOrWhiteSpace(InstanceId)) throw new Exception("Assign a durable InstanceId before initializing a WDL component.");
        Bind(new PortableRuntime(SceneImporter.Read(BehaviorPath), capabilities, InstanceId));
    }
    public void Bind(PortableRuntime runtime)
    {
        if (Runtime != null) Runtime.Changed -= Refresh;
        Runtime = runtime;
        _objects.Clear();
        void Visit(Node node)
        {
            if (node is Node3D spatial && node.HasMeta("wdl_id")) _objects[node.GetMeta("wdl_id").AsString()] = spatial;
            foreach (Node child in node.GetChildren()) Visit(child);
        }
        Visit(this);
        Runtime.Changed += Refresh;
        Refresh();
    }
    private void Refresh()
    {
        if (Runtime == null) return;
        foreach (var (id, node) in _objects)
        {
            node.Visible = Runtime.Binding(id, "visible", true);
            var body = node.GetNodeOrNull<StaticBody3D>("Collision");
            if (body != null)
            {
                var solid = Runtime.Binding(id, "solid", Runtime.Contract["objects"]?[id]?["solid"]?.GetValue<bool>() ?? false);
                body.CollisionLayer = solid ? 1u : 0u;
                body.CollisionMask = solid ? 1u : 0u;
            }
        }
    }
    public (string Id, string Label)? Nearest(Vector3 position, float distance = 3)
    {
        (string, string)? result = null;
        foreach (var (id, node) in _objects)
        {
            var descriptor = Runtime?.Contract["objects"]?[id];
            if (descriptor?["interact"] == null || !node.IsVisibleInTree()) continue;
            var next = position.DistanceTo(node.GlobalPosition);
            if (next >= distance) continue;
            distance = next;
            result = (id, descriptor["label"]?.GetValue<string>() ?? "Interact");
        }
        return result;
    }
    public override void _ExitTree() { if (Runtime != null) Runtime.Changed -= Refresh; }
}
