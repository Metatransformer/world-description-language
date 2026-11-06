import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { resolve } from "node:path";

const enabled = process.env.WDL_MCP_INTEGRATION === "1";
describe.skipIf(!enabled)("WDL MCP live integration", () => {
  let client: Client;
  let transport: StdioClientTransport;
  beforeAll(async () => {
    client = new Client({ name: "wdl-test", version: "1" });
    transport = new StdioClientTransport({
      command: process.execPath,
      args: ["--import", "tsx", resolve("src/server/mcp.ts")],
      cwd: process.cwd(),
      env: {
        ...process.env,
        WDL_URL: process.env.WDL_URL ?? "http://127.0.0.1:3000",
      } as Record<string, string>,
    });
    await client.connect(transport);
  });
  afterAll(async () => {
    await client?.close();
  });
  test("lists all public tools and compiles", async () => {
    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        "wdl_compile",
        "wdl_query",
        "wdl_inspect",
        "wdl_navigate",
        "wdl_select",
        "wdl_capture",
        "wdl_export",
      ]),
    );
    const result = await client.callTool({
      name: "wdl_compile",
      arguments: {},
    });
    expect(result.isError).not.toBe(true);
    expect(JSON.stringify(result.content)).toContain("revision");
  });
  test("queries and inspects actual compiled objects", async () => {
    const query = await client.callTool({
      name: "wdl_query",
      arguments: { name: "Lume River", limit: 5 },
    });
    const value = JSON.stringify(query.content);
    expect(value).toContain("Lume River");
    const id = value.match(/outside[^"\\]*lume-river/i)?.[0];
    expect(id).toBeTruthy();
    const inspect = await client.callTool({
      name: "wdl_inspect",
      arguments: { object: id },
    });
    expect(JSON.stringify(inspect.content)).toContain("source");
  });
});
