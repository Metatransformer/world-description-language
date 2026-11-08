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
        var signatures = new JsonObject();
        var oldSignatures = FileAccess.FileExists(folder + "/import-signatures.json") ? Read(folder + "/import-signatures.json") : new JsonObject();
        var oldCatalog = FileAccess.FileExists(folder + "/scenes.json") ? Read(folder + "/scenes.json") : new JsonObject();
        foreach (var entry in index["spaces"]!.AsArray())
        {
            var space = entry!;
            var id = space["id"]!.GetValue<string>();
            var objects = manifest["objects"]!.AsArray().Where(o => o!["spaceId"]!.GetValue<string>() == id).Select(o => o!).ToArray();
            var objectIds = objects.Select(o => o["id"]!.GetValue<string>()).ToArray();
            var spaceContract = ContractFor(objectIds, behavior);
            var importerSource = FileAccess.GetFileAsString("res://addons/wdl/SceneImporter.cs");
            var gltfText = FileAccess.GetFileAsString(folder + "/" + space["file"]!.GetValue<string>());
            var gltf = JsonNode.Parse(gltfText)!;
            var source = gltfText
                + string.Join("", objects.Select(o => o.ToJsonString())) + spaceContract.ToJsonString()
                + importerSource;
            var signature = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(source)));
            signatures[id] = signature;
            var keys = objectIds.Prepend(id).ToArray();
            if (oldSignatures[id]?.GetValue<string>() == signature
                && keys.All(key => oldCatalog[key] is JsonValue path && FileAccess.FileExists(path.GetValue<string>())
                    && FileAccess.FileExists(path.GetValue<string>().Replace(".tscn", ".behavior.json"))))
            {
                foreach (var key in keys) catalog[key] = oldCatalog[key]!.DeepClone();
                foreach (var key in objectIds)
                    if (oldSignatures["component:" + key] != null) signatures["component:" + key] = oldSignatures["component:" + key]!.DeepClone();
                continue;
            }
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
            var scenePath = destination + "/" + IO.Path.GetFileNameWithoutExtension(space["file"]!.GetValue<string>()) + ".tscn";
            WriteContract(root, behavior, scenePath.Replace(".tscn", ".behavior.json"));
            Save(root, scenePath);
            catalog[id] = scenePath;
            foreach (var item in objects)
            {
                var objectId = item["id"]!.GetValue<string>();
                var descendants = objects.Where(o => o["id"]!.GetValue<string>() == objectId || o["id"]!.GetValue<string>().StartsWith(objectId + "/", StringComparison.Ordinal)).ToArray();
                var componentSource = importerSource + ContractFor(descendants.Select(o => o["id"]!.GetValue<string>()), behavior).ToJsonString();
                foreach (var descendant in descendants)
                {
                    var record = descendant.DeepClone().AsObject();
                    record.Remove("source");
                    componentSource += record.ToJsonString();
                    var materialId = descendant["material"]?.GetValue<string>();
                    if (materialId != null)
                    {
                        var material = manifest["materials"]!.AsArray().First(m => m!["id"]!.GetValue<string>() == materialId)!;
                        componentSource += material.ToJsonString();
                        var materialIndex = manifest["materials"]!.AsArray().IndexOf(material);
                        var textureIndex = gltf["materials"]![materialIndex]!["pbrMetallicRoughness"]?["baseColorTexture"]?["index"];
                        if (textureIndex != null)
                        {
                            var imageIndex = gltf["textures"]![textureIndex.GetValue<int>()]!["source"]!.GetValue<int>();
                            componentSource += gltf["images"]![imageIndex]!.ToJsonString();
                        }
                    }
                }
                var componentSignature = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(componentSource)));
                signatures["component:" + objectId] = componentSignature;
                var path = destination + "/component-" + Filename(objectId) + ".tscn";
                catalog[objectId] = path;
                if (oldSignatures["component:" + objectId]?.GetValue<string>() == componentSignature
                    && FileAccess.FileExists(path) && FileAccess.FileExists(path.Replace(".tscn", ".behavior.json"))) continue;
                var component = new WdlScene { Name = "Component" };
                var copy = (Node3D)nodes[objectId].Duplicate();
                ClearOwners(copy);
                copy.Transform = Transform3D.Identity;
                component.AddChild(copy);
                WriteContract(component, behavior, path.Replace(".tscn", ".behavior.json"));
                Save(component, path);
                component.Free();
            }
            root.Free();
            imported.Free();
        }
        WriteChanged(folder + "/scenes.json", catalog.ToJsonString(new System.Text.Json.JsonSerializerOptions { WriteIndented = true }));
        WriteChanged(folder + "/import-signatures.json", signatures.ToJsonString());
        WriteChanged(folder + "/imported-revision.txt", FileAccess.GetFileAsString(folder + "/revision.txt"));
        foreach (var old in oldCatalog)
            if (!catalog.ContainsKey(old.Key))
            {
                var path = old.Value!.GetValue<string>();
                if (path.StartsWith(destination + "/", StringComparison.Ordinal))
                {
                    IO.File.Delete(ProjectSettings.GlobalizePath(path));
                    IO.File.Delete(ProjectSettings.GlobalizePath(path.Replace(".tscn", ".behavior.json")));
                }
            }
    }
    private static void WriteContract(WdlScene root, JsonObject behavior, string path)
    {
        var ids = new List<string>();
        void Visit(Node node)
        {
            if (node.HasMeta("wdl_id"))
            {
                var id = node.GetMeta("wdl_id").AsString();
                ids.Add(id);
            }
            foreach (Node child in node.GetChildren()) Visit(child);
        }
        Visit(root);
        var contract = ContractFor(ids, behavior);
        WriteChanged(path, contract.ToJsonString());
        root.BehaviorPath = path;
    }
    private static JsonObject ContractFor(IEnumerable<string> ids, JsonObject behavior)
    {
        var objects = new JsonObject();
        foreach (var id in ids) objects[id] = behavior["objects"]![id]!.DeepClone();
        var stores = new JsonObject();
        var capabilities = new JsonObject();
        var required = new HashSet<string>();
        void Expression(JsonNode? node)
        {
            if (node is JsonObject obj)
            {
                if (obj.ContainsKey("read")) required.Add(obj["store"]!.GetValue<string>());
                else if (obj["not"] is JsonNode inner) Expression(inner);
            }
        }
        foreach (var descriptor in objects.Select(pair => pair.Value!))
        {
            if (descriptor["interact"] is JsonObject interaction) required.Add(interaction["store"]!.GetValue<string>());
            if (descriptor["bindings"] is JsonObject bindings) foreach (var binding in bindings) Expression(binding.Value);
        }
        while (required.Any(id => !stores.ContainsKey(id)))
            foreach (var id in required.Where(id => !stores.ContainsKey(id)).ToArray())
            {
                stores[id] = behavior["stores"]![id]!.DeepClone();
                foreach (var action in stores[id]!["actions"]!.AsObject())
                {
                    Expression(action.Value!["when"]);
                    foreach (var step in action.Value["steps"]!.AsArray())
                    {
                        var op = step!["op"]!.GetValue<string>();
                        if (op == "set") Expression(step["value"]);
                        if (op != "effect") continue;
                        var key = step["capability"]!.GetValue<string>();
                        capabilities[key] = behavior["capabilities"]![key]!.DeepClone();
                        foreach (var arg in step["args"]!.AsObject()) Expression(arg.Value);
                    }
                }
            }
        return new JsonObject { ["version"] = 1, ["objects"] = objects, ["stores"] = stores, ["capabilities"] = capabilities };
    }
    private static void WriteChanged(string path, string text)
    {
        var absolute = ProjectSettings.GlobalizePath(path);
        if (!IO.File.Exists(absolute) || IO.File.ReadAllText(absolute) != text) IO.File.WriteAllText(absolute, text);
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
