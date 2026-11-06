/** @jsxImportSource react */
"use client";
import { useMemo, useState } from "react";
import type { DungeonPlan, DungeonRoom } from "../dungeon/types";

export function DungeonMap({
  name,
  plan,
  selectedRoomId,
  cutaway,
  onCutawayChange,
  onRoomSelect,
  onExploreRoom,
  onOverview,
}: {
  name: string;
  plan: DungeonPlan;
  selectedRoomId?: string;
  cutaway: boolean;
  onCutawayChange: (value: boolean) => void;
  onRoomSelect: (room: DungeonRoom) => void;
  onExploreRoom: (room: DungeonRoom) => void;
  onOverview: () => void;
}) {
  const [level, setLevel] = useState<number | "all">("all");
  const bounds = useMemo(() => dungeonMapBounds(plan), [plan]);
  const width = 260;
  const height = 190;
  const padding = 15;
  const scale = Math.min(
    (width - padding * 2) / Math.max(1, bounds.maxX - bounds.minX),
    (height - padding * 2) / Math.max(1, bounds.maxZ - bounds.minZ),
  );
  const point = ([x, , z]: readonly [number, number, number]) =>
    `${padding + (x - bounds.minX) * scale},${padding + (z - bounds.minZ) * scale}`;
  const visibleRooms = plan.rooms.filter(
    (room) => level === "all" || room.level === level,
  );
  const visibleIds = new Set(visibleRooms.map((room) => room.id));
  const selectedRoom = plan.rooms.find((room) => room.id === selectedRoomId);

  return (
    <section className="dungeon-panel" aria-label={`Dungeon map: ${name}`}>
      <div className="dungeon-heading">
        <div>
          <small>{plan.theme} dungeon</small>
          <h2>{name}</h2>
        </div>
        <button onClick={onOverview}>Overview</button>
      </div>
      <div className="dungeon-stats" aria-label="Dungeon statistics">
        <span>{plan.stats.roomCount} rooms</span>
        <span>{plan.stats.loopCount} loops</span>
        <span>{plan.stats.levelCount} levels</span>
        <span>{plan.corridors.filter((corridor) => corridor.kind === "stairs").length} stairs</span>
      </div>
      <div className="dungeon-seed">Seed {plan.seed} · plan {plan.version}</div>
      {plan.stats.levelCount > 1 && (
        <div className="level-tabs" role="group" aria-label="Dungeon level">
          <button className={level === "all" ? "active" : ""} onClick={() => setLevel("all")}>All levels</button>
          {Array.from({ length: plan.stats.levelCount }, (_, index) => (
            <button className={level === index ? "active" : ""} key={index} onClick={() => setLevel(index)}>
              Level {index + 1}
            </button>
          ))}
        </div>
      )}
      <svg className="dungeon-map" viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Clickable dungeon floorplan">
        {plan.corridors.map((corridor) => {
          const shown = visibleIds.has(corridor.from) || visibleIds.has(corridor.to);
          if (!shown) return null;
          return (
            <polyline
              key={corridor.id}
              points={corridor.path.map(point).join(" ")}
              className={`${corridor.annotation === "critical-path" ? "critical" : ""} ${corridor.kind === "stairs" ? "stairs" : ""}`}
              aria-label={`${corridor.kind} ${corridor.annotation}`}
            />
          );
        })}
        {visibleRooms.map((room) => {
          const x = padding + (room.position[0] - room.size[0] / 2 - bounds.minX) * scale;
          const y = padding + (room.position[2] - room.size[2] / 2 - bounds.minZ) * scale;
          const entry = room.id === plan.entryRoom;
          const goal = room.id === plan.goalRoom;
          const label = `${room.name}, ${room.role}, level ${room.level + 1}${entry ? ", entry" : ""}${goal ? ", goal" : ""}`;
          return (
            <g
              key={room.id}
              role="button"
              tabIndex={0}
              aria-label={label}
              className={`dungeon-room ${selectedRoomId === room.id ? "selected" : ""} ${entry ? "entry" : ""} ${goal ? "goal" : ""} level-${room.level}`}
              onClick={() => onRoomSelect(room)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRoomSelect(room);
                }
              }}
            >
              <title>{label}</title>
              <rect x={x} y={y} width={Math.max(7, room.size[0] * scale)} height={Math.max(7, room.size[2] * scale)} rx="2" />
              {(entry || goal) && <text x={x + 4} y={y + 11}>{entry ? "E" : "G"}</text>}
            </g>
          );
        })}
      </svg>
      <div className="dungeon-actions">
        <label>
          <input type="checkbox" checked={cutaway} onChange={(event) => onCutawayChange(event.target.checked)} />
          Ceiling cutaway
        </label>
        <button disabled={!selectedRoom} onClick={() => selectedRoom && onExploreRoom(selectedRoom)}>
          Explore room
        </button>
      </div>
    </section>
  );
}

export function dungeonMapBounds(plan: DungeonPlan) {
  const xs = plan.rooms.flatMap((room) => [room.position[0] - room.size[0] / 2, room.position[0] + room.size[0] / 2]);
  const ys = plan.rooms.flatMap((room) => [room.position[1], room.position[1] + room.size[1]]);
  const zs = plan.rooms.flatMap((room) => [room.position[2] - room.size[2] / 2, room.position[2] + room.size[2] / 2]);
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
    minZ: Math.min(...zs), maxZ: Math.max(...zs),
  };
}
