import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import type { WorldManifest } from "../wdl/types.js";

const base = (process.env.WDL_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${base}/api/${path}`, init);
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new Error(data.error ?? `WDL HTTP ${response.status}`);
  return data;
}
const post = <T>(path: string, body: unknown = {}) =>
  request<T>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const text = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});
async function viewerCommand(body: unknown) {
  const command = await post<{ id: number }>("command", body);
  for (let attempt = 0; attempt < 80; attempt++) {
    const state = await request<{ command?: { id: number }; session: unknown }>(
      "state",
    );
    if (!state.command)
      return { ...command, acknowledged: true, session: state.session };
    if (state.command.id !== command.id)
      throw new Error("Viewer command was superseded before acknowledgment");
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(
    "No viewer acknowledged the command. Open the WDL browser and try again.",
  );
}
async function manifest() {
  return request<WorldManifest>("manifest");
}

const server = new McpServer(
  { name: "wdl", version: "0.1.0" },
  { capabilities: { logging: {} } },
);
server.registerTool(
  "wdl_compile",
  {
    description:
      "Compile the WDL project and return build status and diagnostics.",
  },
  async () => text(await post("compile")),
);
server.registerTool(
  "wdl_query",
  {
    description:
      "Query bounded objects or spaces from the current compiled manifest.",
    inputSchema: {
      space: z.string().optional(),
      name: z.string().optional(),
      type: z.string().optional(),
      object: z.string().optional(),
      limit: z.number().int().min(1).max(200).default(50),
    },
  },
  async ({ space, name, type, object, limit }) => {
    const world = await manifest(),
      needle = name?.toLowerCase();
    const objects = world.objects
      .filter(
        (item) =>
          (!space || item.spaceId === space) &&
          (!needle || (item.name ?? "").toLowerCase().includes(needle)) &&
          (!type || item.type === type) &&
          (!object || item.id === object || item.id.includes(object)),
      )
      .slice(0, limit)
      .map(({ geometry: _geometry, matrix: _matrix, ...item }) => item);
    return text({
      world: world.name,
      spaces: world.spaces.filter((item) => !space || item.id === space),
      count: objects.length,
      objects,
    });
  },
);
server.registerTool(
  "wdl_inspect",
  {
    description:
      "Inspect an object's properties, provenance source, relationships, and connections.",
    inputSchema: { object: z.string().min(1) },
  },
  async ({ object }) => {
    const world = await manifest();
    const item = world.objects.find((candidate) => candidate.id === object);
    if (!item) throw new Error(`Object not found: ${object}`);
    const relationships = world.relationships.filter(
      (relation) => relation.from === object || relation.to === object,
    );
    const connections = world.connections.filter(
      (connection) => connection.fromObject === object,
    );
    const source = item.source
      ? await request<{ file: string; content: string }>(
          `source?file=${encodeURIComponent(item.source.file)}`,
        )
      : undefined;
    const lines =
      source && item.source
        ? source.content
            .split("\n")
            .slice(Math.max(0, item.source.line - 4), item.source.line + 3)
        : undefined;
    return text({
      object: item,
      relationships,
      connections,
      source: source
        ? { file: source.file, line: item.source?.line, excerpt: lines }
        : undefined,
    });
  },
);
server.registerTool(
  "wdl_navigate",
  {
    description:
      "Command the open viewer to switch space and move its actual camera.",
    inputSchema: {
      space: z.string().optional(),
      target: z.string().optional(),
      position: z.tuple([z.number(), z.number(), z.number()]).optional(),
      lookAt: z.tuple([z.number(), z.number(), z.number()]).optional(),
      mode: z.enum(["orbit", "fly"]).optional(),
    },
  },
  async ({ space, target, position, lookAt, mode }) =>
    text(
      await viewerCommand({
        kind: "navigate",
        spaceId: space,
        targetId: target,
        camera: { position, target: lookAt, mode },
      }),
    ),
);
server.registerTool(
  "wdl_select",
  {
    description: "Select and highlight a real object in the open viewer.",
    inputSchema: { object: z.string().min(1), space: z.string().optional() },
  },
  async ({ object, space }) =>
    text(
      await viewerCommand({ kind: "select", targetId: object, spaceId: space }),
    ),
);
server.registerTool(
  "wdl_capture",
  { description: "Capture the open viewer's current canvas as a PNG image." },
  async () => {
    const { dataUrl } = await post<{ dataUrl: string }>("capture/request");
    const match = dataUrl.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if (!match) throw new Error("Viewer returned an invalid image payload.");
    return {
      content: [
        { type: "image" as const, mimeType: match[1]!, data: match[2]! },
      ],
    };
  },
);
server.registerTool(
  "wdl_export",
  {
    description:
      "Export the current non-stale successful build to .wdl/export.",
  },
  async () => text(await post("export")),
);

await server.connect(new StdioServerTransport());
