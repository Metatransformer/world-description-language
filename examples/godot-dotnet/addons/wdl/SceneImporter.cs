using Godot;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;
using IO = System.IO;

namespace Wdl;

public static class SceneImporter
{
    public static JsonObject Read(string path) => JsonNode.Parse(FileAccess.GetFileAsString(path))!.AsObject();
    public static Transform3D Transform(JsonArray matrix) => new(
        new Basis(new Vector3((float)matrix[0]!, (float)matrix[1]!, (float)matrix[2]!),
            new Vector3((float)matrix[4]!, (float)matrix[5]!, (float)matrix[6]!),
            new Vector3((float)matrix[8]!, (float)matrix[9]!, (float)matrix[10]!)),
        new Vector3((float)matrix[12]!, (float)matrix[13]!, (float)matrix[14]!));
    public static string Filename(string id) => Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(id))).ToLowerInvariant()[..20];

    public static void Import(string folder = "res://generated")
    {
        var manifest = Read(folder + "/manifest.json");
        var index = Read(folder + "/index.json");
        var behavior = Read(folder + "/behavior.json");
        var destination = folder + "/scenes";
        IO.Directory.CreateDirectory(ProjectSettings.GlobalizePath(destination));
        var catalog = new JsonObject();
        foreach (var entry in index["spaces"]!.AsArray())
        {
            var space = entry!;
            var id = space["id"]!.GetValue<string>();
            var state = new GltfState();
            var document = new GltfDocument();
            var error = document.AppendFromFile(folder + "/" + space["file"]!.GetValue<string>(), state);
            if (error != Error.Ok) throw new Exception("glTF import failed: " + error);
            var imported = document.GenerateScene(state);
            var root = new WdlScene { Name = id };
            var nodes = new Dictionary<string, Node3D>();
            var meshIds = space["nodes"]!.AsArray();
            var importedNodes = imported.GetChildren().OfType<Node3D>().ToArray();
            if (importedNodes.Length != meshIds.Count) throw new Exception("Unexpected glTF hierarchy: expected flat WDL scene");
            for (int i = 0; i < meshIds.Count; i++)
            {
                var node = importedNodes[i];
                ClearOwners(node);
                node.GetParent()?.RemoveChild(node);
                nodes[meshIds[i]!.GetValue<string>()] = node;
            }
            var objects = manifest["objects"]!.AsArray().Where(o => o!["spaceId"]!.GetValue<string>() == id).Select(o => o!).ToArray();
            foreach (var item in objects)
            {
                var objectId = item["id"]!.GetValue<string>();
                if (!nodes.TryGetValue(objectId, out var node)) nodes[objectId] = node = new Node3D();
                node.Name = "Wdl_" + Filename(objectId);
                root.AddChild(node);
                node.Transform = Transform(item["matrix"]!.AsArray());
                node.SetMeta("wdl_id", objectId);
                node.SetMeta("wdl_properties", item["properties"]!.ToJsonString());
                var descriptor = behavior["objects"]?[objectId];
                if (node is MeshInstance3D mesh && (descriptor?["solid"]?.GetValue<bool>() == true || descriptor?["bindings"]?["solid"] != null))
                {
                    var body = new StaticBody3D { Name = "Collision", CollisionLayer = 1, CollisionMask = 1 };
                    body.AddChild(new CollisionShape3D { Name = "Shape", Shape = mesh.Mesh.CreateTrimeshShape() });
                    node.AddChild(body);
                }
            }
            // Reconstruct component hierarchy from complete world matrices exactly once.
            foreach (var item in objects)
            {
                var parentId = item["parentId"]?.GetValue<string>();
                if (parentId == null || !nodes.TryGetValue(parentId, out var parent)) continue;
                var node = nodes[item["id"]!.GetValue<string>()];
                var parentObject = objects.First(o => o["id"]!.GetValue<string>() == parentId);
                ClearOwners(node);
                root.RemoveChild(node);
                parent.AddChild(node);
                node.Transform = Transform(parentObject["matrix"]!.AsArray()).AffineInverse() * Transform(item["matrix"]!.AsArray());
            }
            WriteContract(root, behavior, destination + "/" + id + ".behavior.json");
            Save(root, destination + "/" + id + ".tscn");
            catalog[id] = destination + "/" + id + ".tscn";
            foreach (var item in objects.Where(o => o["geometry"] == null))
            {
                var objectId = item["id"]!.GetValue<string>();
                var component = new WdlScene { Name = "Component" };
                var copy = (Node3D)nodes[objectId].Duplicate();
                ClearOwners(copy);
                copy.Transform = Transform3D.Identity;
                component.AddChild(copy);
                var path = destination + "/component-" + Filename(objectId) + ".tscn";
                WriteContract(component, behavior, path.Replace(".tscn", ".behavior.json"));
                Save(component, path);
                catalog[objectId] = path;
                component.Free();
            }
            root.Free();
            imported.Free();
        }
        IO.File.WriteAllText(ProjectSettings.GlobalizePath(folder + "/scenes.json"), catalog.ToJsonString(new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
        IO.File.WriteAllText(ProjectSettings.GlobalizePath(folder + "/imported-revision.txt"), FileAccess.GetFileAsString(folder + "/revision.txt"));
    }
    private static void WriteContract(WdlScene root, JsonObject behavior, string path)
    {
        var objects = new JsonObject();
        void Visit(Node node)
        {
            if (node.HasMeta("wdl_id"))
            {
                var id = node.GetMeta("wdl_id").AsString();
                objects[id] = behavior["objects"]![id]!.DeepClone();
            }
            foreach (Node child in node.GetChildren()) Visit(child);
        }
        Visit(root);
        var stores = new JsonObject();
        var capabilities = new JsonObject();
        var required = new HashSet<string>();
        void References(JsonNode? node)
        {
            if (node is JsonObject obj)
            {
                if (obj["store"] is JsonValue store) required.Add(store.GetValue<string>());
                if (obj["capability"] is JsonValue cap)
                {
                    var key = cap.GetValue<string>();
                    capabilities[key] = behavior["capabilities"]![key]!.DeepClone();
                }
                foreach (var pair in obj) References(pair.Value);
            }
            else if (node is JsonArray array) foreach (var value in array) References(value);
        }
        References(objects);
        while (required.Any(id => !stores.ContainsKey(id)))
            foreach (var id in required.Where(id => !stores.ContainsKey(id)).ToArray())
            {
                stores[id] = behavior["stores"]![id]!.DeepClone();
                References(stores[id]);
            }
        var contract = new JsonObject { ["version"] = 1, ["objects"] = objects, ["stores"] = stores, ["capabilities"] = capabilities };
        IO.File.WriteAllText(ProjectSettings.GlobalizePath(path), contract.ToJsonString());
        root.BehaviorPath = path;
    }
    private static void ClearOwners(Node node)
    {
        node.Owner = null;
        foreach (Node child in node.GetChildren()) ClearOwners(child);
    }
    private static void Save(Node root, string path)
    {
        void Own(Node node)
        {
            foreach (Node child in node.GetChildren()) { child.Owner = root; Own(child); }
        }
        Own(root);
        var scene = new PackedScene();
        if (scene.Pack(root) != Error.Ok || ResourceSaver.Save(scene, path) != Error.Ok) throw new Exception("Cannot save scene: " + path);
    }
}
