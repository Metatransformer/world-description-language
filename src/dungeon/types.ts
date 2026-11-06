import type { Vec3 } from "../wdl/types.js";

export type DungeonTheme = "crypt" | "cistern";
export type DungeonRoomRole =
  | "entry"
  | "hub"
  | "crypt"
  | "storage"
  | "gallery"
  | "cistern"
  | "sanctuary"
  | "treasure-alcove"
  | "story-alcove"
  | "landmark";
export type DoorSide = "north" | "south" | "east" | "west";

export interface DungeonDoor {
  id: string;
  corridorId?: string;
  kind: "passage" | "entrance";
  side: DoorSide;
  position: Vec3;
  width: number;
  height: number;
}

export interface DungeonRoom {
  id: string;
  name: string;
  role: DungeonRoomRole;
  position: Vec3;
  size: Vec3;
  level: number;
  doors?: DungeonDoor[];
  properties: {
    purpose: string;
    navigationEye: Vec3;
    protectedDoorLanes: string[];
  };
}

export interface DungeonCorridor {
  id: string;
  from: string;
  to: string;
  width: number;
  path: Vec3[];
  kind: "corridor" | "stairs";
  annotation: "critical-path" | "branch" | "shortcut";
}

export interface DungeonPlan {
  version: "1.0";
  seed: string;
  theme: DungeonTheme;
  rooms: DungeonRoom[];
  corridors: DungeonCorridor[];
  entryRoom: string;
  goalRoom: string;
  criticalPath: string[];
  stats: {
    roomCount: number;
    corridorCount: number;
    loopCount: number;
    branchCount: number;
    levelCount: number;
  };
  metadata: {
    builders: string;
    disruption: string;
    destination: string;
    graphDesign: string;
    entranceSpawn: Vec3;
  };
}

export interface CreateDungeonPlanOptions {
  seed: string;
  theme: DungeonTheme;
  roomCount: number;
  levels: 1 | 2;
  loopCount: number;
  corridorWidth?: number;
}

export interface DungeonValidationReport {
  valid: true;
  summary: string;
  roomCount: number;
  corridorCount: number;
  loopCount: number;
  branchCount: number;
}

export type { Vec3 };
