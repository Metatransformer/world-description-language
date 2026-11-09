using Godot;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Nodes;
using System.Threading.Tasks;
using Wdl;

public partial class Main : Node3D
{
    private PortableRuntime _runtime = null!;
    private WdlScene? _space;
    private CharacterBody3D _player = null!;
    private Camera3D _camera = null!;
    private Label _hud = null!;
    private string _spaceId = "town";
    private string _message = "Explore Alder Vale";
    private int _coins;
    private float _pitch;
    private bool _busy;
    private string _title = "Alder Vale";
    private string SavePath => "user://wdl-" + SceneImporter.Filename(_title) + ".json";
    public override void _Ready()
    {
        try
        {
            if (OS.GetCmdlineUserArgs().Contains("--import-wdl"))
            {
                var userArgs = OS.GetCmdlineUserArgs();
                var folderIndex = Array.IndexOf(userArgs, "--folder");
                SceneImporter.Import(folderIndex >= 0 ? userArgs[folderIndex + 1] : "res://generated");
                GD.Print("WDL_IMPORT_OK");
                GetTree().Quit();
                return;
            }
            if (!FileAccess.FileExists("res://generated/scenes/town.tscn"))
                SceneImporter.Import();
            var manifest = SceneImporter.Read("res://generated/manifest.json");
            _title = manifest["name"]!.GetValue<string>();
            DisplayServer.WindowSetTitle(_title + " · Godot .NET");
            var environment = new WorldEnvironment { Environment = new Godot.Environment {
                BackgroundMode = Godot.Environment.BGMode.Color, BackgroundColor = new Color("#152530"),
                AmbientLightSource = Godot.Environment.AmbientSource.Color, AmbientLightColor = new Color("#c3d3da"), AmbientLightEnergy = 0.35f,
                TonemapMode = Godot.Environment.ToneMapper.Filmic,
            } };
            AddChild(environment);
            AddChild(new DirectionalLight3D { RotationDegrees = new Vector3(-55, -30, 0), LightColor = new Color("#fff0cf"), LightEnergy = 0.65f, ShadowEnabled = true });
            _player = new CharacterBody3D { Name = "Player", CollisionLayer = 2, CollisionMask = 1 };
            _player.AddChild(new CollisionShape3D { Position = new Vector3(0, 0.9f, 0), Shape = new CapsuleShape3D { Radius = 0.32f, Height = 1.8f } });
            _camera = new Camera3D { Position = new Vector3(0, 1.6f, 0), Current = true, Fov = 75 };
            _player.AddChild(_camera);
            AddChild(_player);
            var canvas = new CanvasLayer();
            var panel = new PanelContainer { Position = new Vector2(24, 24) };
            _hud = new Label { Text = "ALDER VALE", ThemeTypeVariation = "HeaderSmall" };
            _hud.AddThemeFontSizeOverride("font_size", 20);
            panel.AddChild(_hud); canvas.AddChild(panel); AddChild(canvas);
            _runtime = new PortableRuntime(SceneImporter.Read("res://generated/behavior.json"), Wdl.Generated.CapabilityBindings.Create(
                cap_world_travel: (space, x, y, z) => {
                    Travel(space, new Vector3((float)x, (float)y, (float)z));
                    return Task.CompletedTask;
                },
                cap_inventory_grant: item => { _coins++; _message = "Collected " + item; return Task.CompletedTask; }
            ));
            var start = manifest["metadata"]?["start"];
            var position = start?["position"]?.AsArray();
            Travel(start?["space"]?.GetValue<string>() ?? "town", position == null ? new Vector3(0, 1, 10)
                : new Vector3((float)position[0]!, (float)position[1]!, (float)position[2]!));
            if (OS.GetCmdlineUserArgs().Contains("--smoke-spawn")) { SmokeSpawn(); return; }
            if (OS.GetCmdlineUserArgs().Contains("--smoke-test")) { SmokeTest(); return; }
            if (OS.GetCmdlineUserArgs().Contains("--capture")) { Capture(); return; }
            Input.MouseMode = Input.MouseModeEnum.Captured;
        }
        catch (Exception error) { GD.PushError(error.ToString()); GetTree().Quit(1); }
    }
    private async void Capture()
    {
        await ToSignal(RenderingServer.Singleton, RenderingServer.SignalName.FramePostDraw);
        await ToSignal(RenderingServer.Singleton, RenderingServer.SignalName.FramePostDraw);
        GetViewport().GetTexture().GetImage().SavePng("res://generated/preview.png");
        GD.Print("WDL_CAPTURE_OK");
        GetTree().Quit();
    }
    private void Travel(string id, Vector3 arrival)
    {
        var path = "res://generated/scenes/" + id + ".tscn";
        if (!ResourceLoader.Exists(path)) throw new Exception("Unknown space: " + id);
        var next = GD.Load<PackedScene>(path).Instantiate<WdlScene>();
        if (_space != null) { RemoveChild(_space); _space.QueueFree(); }
        _space = next; AddChild(next); next.Bind(_runtime);
        _spaceId = id; _player.Position = arrival; _player.Velocity = Vector3.Zero;
        _message = "Entered " + id;
    }
    public override void _UnhandledInput(InputEvent input)
    {
        if (input is InputEventMouseMotion motion && Input.MouseMode == Input.MouseModeEnum.Captured)
        {
            _player.RotateY(-motion.Relative.X * 0.0025f);
            _pitch = Mathf.Clamp(_pitch - motion.Relative.Y * 0.0025f, -1.4f, 1.4f);
            _camera.Rotation = new Vector3(_pitch, 0, 0);
        }
        if (input is InputEventMouseButton mouse && mouse.Pressed) Input.MouseMode = Input.MouseModeEnum.Captured;
        if (input is not InputEventKey key || !key.Pressed || key.Echo) return;
        if (key.Keycode == Key.Escape) Input.MouseMode = Input.MouseModeEnum.Visible;
        if (key.Keycode == Key.E) _ = Interact();
        if (key.Keycode == Key.F5) Save();
        if (key.Keycode == Key.F9) Restore();
    }
    public override void _PhysicsProcess(double delta)
    {
        if (_player == null || _runtime == null) return;
        var direction = new Vector3(
            (Input.IsPhysicalKeyPressed(Key.D) ? 1 : 0) - (Input.IsPhysicalKeyPressed(Key.A) ? 1 : 0), 0,
            (Input.IsPhysicalKeyPressed(Key.S) ? 1 : 0) - (Input.IsPhysicalKeyPressed(Key.W) ? 1 : 0));
        direction = _player.Basis * direction.Normalized();
        var speed = Input.IsPhysicalKeyPressed(Key.Shift) ? 7 : 4;
        var velocity = _player.Velocity;
        velocity.X = direction.X * speed; velocity.Z = direction.Z * speed;
        velocity.Y = _player.IsOnFloor() ? -0.1f : velocity.Y - 20 * (float)delta;
        _player.Velocity = velocity; _player.MoveAndSlide();
        var target = _space?.Nearest(_player.GlobalPosition + Vector3.Up);
        _hud.Text = "  " + _title + " / " + _spaceId.ToUpperInvariant() + "  \n"
            + "  WDL → Godot C# · Coins: " + _coins + "  \n"
            + "  WASD walk · Mouse look · E interact · Shift sprint  \n"
            + "  F5 save · F9 restore · Esc release mouse  \n\n"
            + "  " + (target.HasValue ? "[E] " + target.Value.Label : _message) + "  ";
    }
    private async Task Interact()
    {
        var target = _space?.Nearest(_player.GlobalPosition + Vector3.Up);
        if (_busy || !target.HasValue) return;
        _busy = true;
        try { await _runtime.Interact(target.Value.Id); }
        catch (Exception error) { _message = error.Message; }
        finally { _busy = false; }
    }
    private void Save()
    {
        try
        {
            var save = new JsonObject { ["world"] = _runtime.Snapshot(), ["coins"] = _coins, ["space"] = _spaceId,
                ["position"] = new JsonArray(_player.Position.X, _player.Position.Y, _player.Position.Z) };
            using var file = FileAccess.Open(SavePath, FileAccess.ModeFlags.Write);
            file.StoreString(save.ToJsonString()); _message = "Saved world and inventory";
        }
        catch (Exception error) { _message = error.Message; }
    }
    private void Restore()
    {
        try
        {
            var save = SceneImporter.Read(SavePath);
            _runtime.Restore(save["world"]!.AsObject()); _coins = save["coins"]!.GetValue<int>();
            var p = save["position"]!.AsArray();
            Travel(save["space"]!.GetValue<string>(), new Vector3((float)p[0]!, (float)p[1]!, (float)p[2]!));
            _message = "Restored world and inventory";
        }
        catch (Exception error) { _message = error.Message; }
    }
    private async void SmokeSpawn()
    {
        try
        {
            var objects = _runtime.Contract["objects"]!.AsObject();
            foreach (var id in new[] { "town", "inn", "cottage", "workshop" }) Travel(id, new Vector3(0, 1, 4));
            var latch = objects.First(o => o.Value?["label"]?.GetValue<string>() == "Toggle workshop storeroom").Key;
            var gate = objects.First(o => o.Key.StartsWith("workshop/") && o.Value?["bindings"]?["solid"] != null).Key;
            if (!_runtime.Binding(gate, "solid", false)) throw new Exception("Workshop gate should start closed");
            await _runtime.Interact(latch);
            if (_runtime.Binding(gate, "solid", true)) throw new Exception("Workshop gate did not open");
            var entrance = objects.First(o => o.Value?["label"]?.GetValue<string>() == "Enter the Drowned Lantern").Key;
            await _runtime.Interact(entrance);
            if (_spaceId != "inn") throw new Exception("Entrance did not load inn");
            var chest = objects.First(o => o.Key.StartsWith("inn/") && o.Value?["label"]?.GetValue<string>() == "Open Valenfeld chest").Key;
            await _runtime.Interact(chest); await _runtime.Interact(chest);
            _runtime.Restore(_runtime.Snapshot());
            if (_coins != 1 || _runtime.Binding(chest, "visible", true)) throw new Exception("Chest state did not persist");
            var exit = objects.First(o => o.Value?["label"]?.GetValue<string>() == "Return to Valenfeld").Key;
            await _runtime.Interact(exit);
            if (_spaceId != "town") throw new Exception("Exit did not load town");
            GD.Print("WDL_SPAWN_SMOKE_OK spaces=4; town -> inn -> town; workshop gate=open; chest persisted; coins=1");
            GetTree().Quit();
        }
        catch (Exception error) { GD.PushError(error.ToString()); GetTree().Quit(1); }
    }
    private async void SmokeTest()
    {
        try
        {
            foreach (var id in new[] { "town", "exterior", "inn", "cottage", "dungeon" }) Travel(id, new Vector3(0, 1, 4));
            var objects = _runtime.Contract["objects"]!.AsObject();
            var lever = objects.First(o => o.Value?["label"]?.GetValue<string>() == "Toggle dungeon gate").Key;
            var gate = objects.First(o => o.Value?["bindings"]?["solid"] != null).Key;
            if (!_runtime.Binding(gate, "solid", false)) throw new Exception("Gate should start solid");
            await _runtime.Interact(lever);
            if (_runtime.Binding(gate, "solid", true)) throw new Exception("Gate did not open");
            var chest = objects.First(o => o.Key.StartsWith("dungeon/") && o.Value?["label"]?.GetValue<string>() == "Collect ancient coin").Key;
            await _runtime.Interact(chest); await _runtime.Interact(chest);
            if (_coins != 1) throw new Exception("Chest granted more than once");
            var save = _runtime.Snapshot(); _runtime.Restore(save);
            if (_runtime.Binding(chest, "visible", true)) throw new Exception("Chest did not persist");
            var catalog = SceneImporter.Read("res://generated/scenes.json");
            if (catalog[gate] == null) throw new Exception("Mesh-root component was not exported");
            var firstGate = GD.Load<PackedScene>(catalog[gate]!.GetValue<string>()).Instantiate<WdlScene>();
            var secondGate = GD.Load<PackedScene>(catalog[gate]!.GetValue<string>()).Instantiate<WdlScene>();
            AddChild(firstGate); AddChild(secondGate);
            firstGate.Position = new Vector3(30, 0, 0); secondGate.Position = new Vector3(-30, 0, 0);
            firstGate.InstanceId = "gate-a"; secondGate.InstanceId = "gate-b";
            var emptyCapabilities = new Dictionary<string, Func<JsonObject, Task>>();
            firstGate.Initialize(emptyCapabilities); secondGate.Initialize(emptyCapabilities);
            await firstGate.Runtime!.Dispatch("quest", "toggleGate");
            if (firstGate.Runtime.Binding(gate, "solid", true) || !secondGate.Runtime!.Binding(gate, "solid", false))
                throw new Exception("Placed components share private runtime state");
            firstGate.QueueFree(); secondGate.QueueFree();
            GD.Print("WDL_SMOKE_OK spaces=5 gate=open chest=collected coins=1");
            GetTree().Quit();
        }
        catch (Exception error) { GD.PushError(error.ToString()); GetTree().Quit(1); }
    }
}
