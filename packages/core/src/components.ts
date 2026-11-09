import { createElement, type ReactElement, type ReactNode } from "react";
import type { CommonProps, Material, MeshGeometry, Vec3 } from "./types.js";

type InternalProps = Record<string, unknown> & { children?: ReactNode };
const host = (name: string, props: InternalProps): ReactElement =>
  createElement(`wdl:${name}`, props);

export function World(props: {
  name: string;
  materials?: Material[];
  references?: Array<{ id: string; uri: string; kind: string; title?: string }>;
  metadata?: Record<string, unknown>;
  children?: ReactNode;
}) {
  return host("world", props);
}
export function Space(props: CommonProps & { name: string }) {
  return host("space", props);
}
export function Group(props: CommonProps) {
  return host("group", props);
}
export function Mesh(
  props: CommonProps & { geometry: MeshGeometry; material?: string },
) {
  return host("mesh", props);
}
export function Connection(props: {
  id?: string;
  fromSpace?: string;
  to: string;
  arrival: Vec3;
  fromObject?: string;
  bidirectional?: boolean;
  properties?: Record<string, unknown>;
}) {
  return host("connection", props);
}
export function Surface(
  props: CommonProps & {
    kind?: "surface" | "anchor" | "boundary" | "exclusion";
    geometry?: MeshGeometry;
    size?: Vec3;
  },
) {
  return host(props.kind ?? "surface", props);
}
export const Anchor = (props: CommonProps) => host("anchor", props);
export const Boundary = (props: CommonProps & { size: Vec3 }) =>
  host("boundary", props);
export const Exclusion = (props: CommonProps & { size: Vec3 }) =>
  host("exclusion", props);
export function Scatter(
  props: CommonProps & {
    surface: string;
    exclusions?: string[];
    seed: string;
    count: number;
    geometry: MeshGeometry;
    material?: string;
    area?: { min: Vec3; max: Vec3 };
    clearance?: number;
  },
) {
  return host("scatter", props);
}
