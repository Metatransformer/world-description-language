import { z } from "zod";
import type {
  CreateDungeonPlanOptions,
  DoorSide,
  DungeonCorridor,
  DungeonDoor,
  DungeonPlan,
  DungeonRoom,
  DungeonRoomRole,
  DungeonValidationReport,
  Vec3,
} from "./types.js";

const optionsSchema = z
  .object({
    seed: z.string().min(1, "seed must not be empty"),
    theme: z.enum(["crypt", "cistern"]),
    roomCount: z.number().int().min(8).max(24),
    levels: z.union([z.literal(1), z.literal(2)]),
    loopCount: z.number().int().min(0),
    corridorWidth: z.number().min(3).max(6).default(4),
  })
  .superRefine((value, context) => {
    const maximum = Math.floor(value.roomCount / 3);
    if (value.loopCount > maximum)
      context.addIssue({
        code: "custom",
        path: ["loopCount"],
        message: `loopCount ${value.loopCount} is impossible for ${value.roomCount} rooms; maximum is ${maximum}`,
      });
  });

type Cell = { x: number; z: number; level: number; order: number };
type Edge = { a: Cell; b: Cell; kind: "corridor" | "stairs"; loop: boolean };

function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function random(seed: string): () => number {
  let state = hash(seed);
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const key = (cell: Pick<Cell, "x" | "z" | "level">) =>
  `${cell.level}:${cell.x}:${cell.z}`;
const roomId = (cell: Cell) =>
  `room-l${cell.level}-x${cell.x < 0 ? "n" : "p"}${Math.abs(cell.x)}-z${cell.z < 0 ? "n" : "p"}${Math.abs(cell.z)}`;

function wing(count: number, startX: number, level: number, startOrder: number): Cell[] {
  const width = Math.floor(Math.sqrt(count));
  return Array.from({ length: count }, (_, order) => ({
    x: startX + (order % width),
    z: -Math.floor(order / width),
    level,
    order: startOrder + order,
  }));
}

function buildCells(roomCount: number, levels: 1 | 2): Cell[] {
  if (levels === 1) return wing(roomCount, 0, 0, 0);
  const lowerCount = Math.ceil(roomCount / 2);
  const upper = wing(lowerCount, 0, 0, 0);
  const upperWidth = Math.floor(Math.sqrt(lowerCount));
  const lower = wing(roomCount - lowerCount, upperWidth, 1, lowerCount);
  return [...upper, ...lower];
}

function shuffled<T>(values: T[], rng: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

function buildEdges(cells: Cell[], levels: 1 | 2, loopCount: number, rng: () => number): Edge[] {
  const byKey = new Map(cells.map((cell) => [key(cell), cell]));
  const tree: Edge[] = [];
  // Grow a seeded spanning tree within each wing. Cell identities stay stable,
  // while door choices and routes vary even when no extra loops are requested.
  for (let level = 0; level < levels; level++) {
    const wingCells = cells.filter((cell) => cell.level === level);
    const visited = new Set([key(wingCells[0]!)]);
    while (visited.size < wingCells.length) {
      const frontier = wingCells.flatMap((a) => visited.has(key(a))
        ? wingCells.filter((b) => !visited.has(key(b)) && Math.abs(a.x - b.x) + Math.abs(a.z - b.z) === 1)
          .map((b) => ({ a, b, kind: "corridor" as const, loop: false }))
        : []);
      const edge = frontier[Math.floor(rng() * frontier.length)]!;
      if (!edge) throw new Error("Dungeon wing has no connected frontier");
      tree.push(edge);
      visited.add(key(edge.b));
    }
  }
  if (levels === 2) {
    const upper = cells.filter((cell) => cell.level === 0);
    const lower = cells.filter((cell) => cell.level === 1);
    const a = upper.filter((cell) => lower.some((other) => other.x === cell.x + 1 && other.z === cell.z)).at(-1);
    const b = a && lower.find((cell) => cell.x === a.x + 1 && cell.z === a.z);
    if (!a || !b) throw new Error("Unable to place inter-level stair boundary");
    tree.push({ a, b, kind: "stairs", loop: false });
  }
  const used = new Set(tree.map((edge) => [key(edge.a), key(edge.b)].sort().join("|")));
  const candidates: Edge[] = [];
  for (const cell of cells) {
    for (const [dx, dz] of [
      [1, 0],
      [0, 1],
    ] as const) {
      const adjacent = byKey.get(`${cell.level}:${cell.x + dx}:${cell.z + dz}`);
      if (!adjacent) continue;
      const edgeKey = [key(cell), key(adjacent)].sort().join("|");
      if (!used.has(edgeKey)) candidates.push({ a: cell, b: adjacent, kind: "corridor", loop: true });
    }
  }
  if (levels === 2) {
    const upper = cells.filter((cell) => cell.level === 0);
    const lower = cells.filter((cell) => cell.level === 1);
    for (const a of upper) {
      for (const b of lower) {
        if (Math.abs(a.x - b.x) + Math.abs(a.z - b.z) !== 1) continue;
        const edgeKey = [key(a), key(b)].sort().join("|");
        if (!used.has(edgeKey)) candidates.push({ a, b, kind: "stairs", loop: true });
      }
    }
  }
  if (candidates.length < loopCount)
    throw new Error(`loopCount ${loopCount} is impossible for the generated grid; only ${candidates.length} shortcuts fit`);
  return [...tree, ...shuffled(candidates, rng).slice(0, loopCount)];
}

function roomRole(theme: "crypt" | "cistern", index: number): DungeonRoomRole {
  const roles: DungeonRoomRole[] =
    theme === "crypt"
      ? ["crypt", "gallery", "story-alcove", "storage", "treasure-alcove", "sanctuary"]
      : ["cistern", "gallery", "storage", "story-alcove", "treasure-alcove", "cistern"];
  return roles[index % roles.length]!;
}

const roleNames: Record<"crypt" | "cistern", Record<DungeonRoomRole, string>> = {
  crypt: {
    entry: "Ashen Threshold",
    hub: "Hall of Processions",
    crypt: "Carved Sepulcher",
    storage: "Embalmers' Store",
    gallery: "Ancestor Gallery",
    cistern: "Dry Well Chamber",
    sanctuary: "Oath Sanctuary",
    "treasure-alcove": "Ochre Reliquary",
    "story-alcove": "Ossuary Chronicle",
    landmark: "Ritual Hearth of Names",
  },
  cistern: {
    entry: "Drainward Vestibule",
    hub: "Confluence Walk",
    crypt: "Buried Sluice",
    storage: "Dry Maintenance Store",
    gallery: "Gauge Gallery",
    cistern: "Settling Basin",
    sanctuary: "Waterward Shrine",
    "treasure-alcove": "Inspectors' Cache",
    "story-alcove": "Flood-Marks Archive",
    landmark: "Great Pump and Valve",
  },
};

function sideBetween(a: Vec3, b: Vec3): DoorSide {
  if (Math.abs(b[0] - a[0]) > Math.abs(b[2] - a[2])) return b[0] > a[0] ? "east" : "west";
  return b[2] > a[2] ? "south" : "north";
}

function socket(room: DungeonRoom, side: DoorSide): Vec3 {
  const [x, y, z] = room.position;
  if (side === "east") return [x + room.size[0] / 2, y, z];
  if (side === "west") return [x - room.size[0] / 2, y, z];
  if (side === "south") return [x, y, z + room.size[2] / 2];
  return [x, y, z - room.size[2] / 2];
}

function shortestPath(start: string, goal: string, corridors: DungeonCorridor[]): string[] {
  const neighbors = new Map<string, string[]>();
  for (const corridor of corridors) {
    neighbors.set(corridor.from, [...(neighbors.get(corridor.from) ?? []), corridor.to]);
    neighbors.set(corridor.to, [...(neighbors.get(corridor.to) ?? []), corridor.from]);
  }
  const queue: string[][] = [[start]];
  const seen = new Set([start]);
  while (queue.length) {
    const path = queue.shift()!;
    const tail = path.at(-1)!;
    if (tail === goal) return path;
    for (const next of neighbors.get(tail) ?? []) {
      if (!seen.has(next)) {
        seen.add(next);
        queue.push([...path, next]);
      }
    }
  }
  return [];
}

export function createDungeonPlan(options: CreateDungeonPlanOptions): DungeonPlan {
  const parsed = optionsSchema.safeParse(options);
  if (!parsed.success) throw new Error(`Invalid dungeon options: ${z.prettifyError(parsed.error)}`);
  const value = parsed.data;
  const rng = random(`${value.seed}:${value.theme}:graph-v1`);
  const cells = buildCells(value.roomCount, value.levels);
  const edges = buildEdges(cells, value.levels, value.loopCount, rng);
  const rooms: DungeonRoom[] = cells.map((cell, index) => {
    const width = 10 + Math.floor(rng() * 3);
    const depth = 10 + Math.floor(rng() * 3);
    const x = cell.x * 24;
    const y = cell.level === 0 ? 0 : -6;
    const z = cell.z === 0 ? 0 : cell.z * 24;
    return {
      id: roomId(cell),
      name: roleNames[value.theme][roomRole(value.theme, index)],
      role: roomRole(value.theme, index),
      position: [x, y, z],
      size: [width, 4.5, depth],
      level: cell.level,
      doors: [],
      properties: {
        purpose: value.theme === "crypt" ? "A chamber in the basalt funerary procession." : "A chamber in the civic waterworks.",
        navigationEye: [x, y + 1.7, z],
        protectedDoorLanes: [],
      },
    };
  });
  const roomByCell = new Map(cells.map((cell, index) => [key(cell), rooms[index]!]));
  const corridors: DungeonCorridor[] = edges.map((edge, index) => {
    const from = roomByCell.get(key(edge.a))!;
    const to = roomByCell.get(key(edge.b))!;
    const fromSide = sideBetween(from.position, to.position);
    const toSide = sideBetween(to.position, from.position);
    const id = `${edge.kind}-${[from.id, to.id].sort().join("--")}`;
    const fromSocket = socket(from, fromSide);
    const toSocket = socket(to, toSide);
    const path: Vec3[] = edge.kind === "stairs"
      ? [fromSocket, [(fromSocket[0] + toSocket[0]) / 2, (fromSocket[1] + toSocket[1]) / 2, (fromSocket[2] + toSocket[2]) / 2], toSocket]
      : [fromSocket, toSocket];
    const addDoor = (room: DungeonRoom, side: DoorSide, position: Vec3) => {
      const door: DungeonDoor = { id: `door-${id}-${room.id}`, corridorId: id, kind: "passage", side, position, width: value.corridorWidth, height: 3.2 };
      room.doors!.push(door);
      room.properties.protectedDoorLanes.push(door.id);
    };
    addDoor(from, fromSide, fromSocket);
    addDoor(to, toSide, toSocket);
    return { id, from: from.id, to: to.id, width: value.corridorWidth, path, kind: edge.kind, annotation: edge.loop ? "shortcut" : "branch" };
  });
  const entry = rooms[0]!;
  entry.position = [0, 0, 0];
  entry.role = "entry";
  entry.name = roleNames[value.theme].entry;
  entry.properties.navigationEye = [0, 1.7, 0];
  const entrance: DungeonDoor = { id: "entrance-socket", kind: "entrance", side: "south", position: [0, 0, entry.size[2] / 2], width: 4, height: 3.2 };
  entry.doors!.push(entrance);
  entry.properties.protectedDoorLanes.push(entrance.id);
  const goal = rooms.at(-1)!;
  goal.role = "landmark";
  goal.name = roleNames[value.theme].landmark;
  const degree = new Map(rooms.map((room) => [room.id, 0]));
  for (const corridor of corridors) {
    degree.set(corridor.from, degree.get(corridor.from)! + 1);
    degree.set(corridor.to, degree.get(corridor.to)! + 1);
  }
  for (let level = 0; level < value.levels; level++) {
    const hub = rooms.filter((room) => room !== entry && room !== goal && room.level === level)
      .sort((a, b) => degree.get(b.id)! - degree.get(a.id)!)[0];
    if (hub && degree.get(hub.id)! >= 3) {
      hub.role = "hub";
      hub.name = roleNames[value.theme].hub;
    }
  }
  for (const room of rooms) {
    room.properties.purpose = `${room.name}: ${value.theme === "crypt" ? "part of the Ash Covenant funerary complex" : "part of the waterwrights' civic water system"}.`;
  }
  const criticalPath = shortestPath(entry.id, goal.id, corridors);
  const criticalEdges = new Set(criticalPath.slice(1).map((id, i) => [criticalPath[i]!, id].sort().join("|")));
  corridors.forEach((corridor) => {
    if (corridor.annotation !== "shortcut" && criticalEdges.has([corridor.from, corridor.to].sort().join("|"))) corridor.annotation = "critical-path";
  });
  const plan: DungeonPlan = {
    version: "1.0",
    seed: value.seed,
    theme: value.theme,
    rooms,
    corridors,
    entryRoom: entry.id,
    goalRoom: goal.id,
    criticalPath,
    stats: {
      roomCount: rooms.length,
      corridorCount: corridors.length,
      loopCount: value.loopCount,
      branchCount: rooms.filter((room) => degree.get(room.id)! >= 3).length,
      levelCount: value.levels,
    },
    metadata: value.theme === "crypt"
      ? { builders: "The basalt masons of the Ash Covenant", disruption: "A roof-fire drove smoke and ochre through the sealed galleries", destination: goal.name, graphDesign: "A connected spanning route with side branches and explicit adjacent-cell shortcuts", entranceSpawn: [0, 2, 4] }
      : { builders: "Valenreach's first waterwright guild", disruption: "A pressure failure flooded the settling wing and abandoned its maintenance walks", destination: goal.name, graphDesign: "A connected spanning route with side branches and explicit adjacent-cell shortcuts", entranceSpawn: [0, 2, 4] },
  };
  validateDungeonPlan(plan);
  return plan;
}

function fail(errors: string[]): never {
  throw new Error(`Invalid dungeon plan:\n- ${errors.join("\n- ")}`);
}

export function validateDungeonPlan(plan: DungeonPlan): DungeonValidationReport {
  const errors: string[] = [];
  const roomIds = new Set<string>();
  const corridorIds = new Set<string>();
  const doorIds = new Set<string>();
  for (const room of plan.rooms) {
    if (roomIds.has(room.id)) errors.push(`duplicate room id '${room.id}'`);
    roomIds.add(room.id);
    if (room.size[0] <= 0 || room.size[1] < 3 || room.size[2] <= 0) errors.push(`room '${room.id}' has invalid size/headroom`);
    for (const door of room.doors ?? []) {
      if (doorIds.has(door.id)) errors.push(`duplicate door id '${door.id}'`);
      doorIds.add(door.id);
      if (door.corridorId && !plan.corridors.some((corridor) => corridor.id === door.corridorId)) errors.push(`door '${door.id}' targets missing corridor '${door.corridorId}'`);
    }
  }
  if (!roomIds.has(plan.entryRoom)) errors.push(`entryRoom '${plan.entryRoom}' is missing`);
  if (!roomIds.has(plan.goalRoom)) errors.push(`goalRoom '${plan.goalRoom}' is missing`);
  for (const corridor of plan.corridors) {
    if (corridorIds.has(corridor.id)) errors.push(`duplicate corridor id '${corridor.id}'`);
    if (roomIds.has(corridor.id)) errors.push(`duplicate graph id '${corridor.id}'`);
    corridorIds.add(corridor.id);
    if (!roomIds.has(corridor.from) || !roomIds.has(corridor.to)) errors.push(`corridor '${corridor.id}' targets a missing room`);
    if (corridor.width < 3) errors.push(`corridor '${corridor.id}' is narrower than 3m`);
    if (corridor.path.length < 2) errors.push(`corridor '${corridor.id}' has no traversable path`);
  }
  const adjacency = new Map(plan.rooms.map((room) => [room.id, [] as string[]]));
  for (const corridor of plan.corridors) {
    if (adjacency.has(corridor.from) && adjacency.has(corridor.to)) {
      adjacency.get(corridor.from)!.push(corridor.to);
      adjacency.get(corridor.to)!.push(corridor.from);
    }
    for (const endpoint of [corridor.from, corridor.to]) {
      const room = plan.rooms.find((candidate) => candidate.id === endpoint);
      const doors = room?.doors?.filter((door) => door.corridorId === corridor.id) ?? [];
      if (doors.length !== 1) errors.push(`corridor '${corridor.id}' needs exactly one socket in room '${endpoint}'`);
      else if (doors[0]!.width < corridor.width || doors[0]!.height < 3) errors.push(`door '${doors[0]!.id}' does not clear corridor '${corridor.id}'`);
      else {
        const pathEnd = endpoint === corridor.from ? corridor.path[0]! : corridor.path.at(-1)!;
        if (pathEnd && doors[0]!.position.some((value, axis) => Math.abs(value - pathEnd[axis]!) > 0.001)) errors.push(`corridor '${corridor.id}' does not align with door '${doors[0]!.id}'`);
      }
    }
  }
  const visited = new Set<string>();
  const queue = roomIds.has(plan.entryRoom) ? [plan.entryRoom] : [];
  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    queue.push(...(adjacency.get(id) ?? []));
  }
  if (visited.size !== plan.rooms.length) errors.push(`dungeon is disconnected: reached ${visited.size} of ${plan.rooms.length} rooms`);
  for (let i = 0; i < plan.rooms.length; i++) {
    const a = plan.rooms[i]!;
    for (const b of plan.rooms.slice(i + 1)) {
      const overlapX = Math.abs(a.position[0] - b.position[0]) < (a.size[0] + b.size[0]) / 2;
      const overlapZ = Math.abs(a.position[2] - b.position[2]) < (a.size[2] + b.size[2]) / 2;
      const overlapY = a.position[1] < b.position[1] + b.size[1] && b.position[1] < a.position[1] + a.size[1];
      if (overlapX && overlapY && overlapZ) errors.push(`rooms '${a.id}' and '${b.id}' overlap`);
    }
  }
  if (!plan.criticalPath.length || plan.criticalPath[0] !== plan.entryRoom || plan.criticalPath.at(-1) !== plan.goalRoom) errors.push("criticalPath must run from entryRoom to goalRoom");
  for (const id of plan.criticalPath) if (!roomIds.has(id)) errors.push(`criticalPath targets missing room '${id}'`);
  for (let index = 1; index < plan.criticalPath.length; index++) {
    if (!(adjacency.get(plan.criticalPath[index - 1]!) ?? []).includes(plan.criticalPath[index]!))
      errors.push("criticalPath contains rooms without a connecting corridor");
  }
  const computedLoops = plan.corridors.length - plan.rooms.length + 1;
  if (computedLoops !== plan.stats.loopCount) errors.push(`stats.loopCount ${plan.stats.loopCount} does not match graph loop count ${computedLoops}`);
  if (errors.length) fail(errors);
  return { valid: true, summary: `${plan.rooms.length} rooms; connected graph with ${computedLoops} loop${computedLoops === 1 ? "" : "s"}, ${plan.stats.branchCount} branch hubs, and ${plan.stats.levelCount} level${plan.stats.levelCount === 1 ? "" : "s"}.`, roomCount: plan.rooms.length, corridorCount: plan.corridors.length, loopCount: computedLoops, branchCount: plan.stats.branchCount };
}
