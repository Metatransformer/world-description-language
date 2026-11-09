# Integrate Generative World Studio into Godot

Tell your agent: **“Follow docs/AGENT-QUICKSTART.md and docs/INTEGRATION.md to integrate Valenfeld into my Godot .NET game. Keep my native gameplay systems and verify the complete interaction flow.”**

This recipe targets a C# Godot project. The adapter currently uses the Godot version declared in `examples/godot-dotnet/WdlDemo.csproj` (including editor APIs); porting to a different version requires compiling and checking those APIs. A GDScript-only project needs the .NET edition and a C# assembly to use this adapter unchanged.

## 1. Establish the working example

Install dependencies and run `npm run game:spawn`. Check the town, enter an interior, and interact with a chest. `npm run game:spawn:web` runs the same world in the toy browser engine. This separates world/compiler problems from integration problems in your game.

The full running implementation is `examples/godot-dotnet/Main.cs`. Read it alongside `addons/wdl/WdlScene.cs`: Main owns player/input, scene changes, inventory, and saves; the adapter owns imported nodes and state bindings.

## 2. Install and build the adapter

Copy `examples/godot-dotnet/addons/wdl` into the target game's `addons/wdl`. Keep the game's existing `.csproj`, scripts, player, and main scene. Build its C# project and enable the plugin under Project Settings > Plugins.

From the Studio repository, build into the target game's generated directory:

```sh
npm run game:build -- --entry worlds/spawn-demo.tsx --out /absolute/path/to/game/generated
```

Build the target C# project again so `generated/CapabilityBindings.cs` is compiled. In the Studio dock, set the repository path, Node executable, and `worlds/spawn-demo.tsx` entry, then choose Import latest successful build. Build Changed and Build All perform build/import on demand; Watch is opt-in. For the bundled example, `game:spawn:editor` performs setup for you.

Completion: `generated/scenes.json` lists scene paths and `generated/scenes/town.tscn` loads as a `Wdl.WdlScene`. Put scripts and engine-specific customization on wrapper scenes around these generated resources.

## 3. Implement your game's capability contract

Valenfeld declares `world.travel(space, x, y, z)` and `inventory.grant(item)` in its world metadata. The generated factory requires implementations with matching types. Add a wrapper node to your existing main scene, using this pattern:

```csharp
using Godot;
using System.Threading.Tasks;
using Wdl;

public partial class WorldHost : Node3D
{
    [Export] public Node3D Player { get; set; } = null!;
    private PortableRuntime _runtime = null!;
    private WdlScene? _space;

    public override void _Ready()
    {
        var capabilities = Wdl.Generated.CapabilityBindings.Create(
            cap_inventory_grant: item => GrantItem(item),
            cap_world_travel: (space, x, y, z) => {
                LoadSpace(space, new Vector3((float)x, (float)y, (float)z));
                return Task.CompletedTask;
            });
        _runtime = new PortableRuntime(
            SceneImporter.Read("res://generated/behavior.json"), capabilities);
        LoadSpace("town", new Vector3(0, 1, 14));
    }

    private Task GrantItem(string item)
    {
        // Replace with your inventory transaction. Complete only after success.
        GD.Print("Granted " + item);
        return Task.CompletedTask;
    }

    private void LoadSpace(string id, Vector3 arrival)
    {
        var catalog = SceneImporter.Read("res://generated/scenes.json");
        var path = catalog[id]?.GetValue<string>()
            ?? throw new System.Exception("Unknown space: " + id);
        var next = GD.Load<PackedScene>(path).Instantiate<WdlScene>();
        if (_space != null) { RemoveChild(_space); _space.QueueFree(); }
        _space = next;
        AddChild(next);
        next.Bind(_runtime);
        Player.GlobalPosition = arrival;
        // Reset your character's velocity and camera as required by your game.
    }

    public async Task Interact()
    {
        var target = _space?.Nearest(Player.GlobalPosition + Vector3.Up);
        if (target.HasValue) await _runtime.Interact(target.Value.Id);
    }
}
```

Connect your input action to `Interact()` and assign Player in the Inspector. Catch and report interaction errors in your input/controller code. `Nearest` is a sample proximity policy; a production game can use its own targeting/raycast system and the imported `wdl_id` metadata. Use the exported contract handles, not engine node names or hard-coded internal component paths.

`GrantItem` above is an explicit integration stub. Replace it with the real inventory before considering integration complete. A failed capability should throw or return a failed Task. The chest marks itself collected only on success; the runtime blocks duplicate external actions on that store while an effect is pending. Your game remains responsible for transactional/idempotent external services.

## 4. Choose state ownership

For a connected world, create one runtime and call `Bind(runtime)` on each newly loaded space. State then survives scene transitions, as in Valenfeld. Recreating the runtime for every door would reset unsaved state.

For independently placed reusable components, load their paths from `scenes.json`, set a unique durable `InstanceId`, and call `Initialize(capabilities)` on each `WdlScene`. Its reduced behavior contract creates private runtime state. Two copies of a chest can share the same compiled source without sharing their collected flag. Persist each instance's snapshot with its durable placement identity.

JSX keys identify structure within components. Props configure the build. `local(...)` scopes state; `read(...)` and `action(...)` resolve through that scope. Public actions and capabilities are the engine boundary. Inspect `worlds/spawn/interiors.tsx` for a gate and lever wired through props without exchanging global object IDs.

## 5. Save and package

Use `runtime.Snapshot()` and `runtime.Restore(snapshot)` for portable state. Your save record must also include inventory, player position, current space, and any engine state. Restore the runtime and inventory before loading the saved space. Snapshots require matching version, instance identity, and persistent field/type layout; your game owns migration. Saving/restoring while effects are pending is rejected.

Before exporting the Godot game, generate native scenes and include generated JSON in the export preset's non-resource filters, for example `generated/*.json,generated/scenes/*.json`. The adapter reads contracts with FileAccess, so they are not automatically discovered as PackedScene dependencies. Ship native scenes, their resources, and contracts; Node/JSX compilation is a development build step, not a Godot runtime dependency.

## 6. Verify the target game

- Load all four spaces and return to town through their doors.
- Operate the workshop lever; verify the gate's visibility and physical collision both change.
- Collect a chest twice; inventory receives one item. Save, restart, restore; the chest remains collected.
- Place two copies of a reusable component with distinct InstanceIds and confirm their state is independent.
- Rebuild unchanged input and confirm generated scene files retain their timestamps. Edit a JSX prop, rebuild, and verify the scene updates while your wrapper scripts remain intact.
- Run an exported build and confirm scenes and JSON contracts load outside the editor.

The bundled `--smoke-spawn` checks native travel, gate state, and chest persistence; it does not substitute for exercising your own inventory, controller, or packaged export.

## Extend or troubleshoot

| Symptom / change | Check |
| --- | --- |
| Missing C# capability type | Generate artifacts first, then rebuild the target C# assembly |
| Plugin does not compile | Match the Godot .NET SDK version; compare editor APIs in WdlPlugin.cs |
| Chest resets on travel | Reuse one world runtime; check persistent keys when saving |
| Two placed components share state | Use distinct InstanceIds and Initialize for independent ownership |
| Geometry renders but input does nothing | Bind/Initialize the scene, register capabilities, wire native input |
| Stair/cellar traversal | Supply an appropriate native controller; the toy controller is limited |
| Add quest/dialogue/audio | Declare a typed capability, rebuild bindings, implement it per engine |
| Add a new portable reducer operation | Update validation and both interpreters, then extend parity tests |

See [GODOT.md](GODOT.md) for precise state semantics and build behavior, and [ARTIFACT-CONTRACT.md](ARTIFACT-CONTRACT.md) for exported data fields.
