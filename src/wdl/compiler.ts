import {
  Children,
  Fragment,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import type {
  CommonProps,
  ConnectionManifest,
  Diagnostic,
  Material,
  Matrix4,
  MeshGeometry,
  ProducerManifest,
  SourceLocation,
  Vec3,
  VocabularyRegistry,
  WorldManifest,
  WorldObject,
} from "./types.js";
import { WdlCompileError } from "./types.js";

type Mat = number[];
type PendingScatter = {
  id: string;
  props: Record<string, unknown>;
  matrix: Mat;
  parentId?: string;
  spaceId: string;
  source?: SourceLocation;
};
type State = {
  manifest: WorldManifest;
  ids: Set<string>;
  producers: Map<string, ProducerManifest>;
  scatters: PendingScatter[];
  registry?: VocabularyRegistry;
};
const identity = (): Mat => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const multiply = (a: Mat, b: Mat): Mat => {
  const out = Array<number>(16).fill(0);
  for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++)
        out[c * 4 + r] += a[k * 4 + r]! * b[c * 4 + k]!;
  return out;
};
const localMatrix = (
  position: Vec3 = [0, 0, 0],
  rotation: Vec3 = [0, 0, 0],
  scale: Vec3 = [1, 1, 1],
): Mat => {
  const [x, y, z] = rotation,
    [sx, sy, sz] = scale;
  const cx = Math.cos(x),
    sxn = Math.sin(x),
    cy = Math.cos(y),
    syn = Math.sin(y),
    cz = Math.cos(z),
    szn = Math.sin(z);
  return [
    cy * cz * sx,
    (sxn * syn * cz + cx * szn) * sx,
    (-cx * syn * cz + sxn * szn) * sx,
    0,
    -cy * szn * sy,
    (-sxn * syn * szn + cx * cz) * sy,
    (cx * syn * szn + sxn * cz) * sy,
    0,
    syn * sz,
    -sxn * cy * sz,
    cx * cy * sz,
    0,
    position[0],
    position[1],
    position[2],
    1,
  ];
};
const round = (value: number) =>
  Math.abs(value) < 1e-12 ? 0 : Number(value.toFixed(9));
const decompose = (
  m: Mat,
): { position: Vec3; rotation: Vec3; scale: Vec3; matrix: Matrix4 } => {
  const sx = Math.hypot(m[0]!, m[1]!, m[2]!),
    sy = Math.hypot(m[4]!, m[5]!, m[6]!),
    sz = Math.hypot(m[8]!, m[9]!, m[10]!);
  const r00 = m[0]! / sx,
    r01 = m[4]! / sy,
    r02 = m[8]! / sz,
    r11 = m[5]! / sy,
    r12 = m[9]! / sz,
    r21 = m[6]! / sy,
    r22 = m[10]! / sz;
  const y = Math.asin(Math.max(-1, Math.min(1, r02)));
  const x =
    Math.abs(r02) < 0.9999999 ? Math.atan2(-r12, r22) : Math.atan2(r21, r11);
  const z = Math.abs(r02) < 0.9999999 ? Math.atan2(-r01, r00) : 0;
  return {
    position: [round(m[12]!), round(m[13]!), round(m[14]!)],
    rotation: [round(x), round(y), round(z)],
    scale: [round(sx), round(sy), round(sz)],
    matrix: m.map(round) as unknown as Matrix4,
  };
};
const serializable = (value: unknown): unknown => {
  if (
    value == null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return value;
  if (Array.isArray(value)) return value.map(serializable);
  if (typeof value === "object" && !isValidElement(value))
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== "children" && key !== "__wdlSource")
        .map(([key, item]) => [key, serializable(item)]),
    );
  return undefined;
};
const sourceFor = (
  props: Record<string, unknown>,
  chain: string[],
): SourceLocation | undefined => {
  const raw = props.__wdlSource as
    | { file?: string; line?: number; column?: number }
    | undefined;
  if (!raw?.file || !raw.line)
    return chain.length
      ? {
          file: "<programmatic>",
          line: 1,
          componentChain: chain,
          parameters: serializable(props) as Record<string, unknown>,
        }
      : undefined;
  return {
    file: raw.file,
    line: raw.line,
    column: raw.column,
    componentChain: chain,
    parameters: serializable(props) as Record<string, unknown>,
  };
};
const fail = (diagnostic: Diagnostic): never => {
  throw new WdlCompileError([diagnostic]);
};
const keyedSegment = (element: ReactElement, label: string): string => {
  if (element.key == null || element.key === "")
    fail({ code: "MISSING_KEY", message: `${label} requires an explicit key` });
  return String(element.key).replaceAll("%", "%25").replaceAll("/", "%2F");
};
const reserve = (state: State, id: string, source?: SourceLocation) => {
  if (state.ids.has(id))
    fail({
      code: "DUPLICATE_ID",
      message: `Duplicate stable identity '${id}'`,
      path: id,
      source,
    });
  state.ids.add(id);
};
const children = (node: ReactNode): ReactElement[] => {
  const result: ReactElement[] = [];
  Children.forEach(node, (child) => {
    if (isValidElement(child)) result.push(child);
  });
  return result;
};
const resolveRef = (spaceId: string, ref: string) =>
  ref.includes("/") ? ref : `${spaceId}/${ref}`;

function visit(
  node: ReactNode,
  state: State,
  context: {
    scope: string[];
    matrix: Mat;
    parentId?: string;
    spaceId?: string;
    chain: string[];
    frames?: NonNullable<SourceLocation["components"]>;
    componentRoot?: boolean;
  },
): void {
  for (const element of children(node)) {
    if (element.type === Fragment) {
      visit(
        (element.props as { children?: ReactNode }).children,
        state,
        element.key == null
          ? context
          : {
              ...context,
              scope: [...context.scope, keyedSegment(element, "Fragment")],
            },
      );
      continue;
    }
    const props = element.props as Record<string, unknown>;
    if (typeof element.type === "function") {
      const name = element.type.name || "Anonymous";
      const segment = keyedSegment(element, name);
      const rendered = (
        element.type as (props: Record<string, unknown>) => ReactNode
      )(props);
      visit(rendered, state, {
        ...context,
        scope: [...context.scope, segment],
        chain: [...context.chain, name],
        frames: [
          ...(context.frames ?? []),
          {
            name,
            key: segment,
            file: (props.__wdlSource as { file?: string } | undefined)?.file,
            line: (props.__wdlSource as { line?: number } | undefined)?.line,
            parameters: serializable(props) as Record<string, unknown>,
          },
        ],
        componentRoot: true,
      });
      continue;
    }
    if (typeof element.type !== "string" || !element.type.startsWith("wdl:"))
      fail({
        code: "INVALID_WORLD",
        message: "Only WDL components may be rendered",
      });
    const tag = element.type.slice(4);
    const baseSource = sourceFor(props, context.chain);
    const source = baseSource
      ? { ...baseSource, components: context.frames }
      : undefined;
    if (tag === "world") {
      state.manifest.name = String(props.name ?? "World");
      state.manifest.materials =
        (props.materials as Material[] | undefined) ?? [];
      state.manifest.references =
        (props.references as WorldManifest["references"] | undefined) ?? [];
      state.manifest.metadata = {
        ...((props.metadata as Record<string, unknown> | undefined) ?? {}),
        deterministic: true,
        trust:
          "Authored TypeScript executes locally; static checks reject obvious nondeterminism but this is not a security sandbox.",
      };
      visit(props.children as ReactNode, state, {
        ...context,
        scope: [],
        chain: context.chain,
        componentRoot: false,
      });
      continue;
    }
    if (tag === "space") {
      const id =
        context.scope.at(-1) ??
        fail({
          code: "MISSING_KEY",
          message: "Space requires an explicit key",
        });
      reserve(state, id, source);
      state.manifest.spaces.push({
        id,
        name: String(props.name ?? id),
        properties: (props.properties as Record<string, unknown>) ?? {},
        source,
      });
      visit(props.children as ReactNode, state, {
        scope: [id],
        matrix: identity(),
        spaceId: id,
        chain: context.chain,
        frames: context.frames,
        componentRoot: false,
      });
      continue;
    }
    const spaceId =
      context.spaceId ??
      fail({ code: "INVALID_WORLD", message: `${tag} must be inside a Space` });
    if (tag === "connection") {
      const id = String(
        props.id ??
          context.scope.at(-1) ??
          fail({
            code: "MISSING_KEY",
            message: "Connection requires id or key",
          }),
      );
      reserve(state, `connection:${id}`, source);
      state.manifest.connections.push({
        id,
        fromSpace: String(props.fromSpace ?? spaceId),
        toSpace: String(props.to),
        arrival: props.arrival as Vec3,
        fromObject: props.fromObject as string | undefined,
        bidirectional: Boolean(props.bidirectional),
        properties: (props.properties as Record<string, unknown>) ?? {},
        source,
      });
      continue;
    }
    const id = context.scope.join("/");
    const transform = multiply(
      context.matrix,
      localMatrix(
        props.position as Vec3 | undefined,
        props.rotation as Vec3 | undefined,
        props.scale as Vec3 | undefined,
      ),
    );
    if (["surface", "anchor", "boundary", "exclusion"].includes(tag)) {
      reserve(state, id, source);
      const producer: ProducerManifest = {
        id,
        kind: tag as ProducerManifest["kind"],
        spaceId,
        geometry: props.geometry as MeshGeometry | undefined,
        position: decompose(transform).position,
        matrix: transform as unknown as Matrix4,
        size: props.size as Vec3 | undefined,
        dependencies: (
          (props.properties as { dependsOn?: string[] } | undefined)
            ?.dependsOn ?? []
        ).map((ref) => resolveRef(spaceId, ref)),
        source,
      };
      state.producers.set(id, producer);
      state.manifest.producers.push(producer);
      continue;
    }
    if (tag === "scatter") {
      reserve(state, id, source);
      state.scatters.push({
        id,
        props,
        matrix: transform,
        parentId: context.parentId,
        spaceId,
        source,
      });
      continue;
    }
    if (tag !== "group" && tag !== "mesh")
      fail({
        code: "INVALID_WORLD",
        message: `Unsupported WDL host '${tag}'`,
        source,
      });
    reserve(state, id, source);
    const type = String(props.type ?? tag);
    validateVocabulary(
      state,
      type,
      (props.properties as Record<string, unknown>) ?? {},
      id,
      source,
    );
    const value = decompose(transform);
    const object: WorldObject = {
      id,
      name: props.name as string | undefined,
      type,
      properties: (props.properties as Record<string, unknown>) ?? {},
      spaceId,
      parentId: context.parentId,
      ...value,
      geometry: props.geometry as MeshGeometry | undefined,
      material: props.material as string | undefined,
      source,
    };
    state.manifest.objects.push(object);
    visit(props.children as ReactNode, state, {
      scope: context.scope,
      matrix: transform,
      parentId: id,
      spaceId,
      chain: context.chain,
      frames: context.frames,
      componentRoot: false,
    });
  }
}

function validateVocabulary(
  state: State,
  type: string,
  properties: Record<string, unknown>,
  id: string,
  source?: SourceLocation,
) {
  if (!state.registry) return;
  const schema = state.registry.types[type];
  if (!schema && !state.registry.builtins?.includes(type))
    fail({
      code: "UNKNOWN_TYPE",
      message: `Unknown vocabulary type '${type}'`,
      path: id,
      source,
    });
  if (schema) {
    const result = schema.safeParse(properties);
    if (!result.success)
      fail({
        code: "INVALID_PROPERTIES",
        message: `Invalid properties for '${type}': ${result.error.message}`,
        path: id,
        source,
      });
  }
}

function inversePoint(producer: ProducerManifest, point: Vec3): Vec3 {
  const m = producer.matrix ?? localMatrix(producer.position);
  const [x, y, z] = point.map((v, i) => v - m[12 + i]!);
  const a = m[0]!,
    b = m[4]!,
    c = m[8]!,
    d = m[1]!,
    e = m[5]!,
    f = m[9]!,
    g = m[2]!,
    h = m[6]!,
    i = m[10]!;
  const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(det) < 1e-12)
    fail({
      code: "INVALID_WORLD",
      message: `Producer '${producer.id}' has a singular transform`,
    });
  return [
    ((e * i - f * h) * x! + (c * h - b * i) * y! + (b * f - c * e) * z!) / det,
    ((f * g - d * i) * x! + (a * i - c * g) * y! + (c * d - a * f) * z!) / det,
    ((d * h - e * g) * x! + (b * g - a * h) * y! + (a * e - b * d) * z!) / det,
  ];
}
function geometryBottomOffset(geometry: MeshGeometry): number {
  if (geometry.shape === "box") return geometry.size[1] / 2;
  if (geometry.shape === "cone" || geometry.shape === "cylinder")
    return geometry.height / 2;
  if (geometry.shape === "sphere") return geometry.radius;
  if (geometry.shape === "indexed")
    return -Math.min(...geometry.positions.filter((_, i) => i % 3 === 1));
  return -Math.min(...geometry.heights);
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function random(seed: number): () => number {
  return () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function terrainY(surface: ProducerManifest, x: number, z: number): number {
  const matrix = surface.matrix ?? localMatrix(surface.position);
  const worldHeight = (height: number) =>
    matrix[1]! * x + matrix[5]! * height + matrix[9]! * z + matrix[13]!;
  const geometry = surface.geometry;
  if (!geometry || geometry.shape !== "heightfield") return worldHeight(0);
  const u =
      Math.max(0, Math.min(1, x / geometry.width + 0.5)) *
      (geometry.columns - 1),
    v =
      Math.max(0, Math.min(1, z / geometry.depth + 0.5)) * (geometry.rows - 1);
  const x0 = Math.floor(u),
    z0 = Math.floor(v),
    x1 = Math.min(geometry.columns - 1, x0 + 1),
    z1 = Math.min(geometry.rows - 1, z0 + 1),
    tx = u - x0,
    tz = v - z0;
  const h = geometry.heights;
  const a = h[z0 * geometry.columns + x0]!,
    b = h[z0 * geometry.columns + x1]!,
    c = h[z1 * geometry.columns + x0]!,
    d = h[z1 * geometry.columns + x1]!;
  return worldHeight(
    (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz,
  );
}
function validateProducerGraph(state: State) {
  const visiting = new Set<string>(),
    visited = new Set<string>();
  const walk = (id: string) => {
    if (visiting.has(id))
      fail({
        code: "DEPENDENCY_CYCLE",
        message: `Producer dependency cycle includes '${id}'`,
        path: id,
        source: state.producers.get(id)?.source,
      });
    if (visited.has(id)) return;
    const producer = state.producers.get(id);
    if (!producer)
      fail({
        code: "MISSING_REFERENCE",
        message: `Missing producer '${id}'`,
        path: id,
      });
    visiting.add(id);
    for (const dependency of producer!.dependencies ?? []) {
      if (!state.producers.has(dependency))
        fail({
          code: "MISSING_REFERENCE",
          message: `Producer '${id}' needs '${dependency}'`,
          path: id,
          source: producer!.source,
        });
      walk(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  };
  for (const id of state.producers.keys()) walk(id);
}
function resolveScatters(state: State) {
  for (const scatter of state.scatters) {
    const surfaceId = resolveRef(
      scatter.spaceId,
      String(scatter.props.surface),
    );
    const surface = state.producers.get(surfaceId);
    if (!surface || surface.kind !== "surface")
      fail({
        code: "MISSING_REFERENCE",
        message: `Scatter '${scatter.id}' needs surface '${surfaceId}'`,
        path: scatter.id,
        source: scatter.source,
      });
    const exclusions = (
      (scatter.props.exclusions as string[] | undefined) ?? []
    ).map((ref) => {
      const id = resolveRef(scatter.spaceId, ref);
      const item = state.producers.get(id);
      if (!item || item.kind !== "exclusion")
        fail({
          code: "MISSING_REFERENCE",
          message: `Scatter '${scatter.id}' needs exclusion '${id}'`,
          path: scatter.id,
          source: scatter.source,
        });
      return item!;
    });
    const count = Number(scatter.props.count),
      area = scatter.props.area as { min: Vec3; max: Vec3 } | undefined;
    if (!Number.isInteger(count) || count < 0)
      fail({
        code: "INVALID_WORLD",
        message: `Scatter count must be a nonnegative integer`,
        path: scatter.id,
        source: scatter.source,
      });
    validateVocabulary(
      state,
      String(scatter.props.type ?? "scatter-instance"),
      (scatter.props.properties as Record<string, unknown>) ?? {},
      scatter.id,
      scatter.source,
    );
    const bounds = area ?? {
      min: [-10, 0, -10] as Vec3,
      max: [10, 0, 10] as Vec3,
    };
    let made = 0,
      attempts = 0;
    while (made < count && attempts++ < Math.max(100, count * 100)) {
      const sampleKey = `${scatter.props.seed}:${scatter.id}:candidate-${attempts - 1}`;
      const rng = random(hash(sampleKey));
      const x = bounds.min[0] + rng() * (bounds.max[0] - bounds.min[0]),
        z = bounds.min[2] + rng() * (bounds.max[2] - bounds.min[2]);
      const candidate = multiply(scatter.matrix, localMatrix([x, 0, z]));
      const world = decompose(candidate).position;
      const clearance = Number(scatter.props.clearance ?? 0);
      if (
        exclusions.some((e) => {
          const local = inversePoint(e, world);
          return (
            e.size &&
            Math.abs(local[0]) <= e.size[0] / 2 + clearance &&
            Math.abs(local[2]) <= e.size[2] / 2 + clearance
          );
        })
      )
        continue;
      const local = inversePoint(surface!, world);
      const y =
        terrainY(surface!, local[0], local[2]) +
        geometryBottomOffset(scatter.props.geometry as MeshGeometry) *
          Math.hypot(candidate[4]!, candidate[5]!, candidate[6]!);
      const id = `${scatter.id}/sample-${String(attempts - 1).padStart(3, "0")}`;
      reserve(state, id, scatter.source);
      candidate[13] = y;
      const matrix = multiply(
        candidate,
        localMatrix([0, 0, 0], [0, rng() * Math.PI * 2, 0]),
      );
      state.manifest.objects.push({
        id,
        type: String(scatter.props.type ?? "scatter-instance"),
        properties: {
          ...((scatter.props.properties as Record<string, unknown>) ?? {}),
          generatedBy: scatter.id,
          sampleKey,
        },
        spaceId: scatter.spaceId,
        parentId: scatter.parentId,
        ...decompose(matrix),
        geometry: scatter.props.geometry as MeshGeometry,
        material: scatter.props.material as string | undefined,
        source: scatter.source,
      });
      made++;
    }
    if (made !== count)
      fail({
        code: "IMPOSSIBLE_PLACEMENT",
        message: `Scatter '${scatter.id}' placed ${made}/${count}; constraints leave insufficient room`,
        path: scatter.id,
        source: scatter.source,
      });
  }
}

export function compileWorld(
  element: ReactElement,
  registry?: VocabularyRegistry,
): WorldManifest {
  const manifest: WorldManifest = {
    version: "1.0",
    coordinateSystem: {
      handedness: "right",
      up: "Y",
      units: "meters",
      euler: "XYZ-radians",
    },
    name: "World",
    spaces: [],
    objects: [],
    materials: [],
    connections: [],
    relationships: [],
    producers: [],
    references: [],
    metadata: {},
  };
  const state: State = {
    manifest,
    ids: new Set(),
    producers: new Map(),
    scatters: [],
    registry,
  };
  visit(element, state, { scope: [], matrix: identity(), chain: [] });
  validateProducerGraph(state);
  resolveScatters(state);
  const spaces = new Set(manifest.spaces.map((space) => space.id));
  const materialIds = new Set(
    manifest.materials.map((material) => material.id),
  );
  if (materialIds.size !== manifest.materials.length)
    fail({ code: "DUPLICATE_ID", message: "Duplicate material identity" });
  for (const object of manifest.objects) {
    if (object.material && !materialIds.has(object.material))
      fail({
        code: "MISSING_REFERENCE",
        message: `Missing material '${object.material}'`,
        path: object.id,
        source: object.source,
      });
    if (object.matrix.some((value) => !Number.isFinite(value)))
      fail({
        code: "INVALID_WORLD",
        message: "Non-finite object transform",
        path: object.id,
        source: object.source,
      });
  }
  for (const connection of manifest.connections) {
    if (connection.fromObject && !state.ids.has(connection.fromObject))
      fail({
        code: "MISSING_REFERENCE",
        message: `Missing connection object '${connection.fromObject}'`,
        path: connection.id,
        source: connection.source,
      });
    if (
      !Array.isArray(connection.arrival) ||
      connection.arrival.length !== 3 ||
      !connection.arrival.every(Number.isFinite)
    )
      fail({
        code: "INVALID_WORLD",
        message: "Connection arrival must be a finite 3D position",
        path: connection.id,
        source: connection.source,
      });
    if (!spaces.has(connection.fromSpace) || !spaces.has(connection.toSpace))
      fail({
        code: "MISSING_REFERENCE",
        message: `Connection '${connection.id}' references missing space '${!spaces.has(connection.fromSpace) ? connection.fromSpace : connection.toSpace}'`,
        path: connection.id,
        source: connection.source,
      });
    manifest.relationships.push({
      type: "connection",
      from: connection.fromObject ?? connection.fromSpace,
      to: connection.toSpace,
      properties: {
        arrival: connection.arrival,
        bidirectional: connection.bidirectional,
      },
    });
  }
  if (!manifest.spaces.length)
    fail({
      code: "INVALID_WORLD",
      message: "World must contain at least one Space",
    });
  return manifest;
}
