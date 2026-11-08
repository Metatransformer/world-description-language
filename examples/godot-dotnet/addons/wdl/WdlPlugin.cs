#if TOOLS
using Godot;
using System;
using System.Diagnostics;
using System.IO;
using System.Threading;

namespace Wdl;

[Tool]
public partial class WdlPlugin : EditorPlugin
{
    private VBoxContainer _dock = null!;
    private Label _status = null!;
    private LineEdit _node = null!;
    private LineEdit _repository = null!;
    private LineEdit _entry = null!;
    private Process? _process;
    private int _completed;
    private int _exitCode;
    private bool _watch;
    private string _revision = "";
    public override void _EnterTree()
    {
        _dock = new VBoxContainer { Name = "WDL" };
        _dock.AddChild(new Label { Text = "WDL / JSX world builds" });
        _node = new LineEdit { Text = "node", PlaceholderText = "Node executable" };
        _repository = new LineEdit { Text = Path.GetFullPath(Path.Combine(ProjectSettings.GlobalizePath("res://"), "../..")), PlaceholderText = "WDL repository directory" };
        _dock.AddChild(_node);
        _dock.AddChild(_repository);
        _entry = new LineEdit { Text = "worlds/rpg.tsx", PlaceholderText = "JSX entry relative to repository" };
        _dock.AddChild(_entry);
        AddButton("Build Changed", () => StartBuild(false, false));
        AddButton("Build All", () => StartBuild(true, false));
        var watch = new CheckButton { Text = "Watch (off by default)" };
        watch.Toggled += enabled => { Stop(); if (enabled) StartBuild(false, true); };
        _dock.AddChild(watch);
        AddButton("Import latest successful build", Import);
        _status = new Label { Text = "Ready. Generated internals are owned by JSX.", AutowrapMode = TextServer.AutowrapMode.WordSmart };
        _dock.AddChild(_status);
        AddControlToDock(DockSlot.RightUl, _dock);
        SetProcess(true);
    }
    private void AddButton(string text, Action callback)
    {
        var button = new Button { Text = text };
        button.Pressed += callback;
        _dock.AddChild(button);
    }
    private void StartBuild(bool all, bool watch)
    {
        if (_process != null) { _status.Text = "A build/watch is active. Turn Watch off first."; return; }
        try
        {
            var info = new ProcessStartInfo(_node.Text) { WorkingDirectory = _repository.Text, UseShellExecute = false, CreateNoWindow = true };
            info.ArgumentList.Add("--import"); info.ArgumentList.Add("tsx"); info.ArgumentList.Add("scripts/build-game.ts");
            info.ArgumentList.Add("--entry"); info.ArgumentList.Add(_entry.Text);
            info.ArgumentList.Add("--out"); info.ArgumentList.Add(ProjectSettings.GlobalizePath("res://generated"));
            if (all) info.ArgumentList.Add("--all");
            if (watch) info.ArgumentList.Add("--watch");
            _process = new Process { StartInfo = info, EnableRaisingEvents = true };
            _process.Exited += (_, _) => { _exitCode = _process?.ExitCode ?? -1; Interlocked.Exchange(ref _completed, 1); };
            _watch = watch;
            _process.Start();
            _status.Text = watch ? "Watching dependencies…" : "Building…";
        }
        catch (Exception error) { Stop(); _status.Text = error.Message; }
    }
    public override void _Process(double delta)
    {
        if (Interlocked.Exchange(ref _completed, 0) == 1)
        {
            _process?.Dispose(); _process = null;
            if (_exitCode == 0) Import(); else _status.Text = "Build failed. Previous assets retained; see output.";
        }
        if (_watch && Godot.FileAccess.FileExists("res://generated/revision.txt"))
        {
            var revision = Godot.FileAccess.GetFileAsString("res://generated/revision.txt");
            if (revision != _revision) Import();
        }
    }
    private void Import()
    {
        try
        {
            var revision = Godot.FileAccess.GetFileAsString("res://generated/revision.txt");
            if (revision == _revision) { _status.Text = "No changed assets."; return; }
            SceneImporter.Import();
            _revision = revision;
            EditorInterface.Singleton.GetResourceFilesystem().Scan();
            _status.Text = "Imported spaces and components into generated/scenes.";
        }
        catch (Exception error) { _status.Text = error.Message; GD.PushError(error.ToString()); }
    }
    private void Stop()
    {
        _watch = false;
        if (_process != null) { if (!_process.HasExited) _process.Kill(true); _process.Dispose(); _process = null; }
        Interlocked.Exchange(ref _completed, 0);
    }
    public override void _ExitTree() { Stop(); RemoveControlFromDocks(_dock); _dock.QueueFree(); }
}
#endif
