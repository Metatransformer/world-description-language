import type { ReactNode } from "react";
import type { ZodType } from "zod";

export type Vec3 = readonly [number, number, number];
export type TransformProps = { position?: Vec3; rotation?: Vec3; scale?: Vec3 };
export type SourceLocation = {
  file: string;
  line: number;
  column?: number;
  componentChain: string[];
  parameters?: Record<string, unknown>;
  components?: Array<{
    name: string;
    key: string;
    file?: string;
    line?: number;
    parameters: Record<string, unknown>;
  }>;
};
export type MeshGeometry =
  | { shape: "box"; size: Vec3 }
  | { shape: "cylinder"; radius: number; height: number; segments?: number }
  | { shape: "cone"; radius: number; height: number; segments?: number }
  | { shape: "sphere"; radius: number; segments?: number }
  | {
      shape: "heightfield";
      width: number;
      depth: number;
      columns: number;
      rows: number;
      heights: number[];
    }
  | {
      shape: "indexed";
      positions: number[];
      indices: number[];
      normals?: number[];
    };
export type ProceduralTexture = {
  kind: "checker" | "noise" | "stripes";
  colors: [string, string];
  scale?: number;
  seed?: string;
};
export type Material = {
  id: string;
  color: string;
  roughness?: number;
  metallic?: number;
  opacity?: number;
  doubleSided?: boolean;
  texture?: ProceduralTexture | { kind: "asset"; uri: string };
};
export type Matrix4 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

export interface WorldObject {
  id: string;
  name?: string;
  type: string;
  properties: Record<string, unknown>;
  spaceId: string;
  parentId?: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  matrix: Matrix4;
  geometry?: MeshGeometry;
  material?: string;
  source?: SourceLocation;
}
export interface WorldSpace {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  source?: SourceLocation;
}
export interface ConnectionManifest {
  id: string;
  fromSpace: string;
  toSpace: string;
  arrival: Vec3;
  fromObject?: string;
  bidirectional: boolean;
  properties: Record<string, unknown>;
  source?: SourceLocation;
}
export interface ProducerManifest {
  id: string;
  kind: "anchor" | "surface" | "boundary" | "exclusion";
  spaceId: string;
  geometry?: MeshGeometry;
  position: Vec3;
  matrix?: Matrix4;
  size?: Vec3;
  dependencies?: string[];
  source?: SourceLocation;
}
export interface ReferenceManifest {
  id: string;
  uri: string;
  kind: string;
  title?: string;
}
export interface WorldManifest {
  version: "1.0";
  coordinateSystem: {
    handedness: "right";
    up: "Y";
    units: "meters";
    euler: "XYZ-radians";
  };
  name: string;
  spaces: WorldSpace[];
  objects: WorldObject[];
  materials: Material[];
  connections: ConnectionManifest[];
  relationships: Array<{
    type: string;
    from: string;
    to: string;
    properties?: Record<string, unknown>;
  }>;
  producers: ProducerManifest[];
  references: ReferenceManifest[];
  metadata: Record<string, unknown>;
}
export type VocabularyRegistry = {
  types: Record<string, ZodType>;
  builtins?: readonly string[];
};
export type CommonProps = TransformProps & {
  name?: string;
  type?: string;
  properties?: Record<string, unknown>;
  children?: ReactNode;
};
export type DiagnosticCode =
  | "MISSING_KEY"
  | "DUPLICATE_ID"
  | "INVALID_WORLD"
  | "UNKNOWN_TYPE"
  | "INVALID_PROPERTIES"
  | "MISSING_REFERENCE"
  | "DEPENDENCY_CYCLE"
  | "IMPOSSIBLE_PLACEMENT"
  | "NONDETERMINISTIC_SOURCE";
export type Diagnostic = {
  code: DiagnosticCode;
  message: string;
  path?: string;
  source?: SourceLocation;
};
export class WdlCompileError extends Error {
  readonly diagnostics: Diagnostic[];
  constructor(diagnostics: Diagnostic[]) {
    super(diagnostics.map((d) => `${d.code}: ${d.message}`).join("\n"));
    this.name = "WdlCompileError";
    this.diagnostics = diagnostics;
  }
}
