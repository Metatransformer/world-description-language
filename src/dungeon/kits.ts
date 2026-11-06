import type { Material } from "../wdl/types.js";

export const dungeonMaterials: Material[] = [
  { id: "crypt-basalt", color: "#c6c7cb", roughness: 0.92, texture: { kind: "noise", colors: ["#3e4146", "#717273"], scale: 5, seed: "ash-basalt" } },
  { id: "crypt-ochre", color: "#a56935", roughness: 0.86 },
  { id: "crypt-bone", color: "#c8b996", roughness: 0.8 },
  { id: "crypt-ember", color: "#ff9b45", roughness: 0.45, metallic: 0.1 },
  { id: "cistern-stone", color: "#b4dbd2", roughness: 0.9, texture: { kind: "checker", colors: ["#426d69", "#66958c"], scale: 5, seed: "waterworks-stone" } },
  { id: "cistern-water", color: "#2b7b82", roughness: 0.3, opacity: 0.72, doubleSided: true },
  { id: "cistern-metal", color: "#557a72", roughness: 0.55, metallic: 0.65 },
  { id: "cistern-lamp", color: "#74d8ca", roughness: 0.35, metallic: 0.15 },
];
