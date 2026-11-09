import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import {
  compileProject,
  writeWorldArtifacts,
  WdlCompileError,
  type WorldManifest,
} from "../wdl/index";

const ROOT = resolve(process.cwd());
const ENTRY = resolve(ROOT, process.env.WDL_ENTRY ?? "worlds/valenreach.tsx");
const SOURCE_ROOTS = [resolve(ROOT, "worlds"), resolve(ROOT, "src/wdl"), resolve(ROOT, "src/dungeon"), resolve(ROOT, "src/runtime")];

export type ViewerCamera = {
  position: [number, number, number];
  target: [number, number, number];
  mode?: "orbit" | "fly";
};
export type ViewerCommand = {
  id: number;
  kind: "navigate" | "select" | "capture";
  spaceId?: string;
  targetId?: string;
  camera?: Partial<ViewerCamera>;
};
export type DiagnosticView = {
  message: string;
  file?: string;
  line?: number;
  column?: number;
};

type CaptureWaiter = {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timer: NodeJS.Timeout;
};
class WdlSession {
  manifest?: WorldManifest;
  revision = 0;
  fingerprint = "";
  stale = false;
  compiling = false;
  diagnostics: DiagnosticView[] = [];
  spaceId = "outside";
  selectedId?: string;
  camera: ViewerCamera = {
    position: [115, 95, 125],
    target: [0, 0, 8],
    mode: "orbit",
  };
  command?: ViewerCommand;
  lastNavigation?: ViewerCommand;
  private commandId = 0;
  private compileWork?: Promise<void>;
  private captures = new Map<number, CaptureWaiter>();

  async ensureFresh(force = false) {
    if (this.compileWork) return this.compileWork;
    this.compileWork = (async () => {
      const nextFingerprint = await sourceFingerprint();
      if (!force && nextFingerprint === this.fingerprint) return;
      this.compiling = true;
      try {
        const next = await compileProject(ENTRY);
        this.manifest = next;
        this.fingerprint = nextFingerprint;
        this.revision++;
        this.stale = false;
        this.diagnostics = [];
        if (!next.spaces.some((space) => space.id === this.spaceId))
          this.spaceId = next.spaces[0]?.id ?? "outside";
        if (
          this.selectedId &&
          !next.objects.some((object) => object.id === this.selectedId)
        )
          this.selectedId = undefined;
      } catch (error) {
        this.fingerprint = nextFingerprint;
        this.stale = Boolean(this.manifest);
        this.diagnostics = normalizeError(error);
        if (!this.manifest) throw error;
      } finally {
        this.compiling = false;
      }
    })().finally(() => {
      this.compileWork = undefined;
    });
    return this.compileWork;
  }

  summary() {
    const manifest = this.manifest;
    return {
      revision: this.revision,
      stale: this.stale,
      compiling: this.compiling,
      diagnostics: this.diagnostics,
      project: manifest
        ? {
            name: manifest.name,
            spaces: manifest.spaces.length,
            objects: manifest.objects.length,
            connections: manifest.connections.length,
          }
        : undefined,
      session: {
        spaceId: this.spaceId,
        selectedId: this.selectedId,
        camera: this.camera,
      },
      command: this.command,
      lastNavigation: this.lastNavigation,
    };
  }

  issue(command: Omit<ViewerCommand, "id">) {
    if (
      command.spaceId &&
      !this.manifest?.spaces.some((space) => space.id === command.spaceId)
    )
      throw new Error(`Unknown space: ${command.spaceId}`);
    if (command.targetId) {
      const object = this.manifest?.objects.find(
        (object) => object.id === command.targetId,
      );
      if (!object) throw new Error(`Unknown object: ${command.targetId}`);
      command = { ...command, spaceId: object.spaceId };
    }
    this.command = { ...command, id: ++this.commandId };
    if (command.kind !== "capture") this.lastNavigation = this.command;
    return this.command;
  }
  acknowledge(
    id: number,
    update: { spaceId?: string; selectedId?: string; camera?: ViewerCamera },
  ) {
    if (update.spaceId) this.spaceId = update.spaceId;
    if ("selectedId" in update) this.selectedId = update.selectedId;
    if (update.camera) this.camera = update.camera;
    if (this.command?.id === id && this.command.kind !== "capture")
      this.command = undefined;
  }
  updateViewer(update: {
    spaceId?: string;
    selectedId?: string;
    camera?: ViewerCamera;
  }) {
    this.acknowledge(-1, update);
  }

  capture(timeoutMs = 8000): Promise<string> {
    const command = this.issue({ kind: "capture" });
    return new Promise((resolveCapture, reject) => {
      const timer = setTimeout(() => {
        this.captures.delete(command.id);
        if (this.command?.id === command.id) this.command = undefined;
        reject(
          new Error(
            "No browser viewer responded to capture within 8 seconds. Open the WDL viewer and try again.",
          ),
        );
      }, timeoutMs);
      this.captures.set(command.id, { resolve: resolveCapture, reject, timer });
    });
  }
  finishCapture(id: number, dataUrl: string) {
    const waiter = this.captures.get(id);
    if (!waiter) return false;
    clearTimeout(waiter.timer);
    this.captures.delete(id);
    if (this.command?.id === id) this.command = undefined;
    waiter.resolve(dataUrl);
    return true;
  }
  async export() {
    if (!this.manifest || this.stale)
      throw new Error("Export requires a current successful compilation.");
    return writeWorldArtifacts(this.manifest, resolve(ROOT, ".wdl/export"));
  }
}

async function filesUnder(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? filesUnder(resolve(dir, entry.name))
        : [resolve(dir, entry.name)],
    ),
  );
  return nested.flat().filter((file) => /\.(tsx?|json|md|svg)$/.test(file));
}
async function sourceFingerprint() {
  const files = (await Promise.all(SOURCE_ROOTS.map(filesUnder))).flat().sort();
  const hash = createHash("sha256");
  for (const file of files) {
    const info = await stat(file);
    hash.update(`${relative(ROOT, file)}:${info.size}:${info.mtimeMs};`);
  }
  return hash.digest("hex");
}
function normalizeError(error: unknown): DiagnosticView[] {
  if (error instanceof WdlCompileError)
    return error.diagnostics.map((item) => ({
      message: `${item.code}: ${item.message}`,
      file: item.source?.file ?? item.path,
      line: item.source?.line,
      column: item.source?.column,
    }));
  const message = error instanceof Error ? error.message : String(error);
  const location = message.match(/([^\s:]+\.(?:ts|tsx)):(\d+):(\d+)/);
  return [
    {
      message,
      file: location?.[1],
      line: location ? Number(location[2]) : undefined,
      column: location ? Number(location[3]) : undefined,
    },
  ];
}
export function safeProjectPath(input: string) {
  const path = resolve(ROOT, input);
  const allowed = SOURCE_ROOTS.some(
    (root) => path === root || path.startsWith(`${root}${sep}`),
  );
  if (!allowed)
    throw new Error("Source path is outside WDL project source roots.");
  return path;
}
export async function readProjectSource(input: string) {
  const path = safeProjectPath(input);
  return { file: relative(ROOT, path), content: await readFile(path, "utf8") };
}

declare global {
  var __wdlSession: WdlSession | undefined;
}
export const session = (globalThis.__wdlSession ??= new WdlSession());
