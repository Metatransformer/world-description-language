import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { WorldRuntime } from "../../src/runtime/runtime.js";
import type { BehaviorArtifact } from "../../src/runtime/contract.js";

const status = document.querySelector<HTMLParagraphElement>("#status")!;
const place = document.querySelector<HTMLParagraphElement>("#place")!;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
document.body.prepend(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color("#17303b");
scene.fog = new THREE.Fog("#17303b", 35, 100);
scene.add(new THREE.HemisphereLight("#d8e9ff", "#536443", 2));
const sun = new THREE.DirectionalLight("#fff1cf", 3);
sun.position.set(12, 25, 8); sun.castShadow = true; scene.add(sun);
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 200);
camera.rotation.order = "YXZ";
const player = new THREE.Vector3(0, 0, 10);
const keys = new Set<string>();
let space: THREE.Group | undefined, spaceId = "", coins = 0, busy = false;
let objects = new Map<string, THREE.Object3D>();
let bounds = new Map<string, THREE.Box3>();
let elapsed = performance.now();
let target: string | undefined;
const contract: BehaviorArtifact = await (await fetch("/behavior.json")).json();
const index: { spaces: Array<{ id: string; file: string; nodes: string[] }> } = await (await fetch("/index.json")).json();
const runtime = new WorldRuntime(contract, {
  "world.travel": async args => { await travel(String(args.space), new THREE.Vector3(Number(args.x), Number(args.y) - 1, Number(args.z))); },
  "inventory.grant": args => { coins++; status.textContent = "Collected " + args.item; },
});
const loader = new GLTFLoader();
function refresh() {
  for (const [id, object] of objects) object.visible = runtime.binding(id, "visible") !== false;
}
runtime.onChange = refresh;
async function travel(id: string, arrival: THREE.Vector3) {
  const entry = index.spaces.find(s => s.id === id);
  if (!entry) throw new Error("Unknown space: " + id);
  const loaded = await loader.loadAsync("/" + entry.file);
  if (space) {
    scene.remove(space);
    space.traverse(o => { if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      for (const material of Array.isArray(o.material) ? o.material : [o.material]) {
        if (material instanceof THREE.MeshStandardMaterial) material.map?.dispose();
        material.dispose();
      }
    } });
  }
  space = loaded.scene; scene.add(space); space.updateMatrixWorld(true);
  objects = new Map(); bounds = new Map();
  space.traverse(object => {
    const association = loaded.parser.associations.get(object);
    const nodeIndex = association?.nodes;
    if (nodeIndex === undefined) return;
    const objectId = entry.nodes[nodeIndex];
    if (!objectId) return;
    objects.set(objectId, object);
    bounds.set(objectId, new THREE.Box3().setFromObject(object));
    if (object instanceof THREE.Mesh) { object.castShadow = true; object.receiveShadow = true; }
  });
  spaceId = id; player.copy(arrival); refresh(); status.textContent = "Entered " + id;
}
function blocked(position: THREE.Vector3) {
  const body = new THREE.Box3(new THREE.Vector3(position.x - 0.3, position.y + 0.08, position.z - 0.3),
    new THREE.Vector3(position.x + 0.3, position.y + 1.8, position.z + 0.3));
  for (const [id, box] of bounds) {
    if ((runtime.binding(id, "solid") ?? contract.objects[id]?.solid) && box.intersectsBox(body)) return true;
  }
  return false;
}
document.querySelector("#play")!.addEventListener("click", () => renderer.domElement.requestPointerLock());
addEventListener("keydown", event => {
  keys.add(event.code);
  if (event.code === "KeyE" && !event.repeat && target && !busy) {
    busy = true;
    runtime.interact(target).catch(error => { status.textContent = String(error); }).finally(() => { busy = false; });
  }
});
addEventListener("keyup", event => keys.delete(event.code));
addEventListener("blur", () => keys.clear());
addEventListener("mousemove", event => {
  if (!document.pointerLockElement) return;
  camera.rotation.y -= event.movementX * 0.0025;
  camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - event.movementY * 0.0025, -1.4, 1.4);
});
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight);
});
document.querySelector("#save")!.addEventListener("click", () => {
  try { localStorage.setItem("wdl-alder-vale", JSON.stringify({ world: runtime.snapshot(), coins, space: spaceId, position: player.toArray() })); status.textContent = "Saved world and inventory"; }
  catch (error) { status.textContent = String(error); }
});
document.querySelector("#restore")!.addEventListener("click", async () => {
  try {
    const save = JSON.parse(localStorage.getItem("wdl-alder-vale") ?? "null");
    if (!save) throw new Error("No save yet");
    runtime.restore(save.world); coins = save.coins; await travel(save.space, new THREE.Vector3().fromArray(save.position));
  } catch (error) { status.textContent = String(error); }
});
await travel("town", player.clone());
renderer.setAnimationLoop(() => {
  const now = performance.now(), dt = Math.min((now - elapsed) / 1000, 0.05); elapsed = now;
  if (document.pointerLockElement && !busy) {
    const direction = new THREE.Vector3(Number(keys.has("KeyD")) - Number(keys.has("KeyA")), 0, Number(keys.has("KeyS")) - Number(keys.has("KeyW")));
    direction.normalize().applyAxisAngle(THREE.Object3D.DEFAULT_UP, camera.rotation.y).multiplyScalar(dt * (keys.has("ShiftLeft") ? 7 : 4));
    const next = player.clone(); next.x += direction.x; if (!blocked(next)) player.x = next.x;
    next.copy(player); next.z += direction.z; if (!blocked(next)) player.z = next.z;
  }
  camera.position.copy(player).add(new THREE.Vector3(0, 1.6, 0));
  target = undefined; let nearest = 3;
  for (const [id, object] of objects) {
    if (!contract.objects[id]?.interact || !object.visible) continue;
    const distance = object.getWorldPosition(new THREE.Vector3()).distanceTo(player.clone().add(new THREE.Vector3(0, 1, 0)));
    if (distance < nearest) { nearest = distance; target = id; }
  }
  place.textContent = spaceId.toUpperCase() + " · Coins: " + coins;
  if (target) status.textContent = "[E] " + (contract.objects[target]?.label ?? "Interact");
  renderer.render(scene, camera);
});
