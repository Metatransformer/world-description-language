/** @jsxImportSource react */
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WorldManifest, WorldObject } from "../wdl/types";
import type { ViewerCamera, ViewerCommand } from "../server/state";
import type { DungeonPlan, DungeonRoom } from "../dungeon/types";
import { DungeonMap, dungeonMapBounds } from "./DungeonMap";
import { ComponentBrowser } from "./ComponentBrowser";
import { CodeView } from "./CodeView";
import { SceneView } from "./SceneView";

type Summary = {
  revision: number;
  stale: boolean;
  compiling: boolean;
  diagnostics: Array<{ message: string; file?: string; line?: number }>;
  project?: {
    name: string;
    spaces: number;
    objects: number;
    connections: number;
  };
  session: { spaceId: string; selectedId?: string; camera: ViewerCamera };
  command?: ViewerCommand;
  lastNavigation?: ViewerCommand;
};
async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/${path}`, init);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? response.statusText);
  return data;
}
const post = <T,>(path: string, body: unknown = {}) =>
  api<T>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

export function WorldEditor() {
  const [componentBrowser, setComponentBrowser] = useState<{ name?: string }>();
  const [referenceView, setReferenceView] = useState<{
    title: string;
    content: string;
    kind: string;
  }>();
  const [summary, setSummary] = useState<Summary>();
  const [manifest, setManifest] = useState<WorldManifest>();
  const [spaceId, setSpaceId] = useState("outside");
  const [selectedId, setSelectedId] = useState<string>();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<{ file: string; content: string }>();
  const [notice, setNotice] = useState<string>();
  const [dungeonCutaway, setDungeonCutaway] = useState(true);
  const [returnTo, setReturnTo] = useState<{
    spaceId: string;
    targetId?: string;
  }>();
  const revision = useRef(0);
  const receivedNavigation = useRef(0);
  const refresh = useCallback(async () => {
    const next = await api<Summary>("state");
    const delivered = next.command ?? next.lastNavigation;
    setSummary({ ...next, command: delivered });
    if (!manifest || next.revision !== revision.current) {
      const world = await api<WorldManifest>("manifest");
      revision.current = next.revision;
      setManifest(world);
      setSpaceId((current) =>
        world.spaces.some((space) => space.id === current)
          ? current
          : next.session.spaceId,
      );
      setSelectedId((current) =>
        world.objects.some((object) => object.id === current)
          ? current
          : next.session.selectedId,
      );
    }
    if (delivered && delivered.id > receivedNavigation.current) {
      receivedNavigation.current = delivered.id;
      if (delivered.spaceId) setSpaceId(delivered.spaceId);
    }
  }, [manifest, spaceId]);
  useEffect(() => {
    void refresh().catch((error) => setNotice(error.message));
    const timer = setInterval(() => void refresh().catch(() => {}), 1000);
    return () => clearInterval(timer);
  }, [refresh]);
  const objects = useMemo(
    () =>
      manifest?.objects.filter((object) => object.spaceId === spaceId) ?? [],
    [manifest, spaceId],
  );
  const selected = manifest?.objects.find((object) => object.id === selectedId);
  const currentSpace = manifest?.spaces.find((space) => space.id === spaceId);
  const dungeonPlan =
    currentSpace?.properties.kind === "dungeon"
      ? (currentSpace.properties.dungeonPlan as DungeonPlan | undefined)
      : undefined;
  const selectedRoomId =
    selected?.type === "dungeon-room" &&
    typeof selected.properties.roomId === "string"
      ? selected.properties.roomId
      : undefined;
  const search = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      search
        ? objects
            .filter((object) =>
              `${object.name ?? ""} ${object.type} ${object.id}`
                .toLowerCase()
                .includes(search),
            )
            .slice(0, 80)
        : objects
            .filter(
              (object) =>
                !object.geometry || object.name ||
                [
                  "region",
                  "district",
                  "building",
                  "room",
                  "dungeon-entrance",
                ].includes(object.type),
            )
            .slice(0, 80),
    [objects, search],
  );
  useEffect(() => {
    if (!selected?.source) {
      setSource(undefined);
      return;
    }
    void api<{ file: string; content: string }>(
      `source?file=${encodeURIComponent(selected.source.file)}`,
    )
      .then(setSource)
      .catch((error) => setNotice(error.message));
  }, [selected]);
  const select = useCallback(
    (id?: string) => {
      setSelectedId(id);
      void post("viewer", { spaceId, selectedId: id ?? null });
    },
    [spaceId],
  );
  const focus = (object: WorldObject) => {
    select(object.id);
    void post("command", { kind: "navigate", spaceId, targetId: object.id });
  };
  const dungeonRoomObject = (room: DungeonRoom) =>
    objects.find(
      (object) =>
        object.type === "dungeon-room" &&
        object.properties.roomId === room.id,
    );
  const issueDungeonCamera = (
    room: DungeonRoom,
    camera: ViewerCamera,
  ) => {
    const object = dungeonRoomObject(room);
    if (!object) {
      setNotice(`Compiled room object is missing for ${room.name}.`);
      return;
    }
    setSelectedId(object.id);
    void post("command", {
      kind: "navigate",
      spaceId,
      targetId: object.id,
      camera,
    })
      .then(refresh)
      .catch((error) => setNotice(error.message));
  };
  const frameDungeonRoom = (room: DungeonRoom) => {
    const span = Math.max(room.size[0], room.size[2]);
    issueDungeonCamera(room, {
      position: [
        room.position[0] + span * 0.9,
        room.position[1] + room.size[1] + span * 0.5,
        room.position[2] + span * 0.9,
      ],
      target: [
        room.position[0],
        room.position[1] + room.size[1] * 0.45,
        room.position[2],
      ],
      mode: "orbit",
    });
  };
  const exploreDungeonRoom = (room: DungeonRoom) => {
    const corridor = dungeonPlan?.corridors.find(
      (item) => item.from === room.id || item.to === room.id,
    );
    const otherId = corridor
      ? corridor.from === room.id
        ? corridor.to
        : corridor.from
      : undefined;
    const other = dungeonPlan?.rooms.find((item) => item.id === otherId);
    const dx = (other?.position[0] ?? room.position[0]) - room.position[0];
    const dz = (other?.position[2] ?? room.position[2] - 1) - room.position[2];
    const length = Math.hypot(dx, dz) || 1;
    const eye: [number, number, number] = [
      room.position[0],
      room.position[1] + 2,
      room.position[2],
    ];
    issueDungeonCamera(room, {
      position: eye,
      target: [eye[0] + (dx / length) * 5, eye[1], eye[2] + (dz / length) * 5],
      mode: "fly",
    });
  };
  const overviewDungeon = () => {
    if (!dungeonPlan) return;
    const bounds = dungeonMapBounds(dungeonPlan);
    const center: [number, number, number] = [
      (bounds.minX + bounds.maxX) / 2,
      (bounds.minY + bounds.maxY) / 2,
      (bounds.minZ + bounds.maxZ) / 2,
    ];
    const span = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ, 20);
    setSelectedId(undefined);
    void post("command", {
      kind: "navigate",
      spaceId,
      camera: {
        position: [center[0] + span * 1.1, center[1] + span * 1.6, center[2] + span * 1.1],
        target: center,
        mode: "orbit",
      },
    })
      .then(refresh)
      .catch((error) => setNotice(error.message));
  };
  const switchSpace = (
    id: string,
    arrival?: readonly [number, number, number],
  ) => {
    setReturnTo({ spaceId, targetId: selectedId });
    setSpaceId(id);
    setSelectedId(undefined);
    void post("command", {
      kind: "navigate",
      spaceId: id,
      camera: arrival
        ? {
            position: [arrival[0], arrival[1], arrival[2]],
            target: [arrival[0], arrival[1], arrival[2] - 4],
          }
        : undefined,
    });
  };
  const connections =
    manifest?.connections.filter(
      (connection) =>
        connection.fromSpace === spaceId &&
        (!selectedId ||
          connection.fromObject === selectedId ||
          connection.id === selectedId),
    ) ?? [];
  if (!manifest || !summary)
    return (
      <main className="loading">
        <span className="sigil">G</span>
        <p>{notice ?? "Compiling Valenreach…"}</p>
      </main>
    );
  const sourceLines = source?.content.split("\n") ?? [],
    sourceLine = selected?.source?.line ?? 0;
  return (
    <main className="workbench">
      <header>
        <div className="brand">
          <span className="sigil">G</span>
          <div>
            <strong>Generative World Studio</strong>
            <small>JSX WORLD EXPLORER</small>
          </div>
        </div>
        <div className="project">
          <span>PROJECT</span>
          <strong>{manifest.name}</strong>
          <em>Local workspace</em>
        </div>
        <div className={`status ${summary.stale ? "bad" : ""}`}>
          <i />
          {summary.stale ? "STALE BUILD" : `COMPILED · r${summary.revision}`}
        </div>
        <button
          onClick={() =>
            void post<Summary>("compile")
              .then(setSummary)
              .catch((error) => setNotice(error.message))
          }
        >
          ↻ Recompile
        </button>
        <button onClick={() => setComponentBrowser({})}>Components</button>
        <button
          className="primary"
          onClick={() =>
            void post<{ manifestPath: string }>("export")
              .then((value) => setNotice(`Exported ${value.manifestPath}`))
              .catch((error) => setNotice(error.message))
          }
        >
          ⇩ Export
        </button>
      </header>
      <section className="main-grid">
        <aside className="left">
          <div className="panel-title">
            <span>WORLD</span>
            <b>{manifest.spaces.length} spaces</b>
          </div>
          <label className="search">
            <span>⌕</span>
            <input
              aria-label="Search world"
              placeholder="Search places & objects…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <div className="space-list">
            {manifest.spaces.map((space) => (
              <button
                className={space.id === spaceId ? "active" : ""}
                key={space.id}
                onClick={() => switchSpace(space.id)}
              >
                <span>◇</span>
                <span>
                  {space.name}
                  <small>
                    {
                      manifest.objects.filter(
                        (item) => item.spaceId === space.id,
                      ).length
                    }{" "}
                    objects
                  </small>
                </span>
              </button>
            ))}
          </div>
          <div className="panel-title objects">
            <span>{search ? "RESULTS" : "HIERARCHY"}</span>
            <b>
              {results.length}/{objects.length}
            </b>
          </div>
          <div className="object-list">
            {results.map((object) => (
              <button
                key={object.id}
                className={selectedId === object.id ? "active" : ""}
                style={{ paddingLeft: 12 + Math.min(object.id.split("/").length - 2, 5) * 12 }}
                onClick={() => focus(object)}
              >
                <span className="branch">{object.parentId ? "└" : "◆"}</span>
                <span>
                  {object.name ?? object.id.split("/").at(-1)}
                  <small>{object.type}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>
        <section className="viewport">
          <SceneView
            manifest={manifest}
            spaceId={spaceId}
            selectedId={selectedId}
            command={summary.command}
            initialCamera={summary.session.camera}
            onSelect={select}
            dungeonCutaway={Boolean(dungeonPlan && dungeonCutaway)}
            onCamera={(camera) =>
              void post("viewer", { spaceId, selectedId, camera })
            }
            onCommand={(id, camera) => {
              const nextSelected =
                summary.command?.kind === "select"
                  ? summary.command.targetId
                  : selectedId;
              if (nextSelected !== selectedId) setSelectedId(nextSelected);
              void post("viewer", {
                commandId: id,
                spaceId,
                selectedId: nextSelected,
                camera,
              }).then(refresh);
            }}
          />
          {dungeonPlan && currentSpace && (
            <DungeonMap
              name={currentSpace.name}
              plan={dungeonPlan}
              selectedRoomId={selectedRoomId}
              cutaway={dungeonCutaway}
              onCutawayChange={setDungeonCutaway}
              onRoomSelect={frameDungeonRoom}
              onExploreRoom={exploreDungeonRoom}
              onOverview={overviewDungeon}
            />
          )}
          <div className="viewport-top">
            <span>
              {manifest.spaces.find((space) => space.id === spaceId)?.name}
            </span>
            <b>{objects.length} OBJECTS</b>
          </div>
          <div className="controls">
            ORBIT: LEFT DRAG · PAN: RIGHT DRAG · ZOOM: WHEEL &nbsp;|&nbsp; FLY:
            WASD · Q/E · SHIFT · RIGHT-DRAG LOOK
          </div>
        </section>
        <aside className="right">
          <div className="panel-title">
            <span>INSPECTOR</span>
            <b>{selected ? selected.type : "Nothing selected"}</b>
          </div>
          {selected ? (
            <>
              <section className="identity">
                <span className="type">{selected.type.toUpperCase()}</span>
                <h2>{selected.name ?? selected.id.split("/").at(-1)}</h2>
                <code>{selected.id}</code>
              </section>
              <Inspector title="TRANSFORM">
                <dl>
                  <dt>Position</dt>
                  <dd>{selected.position.map(nice).join(" · ")}</dd>
                  <dt>Rotation</dt>
                  <dd>{selected.rotation.map(nice).join(" · ")}</dd>
                  <dt>Scale</dt>
                  <dd>{selected.scale.map(nice).join(" · ")}</dd>
                </dl>
              </Inspector>
              {Object.keys(selected.properties).length > 0 && (
                <Inspector title="PROPERTIES">
                  <pre>{JSON.stringify(selected.properties, null, 2)}</pre>
                </Inspector>
              )}
              {connections.length > 0 && (
                <Inspector title="CONNECTIONS">
                  {connections.map((connection) => (
                    <button
                      className="connection"
                      key={connection.id}
                      onClick={() =>
                        switchSpace(connection.toSpace, connection.arrival)
                      }
                    >
                      Follow to{" "}
                      <strong>
                        {manifest.spaces.find(
                          (space) => space.id === connection.toSpace,
                        )?.name ?? connection.toSpace}
                      </strong>{" "}
                      →
                    </button>
                  ))}
                </Inspector>
              )}
              <Inspector title="SOURCE">
                <div className="source-meta">
                  <span>
                    {source?.file ?? selected.source?.file ?? "Generated"}
                  </span>
                  <b>{sourceLine ? `Ln ${sourceLine}` : ""}</b>
                  {source && (
                    <button
                      onClick={() =>
                        setReferenceView({
                          title: source.file,
                          content: source.content,
                          kind: "source",
                        })
                      }
                    >
                      Open source
                    </button>
                  )}
                </div>
                {selected.source?.componentChain && (
                  <div className="chain">
                    {selected.source.componentChain.map((name, index) => <button key={`${name}-${index}`} onClick={() => setComponentBrowser({ name })}>{name}</button>)}
                  </div>
                )}
                <pre className="code">
                  {sourceLines
                    .slice(Math.max(0, sourceLine - 4), sourceLine + 3)
                    .map((line, index) => {
                      const number = Math.max(1, sourceLine - 3) + index;
                      return (
                        <span
                          className={number === sourceLine ? "hot" : ""}
                          key={number}
                        >
                          <i>{number}</i>
                          {line}
                        </span>
                      );
                    })}
                </pre>
                {selected.source?.components && (
                  <details>
                    <summary>Component inputs</summary>
                    <pre>
                      {JSON.stringify(selected.source.components, null, 2)}
                    </pre>
                  </details>
                )}
              </Inspector>
              {manifest.references.length > 0 && (
                <Inspector title="PROJECT REFERENCES">
                  {manifest.references.map((reference) => (
                    <button
                      className="reference"
                      key={reference.id}
                      onClick={() =>
                        void api<{ content: string }>(
                          `reference?uri=${encodeURIComponent(reference.uri)}`,
                        )
                          .then((value) =>
                            setReferenceView({
                              title: reference.title ?? reference.id,
                              content: value.content,
                              kind: reference.kind,
                            }),
                          )
                          .catch((error) => setNotice(error.message))
                      }
                    >
                      {reference.kind.includes("image") ? "▧" : "≡"}{" "}
                      {reference.title ?? reference.id}
                    </button>
                  ))}
                </Inspector>
              )}
            </>
          ) : (
            <div className="empty">
              <span>◇</span>
              <p>
                Select geometry in the viewport or choose an object from the
                hierarchy.
              </p>
              {connections.map((connection) => (
                <button
                  className="connection"
                  key={connection.id}
                  onClick={() =>
                    switchSpace(connection.toSpace, connection.arrival)
                  }
                >
                  Follow to{" "}
                  {
                    manifest.spaces.find(
                      (space) => space.id === connection.toSpace,
                    )?.name
                  }{" "}
                  →
                </button>
              ))}
            </div>
          )}
        </aside>
      </section>
      {componentBrowser && <ComponentBrowser initialName={componentBrowser.name} revision={summary.revision}
        onClose={() => setComponentBrowser(undefined)}
        onInspect={(id, targetSpace) => {
          setComponentBrowser(undefined);
          setSpaceId(targetSpace);
          setSelectedId(id);
          void post("command", { kind: "navigate", spaceId: targetSpace, targetId: id }).then(refresh);
        }} />}
      {referenceView && (
        <div
          className="reference-modal"
          role="dialog"
          aria-label={referenceView.title}
        >
          <section>
            <button onClick={() => setReferenceView(undefined)}>Close ×</button>
            <h2>{referenceView.title}</h2>
            {referenceView.kind.includes("image") ? (
              <img
                alt={referenceView.title}
                src={`data:image/svg+xml,${encodeURIComponent(referenceView.content)}`}
              />
            ) : referenceView.kind === "source" ? (
              <CodeView code={referenceView.content} />
            ) : (
              <pre>{referenceView.content}</pre>
            )}
          </section>
        </div>
      )}
      <footer>
        <div>
          <span className={summary.stale ? "error-dot" : "ok-dot"} />
          BUILD DIAGNOSTICS{" "}
          <b>
            {summary.diagnostics.length
              ? `${summary.diagnostics.length} issues`
              : "No issues"}
          </b>
        </div>
        {summary.diagnostics[0] && (
          <strong>
            {summary.diagnostics[0].file}
            {summary.diagnostics[0].line
              ? `:${summary.diagnostics[0].line}`
              : ""}{" "}
            — {summary.diagnostics[0].message}
          </strong>
        )}
        {returnTo && (
          <button
            onClick={() => {
              setSpaceId(returnTo.spaceId);
              setSelectedId(returnTo.targetId);
              setReturnTo(undefined);
              void post("command", {
                kind: "navigate",
                spaceId: returnTo.spaceId,
                targetId: returnTo.targetId,
              });
            }}
          >
            ← Return to previous space
          </button>
        )}
        {notice && (
          <button className="notice" onClick={() => setNotice(undefined)}>
            {notice} ×
          </button>
        )}
      </footer>
    </main>
  );
}
function Inspector({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="inspector-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}
function nice(value: number) {
  return Number(value.toFixed(2));
}
