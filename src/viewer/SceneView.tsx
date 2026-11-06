/** @jsxImportSource react */
"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { WorldManifest } from "../wdl/types";
import type { ViewerCamera, ViewerCommand } from "../server/state";
import { buildSpace, setSelected } from "./render";

export function SceneView({
  manifest,
  spaceId,
  selectedId,
  command,
  initialCamera,
  onSelect,
  onCommand,
  onCamera,
}: {
  manifest: WorldManifest;
  spaceId: string;
  selectedId?: string;
  command?: ViewerCommand;
  initialCamera: ViewerCamera;
  onSelect: (id?: string) => void;
  onCommand: (id: number, camera: ViewerCamera) => void;
  onCamera: (camera: ViewerCamera) => void;
}) {
  const callbacks = useRef({ onSelect, onCommand, onCamera });
  callbacks.current = { onSelect, onCommand, onCamera };
  const remembered = useRef<
    { spaceId: string; camera: ViewerCamera } | undefined
  >(undefined);
  const processed = useRef(0);
  const [mode, setMode] = useState<"orbit" | "fly">(
    initialCamera.mode ?? "orbit",
  );
  const host = useRef<HTMLDivElement>(null);
  const state = useRef<
    | {
        camera: THREE.PerspectiveCamera;
        renderer: THREE.WebGLRenderer;
        controls: OrbitControls;
        objects: Map<string, THREE.Mesh>;
        mode: "orbit" | "fly";
      }
    | undefined
  >(undefined);
  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#172431");
    scene.fog = new THREE.FogExp2("#526273", 0.0032);
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    element.appendChild(renderer.domElement);
    const startCamera =
      remembered.current?.spaceId === spaceId
        ? remembered.current.camera
        : initialCamera;
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 1200);
    camera.position.fromArray(startCamera.position);
    camera.up.set(0, 1, 0);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.fromArray(startCamera.target);
    controls.enableDamping = true;
    controls.maxDistance = 500;
    controls.minDistance = 0.4;
    const world = buildSpace(manifest, spaceId);
    scene.add(world.group);
    scene.add(new THREE.HemisphereLight("#b8d5e3", "#6c4d31", 2.2));
    const sun = new THREE.DirectionalLight("#ffe2ad", 3.2);
    sun.position.set(-65, 110, 55);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = sun.shadow.camera.bottom = -140;
    sun.shadow.camera.right = sun.shadow.camera.top = 140;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 300;
    sun.shadow.bias = -0.00025;
    scene.add(sun);
    const grid = new THREE.GridHelper(300, 60, "#526170", "#354351");
    grid.position.y = -0.15;
    scene.add(grid);
    state.current = {
      camera,
      renderer,
      controls,
      objects: world.objects,
      mode: startCamera.mode ?? "orbit",
    };
    controls.enabled = state.current.mode === "orbit";
    setSelected(world.objects, selectedId);
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const click = (event: PointerEvent) => {
      if (event.button !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects([...world.objects.values()], false)[0];
      callbacks.current.onSelect(
        hit?.object.userData.wdlId as string | undefined,
      );
    };
    renderer.domElement.addEventListener("pointerup", click);
    const keys = new Set<string>();
    let look = false,
      lastX = 0,
      lastY = 0;
    const down = (event: KeyboardEvent) => {
      if (
        (event.target as HTMLElement)?.matches(
          "input, textarea, [contenteditable]",
        )
      )
        return;
      keys.add(event.code);
    };
    const up = (event: KeyboardEvent) => keys.delete(event.code);
    const pointerDown = (event: PointerEvent) => {
      if (event.button === 2 && state.current?.mode === "fly") {
        look = true;
        lastX = event.clientX;
        lastY = event.clientY;
        controls.enabled = false;
      }
    };
    const pointerUp = (event: PointerEvent) => {
      if (event.button === 2) {
        look = false;
        if (state.current?.mode === "orbit") controls.enabled = true;
      }
    };
    const move = (event: PointerEvent) => {
      if (!look || state.current?.mode !== "fly") return;
      const euler = new THREE.Euler(0, 0, 0, "YXZ");
      euler.setFromQuaternion(camera.quaternion);
      euler.y -= (event.clientX - lastX) * 0.003;
      euler.x = THREE.MathUtils.clamp(
        euler.x - (event.clientY - lastY) * 0.003,
        -1.5,
        1.5,
      );
      camera.quaternion.setFromEuler(euler);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    addEventListener("pointerup", pointerUp);
    renderer.domElement.addEventListener("pointerdown", pointerDown);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("contextmenu", (e) =>
      e.preventDefault(),
    );
    const clock = new THREE.Clock();
    let frame = 0,
      animation = 0;
    const animate = () => {
      animation = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      if (state.current?.mode === "fly") {
        const speed = (keys.has("ShiftLeft") ? 38 : 12) * dt,
          vector = new THREE.Vector3();
        if (keys.has("KeyW")) vector.z--;
        if (keys.has("KeyS")) vector.z++;
        if (keys.has("KeyA")) vector.x--;
        if (keys.has("KeyD")) vector.x++;
        vector.applyQuaternion(camera.quaternion);
        if (keys.has("KeyQ")) vector.y -= 1;
        if (keys.has("KeyE")) vector.y += 1;
        camera.position.addScaledVector(vector.normalize(), speed);
        controls.target
          .copy(camera.position)
          .add(new THREE.Vector3(0, 0, -10).applyQuaternion(camera.quaternion));
      } else controls.update();
      renderer.render(scene, camera);
      if (++frame % 90 === 0) callbacks.current.onCamera(readCamera());
    };
    const readCamera = (): ViewerCamera => ({
      position: camera.position.toArray() as [number, number, number],
      target: controls.target.toArray() as [number, number, number],
      mode: state.current?.mode ?? "orbit",
    });
    animate();
    return () => {
      remembered.current = { spaceId, camera: readCamera() };
      observer.disconnect();
      grid.geometry.dispose();
      (grid.material as THREE.Material).dispose();
      sun.shadow.dispose();
      cancelAnimationFrame(animation);
      renderer.domElement.removeEventListener("pointerup", click);
      removeEventListener("keydown", down);
      removeEventListener("keyup", up);
      removeEventListener("pointerup", pointerUp);
      controls.dispose();
      world.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      state.current = undefined;
    };
  }, [manifest, spaceId]);
  useEffect(() => {
    if (state.current) setSelected(state.current.objects, selectedId);
  }, [selectedId]);
  useEffect(() => {
    const current = state.current;
    if (
      !current ||
      !command ||
      command.id === processed.current ||
      (command.spaceId && command.spaceId !== spaceId)
    )
      return;
    processed.current = command.id;
    if (command.kind === "capture") {
      const dataUrl = current.renderer.domElement.toDataURL("image/png");
      void fetch("/api/capture", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ commandId: command.id, dataUrl }),
      });
      return;
    }
    current.mode = command.camera?.mode ?? current.mode;
    setMode(current.mode);
    current.controls.enabled = current.mode === "orbit";
    const mesh = command.targetId
      ? current.objects.get(command.targetId)
      : undefined;
    const object = manifest.objects.find(
      (item) => item.id === command.targetId,
    );
    const target = command.camera?.target ?? object?.position;
    if (!target && command.spaceId) {
      current.controls.target.set(0, 1, 0);
      current.camera.position.set(
        command.spaceId === "outside" ? 115 : 15,
        command.spaceId === "outside" ? 95 : 12,
        command.spaceId === "outside" ? 125 : 15,
      );
    }
    if (target) current.controls.target.fromArray(target);
    if (command.camera?.position)
      current.camera.position.fromArray(command.camera.position);
    else if (object)
      current.camera.position
        .copy(current.controls.target)
        .add(new THREE.Vector3(12, 9, 12));
    current.camera.lookAt(current.controls.target);
    current.controls.update();
    callbacks.current.onCommand(command.id, {
      position: current.camera.position.toArray() as [number, number, number],
      target: current.controls.target.toArray() as [number, number, number],
      mode: current.mode,
    });
  }, [command, spaceId, manifest]);
  return (
    <div className="scene" ref={host}>
      <button
        className="mode"
        onClick={() => {
          if (!state.current) return;
          state.current.mode = state.current.mode === "orbit" ? "fly" : "orbit";
          state.current.controls.enabled = state.current.mode === "orbit";
          setMode(state.current.mode);
          callbacks.current.onCamera({
            position: state.current.camera.position.toArray() as [
              number,
              number,
              number,
            ],
            target: state.current.controls.target.toArray() as [
              number,
              number,
              number,
            ],
            mode: state.current.mode,
          });
        }}
      >
        {mode === "fly" ? "Fly" : "Orbit"}
      </button>
    </div>
  );
}
