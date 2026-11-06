import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readProjectSource, session } from "@/server/state";

export const runtime = "nodejs";
const commandSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("navigate"),
    spaceId: z.string().optional(),
    targetId: z.string().optional(),
    camera: z
      .object({
        position: z.tuple([z.number(), z.number(), z.number()]).optional(),
        target: z.tuple([z.number(), z.number(), z.number()]).optional(),
        mode: z.enum(["orbit", "fly"]).optional(),
      })
      .optional(),
  }),
  z.object({
    kind: z.literal("select"),
    targetId: z.string(),
    spaceId: z.string().optional(),
  }),
]);
const viewerSchema = z.object({
  commandId: z.number().int().optional(),
  spaceId: z.string().optional(),
  selectedId: z.string().optional().nullable(),
  camera: z
    .object({
      position: z.tuple([z.number(), z.number(), z.number()]),
      target: z.tuple([z.number(), z.number(), z.number()]),
      mode: z.enum(["orbit", "fly"]).optional(),
    })
    .optional(),
});

function leaf(params: { path?: string[] }) {
  return params.path?.join("/") ?? "state";
}
async function ready() {
  await session.ensureFresh();
  if (!session.manifest)
    throw new Error("No successful world compilation is available.");
}
function jsonError(error: unknown, status = 400) {
  return NextResponse.json(
    { error: error instanceof Error ? error.message : String(error) },
    { status },
  );
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const path = leaf(await context.params);
    await ready();
    if (path === "state") return NextResponse.json(session.summary());
    if (path === "manifest") return NextResponse.json(session.manifest);
    if (path === "source" || path === "reference")
      return NextResponse.json(
        await readProjectSource(
          request.nextUrl.searchParams.get(
            path === "source" ? "file" : "uri",
          ) ?? "",
        ),
      );
    return jsonError(new Error(`Unknown endpoint ${path}`), 404);
  } catch (error) {
    return jsonError(error, 500);
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path?: string[] }> },
) {
  try {
    const path = leaf(await context.params);
    const body: unknown = await request.json().catch(() => ({}));
    if (path === "compile") {
      await session.ensureFresh(true);
      return NextResponse.json(session.summary());
    }
    if (path === "export") {
      await ready();
      return NextResponse.json(await session.export());
    }
    if (path === "capture/request") {
      await ready();
      return NextResponse.json({ dataUrl: await session.capture() });
    }
    if (path === "command") {
      await ready();
      return NextResponse.json(session.issue(commandSchema.parse(body)));
    }
    if (path === "viewer") {
      const value = viewerSchema.parse(body);
      const update = {
        spaceId: value.spaceId,
        selectedId: value.selectedId ?? undefined,
        camera: value.camera,
      };
      value.commandId
        ? session.acknowledge(value.commandId, update)
        : session.updateViewer(update);
      return NextResponse.json({ ok: true });
    }
    if (path === "capture") {
      const value = z
        .object({
          commandId: z.number().int(),
          dataUrl: z.string().startsWith("data:image/").max(15_000_000),
        })
        .parse(body);
      return NextResponse.json({
        ok: session.finishCapture(value.commandId, value.dataUrl),
      });
    }
    return jsonError(new Error(`Unknown endpoint ${path}`), 404);
  } catch (error) {
    return jsonError(error);
  }
}
