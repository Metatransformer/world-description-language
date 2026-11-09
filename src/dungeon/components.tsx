import { Connection, Group, Mesh as WorldMesh, Space } from "../wdl/index.js";
import type { ComponentProps } from "react";

// Architectural meshes carry collision into every consuming engine.
function Mesh(props: ComponentProps<typeof WorldMesh>) {
  return <WorldMesh key="mesh" {...props} properties={{ ...props.properties, wdl: { solid: true } }} />;
}
import type {
  DoorSide,
  DungeonCorridor,
  DungeonDoor,
  DungeonPlan,
  DungeonRoom,
  Vec3,
} from "./types.js";

const WALL_THICKNESS = 0.35;

function materialFor(plan: DungeonPlan, accent = false): string {
  if (plan.theme === "crypt") return accent ? "crypt-ochre" : "crypt-basalt";
  return accent ? "cistern-metal" : "cistern-stone";
}

function WallWithSocket({
  side,
  room,
  door,
  material,
}: {
  side: DoorSide;
  room: DungeonRoom;
  door?: DungeonDoor;
  material: string;
}) {
  const alongX = side === "north" || side === "south";
  const length = alongX ? room.size[0] : room.size[2];
  const x = side === "east" ? room.size[0] / 2 : side === "west" ? -room.size[0] / 2 : 0;
  const z = side === "south" ? room.size[2] / 2 : side === "north" ? -room.size[2] / 2 : 0;
  const solidSize: Vec3 = alongX
    ? [length, room.size[1], WALL_THICKNESS]
    : [WALL_THICKNESS, room.size[1], length];
  if (!door)
    return (
      <Mesh
        key="solid"
        type="dungeon-wall"
        position={[x, room.size[1] / 2, z]}
        geometry={{ shape: "box", size: solidSize }}
        material={material}
      />
    );
  const sideLength = (length - door.width) / 2;
  const offset = door.width / 2 + sideLength / 2;
  const segmentSize: Vec3 = alongX
    ? [sideLength, room.size[1], WALL_THICKNESS]
    : [WALL_THICKNESS, room.size[1], sideLength];
  const lintelSize: Vec3 = alongX
    ? [door.width, room.size[1] - door.height, WALL_THICKNESS + 0.15]
    : [WALL_THICKNESS + 0.15, room.size[1] - door.height, door.width];
  return (
    <Group key="opening" type="dungeon-door-opening" properties={{ doorId: door.id, side, clearWidth: door.width, clearHeight: door.height }}>
      <Mesh key="left-jamb" type="dungeon-wall" position={[x + (alongX ? -offset : 0), room.size[1] / 2, z + (alongX ? 0 : -offset)]} geometry={{ shape: "box", size: segmentSize }} material={material} />
      <Mesh key="right-jamb" type="dungeon-wall" position={[x + (alongX ? offset : 0), room.size[1] / 2, z + (alongX ? 0 : offset)]} geometry={{ shape: "box", size: segmentSize }} material={material} />
      <Mesh key="lintel" type="dungeon-lintel" position={[x, door.height + (room.size[1] - door.height) / 2, z]} geometry={{ shape: "box", size: lintelSize }} material={material} />
      <Mesh key="arch-band" type="dungeon-arch" position={[x, door.height + 0.25, z]} rotation={alongX ? [0, 0, Math.PI / 2] : [Math.PI / 2, 0, 0]} geometry={{ shape: "cylinder", radius: 0.18, height: door.width, segments: 10 }} material={material} />
    </Group>
  );
}

function CryptDetails({ room }: { room: DungeonRoom }) {
  const x = room.size[0] / 2 - 1;
  const z = room.size[2] / 2 - 1;
  if (room.role === "landmark")
    return (
      <Group key="ritual-landmark" name="Ritual Hearth of Names" type="dungeon-landmark" position={[room.size[0] / 2 - 1.8, 0, -room.size[2] / 2 + 1.8]} properties={{ purpose: "Names were recited here before interment." }}>
        <Mesh key="dais" position={[0, 0.3, 0]} geometry={{ shape: "cylinder", radius: 1.3, height: 0.6, segments: 12 }} material="crypt-ochre" />
        <Mesh key="hearth" position={[0, 0.9, 0]} geometry={{ shape: "cylinder", radius: 0.75, height: 1.2, segments: 12 }} material="crypt-basalt" />
        {[-1, 1].map((sign) => <Mesh key={`stele-${sign}`} position={[sign * 1.2, 1.5, -0.7]} geometry={{ shape: "box", size: [0.7, 3, 0.5] }} material="crypt-ochre" />)}
      </Group>
    );
  return (
    <Group key="funerary-furnishings" type="dungeon-furnishings" properties={{ protectedLanes: room.properties.protectedDoorLanes }}>
      <Mesh key="sarcophagus" type="sarcophagus" position={[x, 0.65, z]} geometry={{ shape: "box", size: [1.4, 1.3, 1.6] }} material="crypt-basalt" />
      <Mesh key="sarcophagus-lid" type="carved-lid" position={[x, 1.38, z]} geometry={{ shape: "box", size: [1.5, 0.2, 1.7] }} material="crypt-ochre" />
      {(room.doors?.some((door) => door.side === "west") ? [-3, 3] : [-1.4, 0, 1.4]).map((offset, index) => <Mesh key={`ossuary-niche-${index}`} type="ossuary-niche" position={[-room.size[0] / 2 + 0.22, 1.5, offset]} geometry={{ shape: "box", size: [0.25, 1, 0.9] }} material="crypt-bone" />)}
    </Group>
  );
}

function CisternDetails({ room }: { room: DungeonRoom }) {
  const x = room.size[0] / 2 - 1.3;
  const z = room.size[2] / 2 - 1.3;
  if (room.role === "landmark")
    return (
      <Group key="pump-landmark" name="Great Pump and Valve" type="dungeon-landmark" position={[room.size[0] / 2 - 1.8, 0, -room.size[2] / 2 + 1.8]} properties={{ purpose: "The waterwrights balanced pressure across the old city here." }}>
        <Mesh key="pump" position={[0, 1.35, 0]} geometry={{ shape: "cylinder", radius: 1.35, height: 2.7, segments: 16 }} material="cistern-metal" />
        <Mesh key="valve" position={[0, 1.7, 1.45]} rotation={[Math.PI / 2, 0, 0]} geometry={{ shape: "cylinder", radius: 1.1, height: 0.25, segments: 12 }} material="cistern-lamp" />
        <Mesh key="plinth" position={[0, 0.25, 0]} geometry={{ shape: "box", size: [3, 0.5, 3] }} material="cistern-stone" />
      </Group>
    );
  return (
    <Group key="waterworks" type="dungeon-furnishings" properties={{ protectedLanes: room.properties.protectedDoorLanes }}>
      <Mesh key="dry-channel" type="water-channel" position={[x, 0.08, -z]} geometry={{ shape: "box", size: [1.2, 0.16, 2.4] }} material="cistern-water" />
      <Mesh key="raised-walk" type="raised-walkway" position={[x - 0.8, 0.15, -z]} geometry={{ shape: "box", size: [0.6, 0.3, 2.4] }} material="cistern-stone" />
      <Mesh key="pipe" type="water-pipe" position={[-x, 1.2, z]} rotation={[0, 0, Math.PI / 2]} geometry={{ shape: "cylinder", radius: 0.35, height: 2.6, segments: 10 }} material="cistern-metal" />
    </Group>
  );
}

function RoomFurnishings({ plan, room }: { plan: DungeonPlan; room: DungeonRoom }) {
  const x = room.size[0] / 2 - 1.1;
  const z = room.size[2] / 2 - 1.1;
  if (room.role === "storage" || room.role === "treasure-alcove")
    return <Group key="stores" name={room.role === "storage" ? "Supply stores" : "Sealed offerings"} type="dungeon-furnishings">
      {[-1, 1].map((side) => <Group key={`stack-${side}`} position={[side * x, 0, -z]}>
        <Mesh key="crate" type="supply-crate" position={[0, 0.5, 0]} geometry={{ shape: "box", size: [1.3, 1, 1.3] }} material={materialFor(plan, true)} />
        <Mesh key="urn" type="storage-urn" position={[0, 1.35, 0]} geometry={{ shape: "cylinder", radius: 0.35, height: 0.7, segments: 10 }} material={materialFor(plan)} />
      </Group>)}
    </Group>;
  if (room.role === "story-alcove" || room.role === "gallery")
    return <Group key="archive" name={plan.theme === "crypt" ? "Inscribed ancestor tablets" : "Flood level records"} type="dungeon-furnishings">
      {[-1, 1].map((side) => <Mesh key={`record-${side}`} type="inscribed-tablet" position={[side * x, 1.3, -z]} geometry={{ shape: "box", size: [1.3, 2.6, 0.45] }} material={materialFor(plan, true)} />)}
    </Group>;
  return plan.theme === "crypt" ? <CryptDetails key="crypt" room={room} /> : <CisternDetails key="cistern" room={room} />;
}

export function DungeonRoomGeometry({ plan, room, light }: { plan: DungeonPlan; room: DungeonRoom; light: boolean }) {
  const doors = new Map((room.doors ?? []).map((door) => [door.side, door]));
  const base = materialFor(plan);
  return (
    <Group
      key="room"
      name={room.name}
      type="dungeon-room"
      position={room.position}
      properties={{ roomId: room.id, center: room.position, navigationEye: room.properties.navigationEye, role: room.role, level: room.level, purpose: room.properties.purpose, doorSockets: room.doors }}
    >
      <Mesh key="floor" type="dungeon-floor" position={[0, -0.12, 0]} geometry={{ shape: "box", size: [room.size[0], 0.24, room.size[2]] }} material={base} />
      <Mesh key="ceiling" type="dungeon-ceiling" position={[0, room.size[1] + 0.12, 0]} geometry={{ shape: "box", size: [room.size[0], 0.24, room.size[2]] }} material={base} />
      {(["north", "south", "east", "west"] as const).map((side) => <WallWithSocket key={side} side={side} room={room} door={doors.get(side)} material={base} />)}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Mesh key={`column-${sx}-${sz}`} type="dungeon-column" position={[sx * (room.size[0] / 2 - 0.6), room.size[1] / 2, sz * (room.size[2] / 2 - 0.6)]} geometry={{ shape: "cylinder", radius: 0.42, height: room.size[1], segments: plan.theme === "crypt" ? 8 : 12 }} material={materialFor(plan, true)} />))}
      <RoomFurnishings key="details" plan={plan} room={room} />
      {room.role === "entry" && <Group key="entrance-marker" name="Dungeon entrance socket" type="dungeon-entrance" position={[0, 0, room.size[2] / 2 - 0.4]} properties={{ arrival: plan.metadata.entranceSpawn, clearWidth: 4 }}><Mesh key="left" position={[-2.3, 1.6, 0]} geometry={{ shape: "box", size: [0.5, 3.2, 0.6] }} material={materialFor(plan, true)} /><Mesh key="right" position={[2.3, 1.6, 0]} geometry={{ shape: "box", size: [0.5, 3.2, 0.6] }} material={materialFor(plan, true)} /><Mesh key="cap" position={[0, 3.3, 0]} geometry={{ shape: "box", size: [5, 0.45, 0.7] }} material={materialFor(plan, true)} /></Group>}
      {light && <Mesh key="light-marker" name="Dungeon light marker" type="dungeon-light" position={[0, 3.25, 0]} geometry={{ shape: "sphere", radius: 0.16, segments: 8 }} material={plan.theme === "crypt" ? "crypt-ember" : "cistern-lamp"} properties={{ color: plan.theme === "crypt" ? "#ff9b45" : "#74d8ca", intensity: plan.theme === "crypt" ? 2.2 : 1.6, range: 9 }} />}
    </Group>
  );
}

function CorridorSegment({ plan, corridor, start, end, index }: { plan: DungeonPlan; corridor: DungeonCorridor; start: Vec3; end: Vec3; index: number }) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const dz = end[2] - start[2];
  const horizontal = Math.hypot(dx, dz);
  const length = Math.hypot(horizontal, dy);
  const middle: Vec3 = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2, (start[2] + end[2]) / 2];
  const slope: Vec3 = [-Math.atan2(dy, horizontal), 0, 0];
  const wallOffset = corridor.width / 2 + WALL_THICKNESS / 2;
  return (
    <Group key={`segment-${index}`} type="dungeon-corridor-segment" position={middle} rotation={[0, Math.atan2(dx, dz), 0]}>
      <Mesh key="floor" type={corridor.kind === "stairs" ? "dungeon-stair-ramp" : "dungeon-floor"} position={[0, -0.12, 0]} rotation={slope} geometry={{ shape: "box", size: [corridor.width, 0.24, length] }} material={materialFor(plan)} />
      <Mesh key="ceiling" type="dungeon-ceiling" position={[0, 3.35, 0]} rotation={slope} geometry={{ shape: "box", size: [corridor.width + 0.7, 0.24, length] }} material={materialFor(plan)} />
      {[-1, 1].map((sign) => <Mesh key={`wall-${sign}`} type="dungeon-wall" position={[wallOffset * sign, 1.6, 0]} rotation={slope} geometry={{ shape: "box", size: [WALL_THICKNESS, 3.2, length] }} material={materialFor(plan)} />)}
    </Group>
  );
}

export function DungeonCorridorGeometry({ plan, corridor }: { plan: DungeonPlan; corridor: DungeonCorridor }) {
  return (
    <Group key="corridor" name={corridor.id} type="dungeon-corridor" properties={{ from: corridor.from, to: corridor.to, width: corridor.width, kind: corridor.kind, annotation: corridor.annotation, path: corridor.path }}>
      {corridor.path.slice(0, -1).map((point, index) => <CorridorSegment key={`segment-${index}`} plan={plan} corridor={corridor} start={point} end={corridor.path[index + 1]!} index={index} />)}
      {corridor.kind === "stairs" && Array.from({ length: 30 }, (_, index) => {
        const start = corridor.path[0]!;
        const end = corridor.path.at(-1)!;
        const t = (index + 0.5) / 30;
        return <Mesh key={`tread-${index}`} type="dungeon-stair" position={[start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t + 0.08, start[2] + (end[2] - start[2]) * t]} rotation={[0, Math.atan2(end[0] - start[0], end[2] - start[2]), 0]} geometry={{ shape: "box", size: [corridor.width, 0.18, Math.max(0.55, Math.hypot(end[0] - start[0], end[2] - start[2]) / 30)] }} material={materialFor(plan, true)} />;
      })}
    </Group>
  );
}

export function DungeonArchitecture({ plan }: { plan: DungeonPlan }) {
  const litRooms = new Set(plan.rooms.filter((_, index) => index % 2 === 0).slice(0, 12).map((room) => room.id));
  return (
    <Group key="architecture" type="dungeon-architecture" properties={{ planVersion: plan.version, graphDesign: plan.metadata.graphDesign }}>
      {plan.rooms.map((room) => <DungeonRoomGeometry key={room.id} plan={plan} room={room} light={litRooms.has(room.id)} />)}
      {plan.corridors.map((corridor) => <DungeonCorridorGeometry key={corridor.id} plan={plan} corridor={corridor} />)}
    </Group>
  );
}

export function DungeonSpace({ id, name, plan, returnArrival }: { id: string; name: string; plan: DungeonPlan; returnArrival: Vec3 }) {
  return (
    <Space key={id} name={name} properties={{ kind: "dungeon", dungeonPlan: plan, builders: plan.metadata.builders, disruption: plan.metadata.disruption, destination: plan.metadata.destination }}>
      <DungeonArchitecture key="generated" plan={plan} />
      <Connection key="return" id={`exit-${id}`} to="outside" arrival={returnArrival} bidirectional properties={{ socket: "entrance-socket" }} />
    </Space>
  );
}
