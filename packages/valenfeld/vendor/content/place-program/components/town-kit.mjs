// TOWN KIT: the parts a Place Language town is built from, each harvested from rows that stand in Valenfeld (tools/place/harvest-town.py).
// A part's BASE is what every standing member shares; its props are what differs (where it stands, which way it faces, its state).
// part(name, BASE, PROPS): (props) => one host row; PROPS maps a prop to the spec path it fills. Template paths read TownContext.kits.
import { h, createContext, useContext } from "../../../tools/place/react.mjs";
export const TownContext = createContext({ town: "valenfeld", place: "main", kits: "templates/kits.js" }, "town");
const clone = (v) => JSON.parse(JSON.stringify(v));
// LocContext: the town's location data { anchor: {x, z} }. A spot { from, dx, dz, y } stands dx/dz metres from its anchor.
export const LocContext = createContext({}, "locations");
export function spotOf(a) {
  const A = useContext(LocContext)[a.from];
  if (!A) throw new Error(`no location "${a.from}" in this town`);
  const o = { x: A.x + a.dx }; if (a.y !== undefined) o.y = a.y; o.z = A.z + a.dz; return o;
}
export function part(name, BASE, PROPS, o = {}) {
  const P = ({ id, children, ...props }) => {
    const ctx = useContext(TownContext), spec = clone(BASE);
    if (props.at?.from) props = { ...props, at: spotOf(props.at) };   // a location: metres from a named anchor of the town
    if (spec.template?.startsWith("templates/kits.js#")) spec.template = ctx.kits + spec.template.slice(17);
    if (o.selfId) spec.id = id;
    for (const [p, path] of Object.entries(PROPS)) {
      if (props[p] === undefined) continue;
      let d = spec; for (const k of path.slice(0, -1)) d = d[k] ??= {};
      d[path.at(-1)] = clone(props[p]);
    }
    return h("row", { key: "@" + id, spec, via: name }, ...(children ?? []));
  };
  Object.defineProperty(P, "name", { value: name }); P.props = Object.keys(PROPS); P.base = BASE;
  return P;
}
// Hold: a standing row carried whole, with why it is not yet a part. Counted apart from parts at every compile.
export const Hold = ({ id, spec, why, children }) => h("row", { key: "@" + id, spec, via: "hold", why }, ...(children ?? []));

// Signpost: harvested from 7 standing rows (kw-sign-spire-fork …)
export const Signpost = part("Signpost", {"physics": "static", "primitive": {"kind": "scripted", "script": "scripts/gen/signpost.js"}}, {"parts": ["children"], "at": ["feetPosition"], "face": ["rotation"], "state": ["state"], "tags": ["tags"]}, { selfId: true });
// Sign: harvested from 8 standing rows (sign-spire …)
export const Sign = part("Sign", {}, {"parts": ["children"], "at": ["feetPosition"], "physics": ["physics"], "face": ["rotation"], "state": ["state"], "tags": ["tags"]}, { selfId: true });
// Gate: harvested from 5 standing rows (vf-gate-w …)
export const Gate = part("Gate", {"castShadow": true, "children": [{"feetPosition": {"x": -4.7, "y": 3.8, "z": -2.2}, "fx": {"script": "fx\npop flame rate=flick(.45,.2)*40 on=disc(.05) life=.35..0.6 v=up(1.1)+cone(18)*(.2..0.5) size=.12..0.22 acc=curl(.6)+buoy(2)+drag(1.5) sz=$size*(.5>.25:1>.7:.7>.14) col=hdr(4.6,3.4,1.4)>.3:hdr(3.2,1.4,.3)>.65:hdr(1.8,.5,.1)>hdr(.6,.12,.03) a=0>.12:1>.75:.85>0 rot=spin(.2) r=sprite(flame-wisp,add)\npop embers rate=3 on=disc(.05) life=.6..1.2 v=up(1.6)+cone(30)*(.3..0.8) size=.02..0.04 acc=curl(.8)+grav()*.4+drag(.5) col=hdr(5,2.8,.8)>hdr(1,.22,.04) a=(0>.1:1>.7:.9>0)*flick(11,.35) r=sprite(ember,add,velocity,.02)"}, "id": "flame-out-l"}, {"feetPosition": {"x": 4.7, "y": 3.8, "z": -2.2}, "fx": {"script": "fx\npop flame rate=flick(.45,.2)*40 on=disc(.05) life=.35..0.6 v=up(1.1)+cone(18)*(.2..0.5) size=.12..0.22 acc=curl(.6)+buoy(2)+drag(1.5) sz=$size*(.5>.25:1>.7:.7>.14) col=hdr(4.6,3.4,1.4)>.3:hdr(3.2,1.4,.3)>.65:hdr(1.8,.5,.1)>hdr(.6,.12,.03) a=0>.12:1>.75:.85>0 rot=spin(.2) r=sprite(flame-wisp,add)\npop embers rate=3 on=disc(.05) life=.6..1.2 v=up(1.6)+cone(30)*(.3..0.8) size=.02..0.04 acc=curl(.8)+grav()*.4+drag(.5) col=hdr(5,2.8,.8)>hdr(1,.22,.04) a=(0>.1:1>.7:.9>0)*flick(11,.35) r=sprite(ember,add,velocity,.02)"}, "id": "flame-out-r"}, {"feetPosition": {"x": -4.7, "y": 3.8, "z": 2.2}, "fx": {"script": "fx\npop flame rate=flick(.45,.2)*40 on=disc(.05) life=.35..0.6 v=up(1.1)+cone(18)*(.2..0.5) size=.12..0.22 acc=curl(.6)+buoy(2)+drag(1.5) sz=$size*(.5>.25:1>.7:.7>.14) col=hdr(4.6,3.4,1.4)>.3:hdr(3.2,1.4,.3)>.65:hdr(1.8,.5,.1)>hdr(.6,.12,.03) a=0>.12:1>.75:.85>0 rot=spin(.2) r=sprite(flame-wisp,add)\npop embers rate=3 on=disc(.05) life=.6..1.2 v=up(1.6)+cone(30)*(.3..0.8) size=.02..0.04 acc=curl(.8)+grav()*.4+drag(.5) col=hdr(5,2.8,.8)>hdr(1,.22,.04) a=(0>.1:1>.7:.9>0)*flick(11,.35) r=sprite(ember,add,velocity,.02)"}, "id": "flame-in-l"}, {"feetPosition": {"x": 4.7, "y": 3.8, "z": 2.2}, "fx": {"script": "fx\npop flame rate=flick(.45,.2)*40 on=disc(.05) life=.35..0.6 v=up(1.1)+cone(18)*(.2..0.5) size=.12..0.22 acc=curl(.6)+buoy(2)+drag(1.5) sz=$size*(.5>.25:1>.7:.7>.14) col=hdr(4.6,3.4,1.4)>.3:hdr(3.2,1.4,.3)>.65:hdr(1.8,.5,.1)>hdr(.6,.12,.03) a=0>.12:1>.75:.85>0 rot=spin(.2) r=sprite(flame-wisp,add)\npop embers rate=3 on=disc(.05) life=.6..1.2 v=up(1.6)+cone(30)*(.3..0.8) size=.02..0.04 acc=curl(.8)+grav()*.4+drag(.5) col=hdr(5,2.8,.8)>hdr(1,.22,.04) a=(0>.1:1>.7:.9>0)*flick(11,.35) r=sprite(ember,add,velocity,.02)"}, "id": "flame-in-r"}, {"feetPosition": {"x": 0, "y": 4.2, "z": -3.2}, "id": "glow-out", "light": {"color": "#ffa257", "distance": 14, "intensity": 2.2, "kind": "point"}}, {"feetPosition": {"x": 0, "y": 4.2, "z": 3.2}, "id": "glow-in", "light": {"color": "#ffa257", "distance": 14, "intensity": 2.2, "kind": "point"}}], "material": {"pbr": true}, "physics": "static", "receiveShadow": true, "tags": ["town-wall", "town-gate", "building"]}, {"at": ["feetPosition"], "primitive": ["primitive"], "face": ["rotation"], "state": ["state"]}, { selfId: true });
// Milestone: harvested from 8 standing rows (vf-mark-kingsway-west-0 …)
export const Milestone = part("Milestone", {"physics": "static", "primitive": {"kind": "scripted", "script": "scripts/gen/milestone.js"}, "scale": 1.6, "tags": ["milestone", "vf-road-marker"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// Tower: harvested from 7 standing rows (vf-ring-tower-5 …)
export const Tower = part("Tower", {"castShadow": true, "material": {"pbr": true}, "physics": "static", "receiveShadow": true, "tags": ["town-wall", "building"]}, {"at": ["feetPosition"], "primitive": ["primitive"]}, { selfId: true });
// Door: harvested from 24 standing rows (vfdoor-ring-tower-5 …)
export const Door = part("Door", {"tags": ["door", "interactable"]}, {"castShadow": ["castShadow"], "parts": ["children"], "at": ["feetPosition"], "material": ["material"], "physics": ["physics"], "primitive": ["primitive"], "face": ["rotation"], "state": ["state"]}, { selfId: true });
// DoorDoor: harvested from 5 standing rows (vfdoor-gate-tower-west …)
export const DoorDoor = part("DoorDoor", {"overrides": {"state.link": "+int-barracks#int-barracks-exit", "state.prompt": "Enter the gate tower", "tags": ["door", "interactable"]}, "template": "templates/kits.js#door"}, {"at": ["overrides", "feetPosition"], "face": ["overrides", "rotation"], "interior": ["overrides", "state.interior"]});
// DoorLeaf: harvested from 7 standing rows (vfdoor-ring-tower-5/vfdoor-ring-tower-5-leaf …)
export const DoorLeaf = part("DoorLeaf", {"overrides": {"castShadow": true, "feetPosition": {"x": 0, "y": 0, "z": -0.05}, "physics": "none"}, "template": "templates/kits.js#door"}, {"parent": ["overrides", "parent"], "primitive": ["overrides", "primitive"]});
// Mound: harvested from 35 standing rows (gy-mound-0 …)
export const Mound = part("Mound", {"rotation": {"pitch": 90}}, {"at": ["feetPosition"], "material": ["material"], "primitive": ["primitive"], "size": ["scale"], "tags": ["tags"]}, { selfId: true });
// Gravestone: harvested from 33 standing rows (gy-stone-0 …)
export const Gravestone = part("Gravestone", {"castShadow": true, "physics": "static"}, {"at": ["feetPosition"], "material": ["material"], "primitive": ["primitive"], "face": ["rotation"], "tags": ["tags"]}, { selfId: true });
// Lamp: harvested from 4 standing rows (crown-path-lamp-3 …)
export const Lamp = part("Lamp", {"children": [{"feetPosition": {"x": 0, "y": 0, "z": 0}, "material": {"texture": "cdn/texture-dark-oak-planks-weathered.png"}, "physics": "static", "primitive": {"depth": 0.18, "height": 3, "kind": "box", "width": 0.18}}, {"feetPosition": {"x": 0, "y": 2.6, "z": 0}, "material": {"color": "oklch(0.9 0.1 80)", "emissive": "oklch(0.85 0.15 70)", "emissiveIntensity": 3}, "primitive": {"depth": 0.3, "height": 0.4, "kind": "box", "width": 0.3}}, {"feetPosition": {"x": 0, "y": 2.8, "z": 0}, "light": {"color": "#ffb866", "distance": 9, "intensity": 2, "kind": "point"}}]}, {"at": ["feetPosition"]}, { selfId: true });
// Dress: harvested from 14 standing rows (hand-dress-valenfeld-y0-1 …)
export const Dress = part("Dress", {"overrides": {"castShadow": true, "material": {"pbr": true}, "physics": "static", "state.town": "valenfeld", "tags": ["town-dress"]}, "template": "templates/kits.js#settlement"}, {"at": ["overrides", "feetPosition"], "primitive": ["overrides", "primitive"], "face": ["overrides", "rotation"]});
// Wash: harvested from 16 standing rows (lq-wash1 …)
export const Wash = part("Wash", {}, {"castShadow": ["castShadow"], "at": ["feetPosition"], "material": ["material"], "physics": ["physics"], "pivot": ["pivot"], "primitive": ["primitive"], "face": ["rotation"]}, { selfId: true });
// FarmKit: harvested from 21 standing rows (vf-farm-fence-2 …)
export const FarmKit = part("FarmKit", {"template": "templates/kits.js#farmstead"}, {"castShadow": ["overrides", "castShadow"], "at": ["overrides", "feetPosition"], "material": ["overrides", "material"], "physics": ["overrides", "physics"], "primitive": ["overrides", "primitive"], "receiveShadow": ["overrides", "receiveShadow"], "face": ["overrides", "rotation"], "tags": ["overrides", "tags"]});
// FarmKitProp: harvested from 8 standing rows (vf-farm-prop-3 …)
export const FarmKitProp = part("FarmKitProp", {"overrides": {"physics": "static"}, "template": "templates/kits.js#prop"}, {"at": ["overrides", "feetPosition"], "primitive": ["overrides", "primitive"], "face": ["overrides", "rotation"], "state": ["overrides", "state"], "tags": ["overrides", "tags"]});
// FarmKitHorse: harvested from 3 standing rows (vf-farm-horse-1 …)
export const FarmKitHorse = part("FarmKitHorse", {"overrides": {"behavior": "scripts/horse-idle.js", "castShadow": true, "material": {"pbr": true}, "physics": "static", "state.act": "Look at", "tags": ["horse", "lookable", "valenfeld-farm"]}, "template": "templates/kits.js#horse"}, {"at": ["overrides", "feetPosition"], "primitive": ["overrides", "primitive"], "face": ["overrides", "rotation"], "name": ["overrides", "state.name"], "seed": ["overrides", "state.seed"]});
// FarmKitPlain: harvested from 1 standing rows (vf-farm-door …)
export const FarmKitPlain = part("FarmKitPlain", {"feetPosition": {"x": 63.06, "y": 6.4, "z": 56.91}, "id": "vf-farm-door", "physics": {"body": "static", "trigger": true}, "primitive": {"depth": 0.1, "height": 2.3, "kind": "box", "width": 1.2}, "rotation": {"yaw": 200}, "state": {"link": "+farmhouse#farmhouse-exit", "prompt": "Enter the Farmhouse"}, "tags": ["door", "interactable", "valenfeld-farm"], "visible": false}, {});
// FarmKitHouse: harvested from 1 standing rows (vf-farm-house …)
export const FarmKitHouse = part("FarmKitHouse", {"overrides": {"feetPosition": {"x": 62, "y": 6.3999999999999995, "z": 54}, "physics": "static", "primitive": {"kind": "scripted", "params": {"boxCol": "#4f6b4a", "chim": 1, "d": 6, "doorCol": "oklch(0.88 0.03 55)", "doorX": 0, "flowers": ["#a8452e", "#c9a45a", "#e8e0d0", "#8a4a8a", "#d06a40"], "glass": "#2a2620", "glow": [0.36, 0.22, 0.08], "jetty": 0.25, "potCol": "#8a4a32", "roofCol": "oklch(0.8 0.05 80)", "shut": "#4f6b4a", "stepCol": "oklch(0.9 0.012 80)", "storey1": [0.7, 3.2], "storey2": [2.8, 5.5], "two": true, "w": 7}, "script": "scripts/gen/house.js"}, "rotation": {"yaw": 200}, "tags": ["valenfeld-farm"]}, "template": "templates/kits.js#house"}, {});
// Flowerbed: harvested from 6 standing rows (vf-flowerbed-n11 …)
export const Flowerbed = part("Flowerbed", {"tags": ["vf-beauty"]}, {"at": ["feetPosition"], "primitive": ["primitive"]}, { selfId: true });
// Pigeon: harvested from 7 standing rows (vf-pigeon-0 …)
export const Pigeon = part("Pigeon", {"primitive": {"kind": "scripted", "params": {"colors": ["oklch(0.6 0.02 260)", "oklch(0.55 0.08 30)", "oklch(0.2 0.02 40)"]}, "script": "scripts/gen/bird.js"}, "scale": 0.22, "tags": ["pigeon"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// Curtain: harvested from 6 standing rows (vf-ring-0 …)
export const Curtain = part("Curtain", {"castShadow": true, "feetPosition": {"x": 0, "y": 0, "z": 0}, "material": {"pbr": true}, "physics": "static", "receiveShadow": true, "tags": ["town-wall", "building"]}, {"primitive": ["primitive"]}, { selfId: true });
// Crate: harvested from 68 standing rows (vf-scatter-1 …)
export const Crate = part("Crate", {"overrides": {"physics": "static"}, "template": "templates/kits.js#prop"}, {"at": ["overrides", "feetPosition"], "primitive": ["overrides", "primitive"], "face": ["overrides", "rotation"], "state": ["overrides", "state"], "tags": ["overrides", "tags"]});
// Casemate: harvested from 3 standing rows (vf-wall-casemate-n …)
export const Casemate = part("Casemate", {"physics": "static", "tags": ["vf-wall-interior"]}, {"at": ["feetPosition"], "primitive": ["primitive"], "face": ["rotation"], "state": ["state"]}, { selfId: true });
// CasemateLight: harvested from 3 standing rows (vf-wall-casemate-n-light …)
export const CasemateLight = part("CasemateLight", {}, {"at": ["feetPosition"], "light": ["light"]}, { selfId: true });
// YardFence: harvested from 6 standing rows (vf-yardfence-n11 …)
export const YardFence = part("YardFence", {"physics": "static", "primitive": {"kind": "scripted", "params": {"kind": "fence", "len": 4.6}, "script": "scripts/gen/farmstead.js"}, "scale": {"x": 1, "y": 0.8, "z": 1}, "tags": ["vf-beauty"]}, {"at": ["feetPosition"]}, { selfId: true });
// Lowfield: harvested from 14 standing rows (farm-lowfield-bale-1 …)
export const Lowfield = part("Lowfield", {}, {"audio": ["audio"], "behavior": ["behavior"], "at": ["feetPosition"], "parent": ["parent"], "physics": ["physics"], "primitive": ["primitive"], "face": ["rotation"], "state": ["state"], "tags": ["tags"]}, { selfId: true });
// Hedge: harvested from 68 standing rows (ef-hedge-n1-b0 …)
export const Hedge = part("Hedge", {"castShadow": true, "material": {"alphaTest": 0.5}, "physics": "static", "tags": ["east-fields", "hedgerow"]}, {"at": ["feetPosition"], "primitive": ["primitive"], "face": ["rotation"], "size": ["scale"]}, { selfId: true });

// SquareProp: a square-dress prop riding the town root (town/barrel-*, town/bench-*, town/crate-*, town/hay-*, town/lamp-*, town/cart).
export const SquareProp = part("SquareProp", {"template": "templates/kits.js#prop", "overrides": {"castShadow": true, "material": {"pbr": true}, "parent": "town", "physics": "static"}}, {"at": ["overrides", "feetPosition"], "look": ["overrides", "primitive"], "face": ["overrides", "rotation"], "tags": ["overrides", "tags"], "state": ["overrides", "state"], "parts": ["overrides", "children"], "in": ["overrides", "parent"]});
// MagesHall: a wing of the Mages Guild complex (scripts/gen/mages-annex.js kind hall): the side halls flanking the guild and the annex behind it
export const MagesHall = part("MagesHall", {"physics": "static", "primitive": {"kind": "scripted", "params": {"kind": "hall"}, "script": "scripts/gen/mages-annex.js"}}, {"at": ["feetPosition"], "params": ["primitive", "params"], "castShadow": ["castShadow"], "receiveShadow": ["receiveShadow"], "tags": ["tags"]}, { selfId: true });
// WardTower: a square fieldstone ward tower, 4.5 m and 12 high, a warm lamp over its door side (the crown ward's pair)
export const WardTower = part("WardTower", {"children": [{"feetPosition": {"x": 0, "y": 7, "z": 2.2}, "light": {"color": "oklch(0.85 0.12 70)", "distance": 12, "intensity": 2, "kind": "point"}}], "material": {"color": "oklch(0.72 0.03 85)", "repeat": [0.5, 0.5], "texture": "cdn/texture-fieldstone-wall.png", "wrap": "repeat"}, "physics": "static", "primitive": {"depth": 4.5, "height": 12, "kind": "box", "width": 4.5}}, {"at": ["feetPosition"]}, { selfId: true });
// StainedGlass: a Mages Guild stained-glass window panel (arcane kit) (harvested from mg-ext-glass-e, mg-ext-glass-w)
export const StainedGlass = part("StainedGlass", {"overrides": {}, "template": "templates/arcane.js#stainedGlass"}, {"at": ["overrides", "feetPosition"], "face": ["overrides", "rotation"]}, { selfId: false });
// ArcaneLamp: a Mages Guild arcane lamp, scaled 1.3 (harvested from mg-ext-lamp-e, mg-ext-lamp-w)
export const ArcaneLamp = part("ArcaneLamp", {"overrides": {"scale": 1.3}, "template": "templates/arcane.js#arcaneLamp"}, {"at": ["overrides", "feetPosition"]}, { selfId: false });
// GreenLog: a fallen log seat on the south green (harvested from vfsg-log-1, vfsg-log-2)
export const GreenLog = part("GreenLog", {"overrides": {"tags": ["vf-south-green"]}, "template": "templates/kits.js#log"}, {"at": ["overrides", "feetPosition"], "face": ["overrides", "rotation"]}, { selfId: false });
// GreenStall: a market stall on the south green (harvested from vfsg-stall-a, vfsg-stall-b)
export const GreenStall = part("GreenStall", {"overrides": {"tags": ["vf-south-green"]}, "template": "templates/kits.js#marketStall"}, {"at": ["overrides", "feetPosition"], "face": ["overrides", "rotation"]}, { selfId: false });
// GraveCross: a smoke-dark oak grave cross in the burying ground (harvested from gy-cross-10, gy-cross-16)
export const GraveCross = part("GraveCross", {"children": [{"feetPosition": {"x": 0, "y": 0.68, "z": 0}, "material": {"color": "oklch(0.42 0.04 60)", "roughness": 0.9, "texture": "cdn/texture-smoke-dark-oak-planks.png"}, "primitive": {"depth": 0.09, "height": 0.09, "kind": "box", "width": 0.55}}], "material": {"color": "oklch(0.42 0.04 60)", "roughness": 0.9, "texture": "cdn/texture-smoke-dark-oak-planks.png"}, "primitive": {"depth": 0.1, "height": 1.1, "kind": "box", "width": 0.1}, "tags": ["graveyard"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// LychPost: an oak post of the burying ground's lychgate (harvested from gy-lych-post-en, gy-lych-post-es, gy-lych-post-wn, gy-lych-post-ws)
export const LychPost = part("LychPost", {"castShadow": true, "material": {"color": "oklch(0.42 0.04 60)", "roughness": 0.9, "texture": "cdn/texture-smoke-dark-oak-planks.png"}, "physics": "static", "primitive": {"depth": 0.22, "height": 2.7, "kind": "box", "width": 0.22}, "tags": ["graveyard"]}, {"at": ["feetPosition"]}, { selfId: true });
// LychRoof: one mossy-slate pitch of the lychgate roof (harvested from gy-lych-roof-n, gy-lych-roof-s)
export const LychRoof = part("LychRoof", {"castShadow": true, "material": {"color": "oklch(0.48 0.03 150)", "repeat": [1, 1], "roughness": 1, "texture": "cdn/texture-mossy-slate-roof-tiles.png", "wrap": "repeat"}, "primitive": {"depth": 1.5, "height": 0.1, "kind": "box", "width": 4.8}, "tags": ["graveyard"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// YardSpade: a gravedigger's spade stuck in the ground (harvested from yard-spade-0, yard-spade-1, yard-spade-2)
export const YardSpade = part("YardSpade", {"children": [{"feetPosition": {"x": 0, "y": -0.05, "z": 0}, "material": {"color": "#4a4a48", "metalness": 0.6, "roughness": 0.6}, "primitive": {"depth": 0.03, "height": 0.32, "kind": "box", "width": 0.26}}], "material": {"color": "#5a4430", "roughness": 0.9}, "primitive": {"height": 1.3, "kind": "cylinder", "radiusBottom": 0.03, "radiusTop": 0.03}}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// Shrine: a roadside shrine of the town's gods (harvested from harrow-shrine, lantern-shrine, vesk-shrine; props are what differs between them)
export const Shrine = part("Shrine", {"physics": "static", "primitive": {"kind": "scripted", "params": {"style": "valley"}, "script": "scripts/gen/shrine.js"}}, {"parts": ["children"], "at": ["feetPosition"], "face": ["rotation"], "state": ["state"], "tags": ["tags"]}, { selfId: true });
// DeadTree: a bare dead tree (harvested from gy-deadtree-1, gy-deadtree-2; props are what differs between them)
export const DeadTree = part("DeadTree", {"physics": "static", "tags": ["graveyard"], "castShadow": true}, {"at": ["feetPosition"], "primitive": ["primitive"], "face": ["rotation"], "scale": ["scale"]}, { selfId: true });
// TownOak: an oak planted in town (harvested from hand-dress-valenfeld-t1, hand-dress-valenfeld-t5, vfsg-oak; props are what differs between them)
export const TownOak = part("TownOak", {"template": "templates/kits.js#oak", "overrides": {}}, {"castShadow": ["overrides", "castShadow"], "at": ["overrides", "feetPosition"], "physics": ["overrides", "physics"], "face": ["overrides", "rotation"], "scale": ["overrides", "scale"], "state.town": ["overrides", "state.town"], "tags": ["overrides", "tags"]}, { selfId: false });
// MarketSack: a grain sack at a market stall (harvested from vf-mkt-sack-1, vf-mkt-sack-2; props are what differs between them)
export const MarketSack = part("MarketSack", {"material": {"color": "oklch(0.68 0.05 80)", "roughness": 1}, "castShadow": true, "primitive": {"halfHeight": 0.12, "kind": "capsule", "radius": 0.24}, "tags": ["interactable", "container"]}, {"at": ["feetPosition"], "face": ["rotation"], "state": ["state"]}, { selfId: true });

// the Crown Toll station on the east road (harvested Nov 7 from vf-toll-*), placed from the "toll" anchor
// TollBarrier: a road toll bar: a squat post with a pale pole swung up over the way, its iron pivot on top (Valenfeld's Crown Toll)
export const TollBarrier = part("TollBarrier", {"children": [{"feetPosition": {"x": 0, "y": 1, "z": 0}, "material": {"color": "oklch(0.86 0.02 80)", "roughness": 0.8}, "pivot": "feet", "primitive": {"height": 5.2, "kind": "cylinder", "radiusBottom": 0.09, "radiusTop": 0.07}, "rotation": {"pitch": 0, "roll": 72}}, {"feetPosition": {"x": 0, "y": 1.05, "z": 0}, "material": {"color": "oklch(0.4 0.01 60)", "metalness": 0.5, "roughness": 0.6}, "primitive": {"depth": 0.5, "height": 0.35, "kind": "box", "width": 0.5}}], "material": {"color": "oklch(0.32 0.03 55)", "roughness": 0.9}, "physics": "static", "primitive": {"depth": 0.35, "height": 1.1, "kind": "box", "width": 0.35}, "tags": ["town-dress"]}, {"at": ["feetPosition"]}, { selfId: true });
// TollTable: the toll-keeper's table by the road: a ledger, a coin box and one coin left out
export const TollTable = part("TollTable", {"children": [{"feetPosition": {"x": -0.3, "y": 0.85, "z": 0}, "material": {"color": "oklch(0.85 0.03 85)"}, "primitive": {"depth": 0.32, "height": 0.06, "kind": "box", "width": 0.45}}, {"feetPosition": {"x": 0.4, "y": 0.85, "z": 0}, "material": {"color": "oklch(0.3 0.03 50)", "metalness": 0.3}, "primitive": {"depth": 0.22, "height": 0.2, "kind": "box", "width": 0.3}}, {"feetPosition": {"x": 0.4, "y": 1.05, "z": 0}, "material": {"color": "#c9a45a", "metalness": 0.9, "roughness": 0.3}, "primitive": {"height": 0.03, "kind": "cylinder", "radiusBottom": 0.05, "radiusTop": 0.05}}], "material": {"color": "oklch(0.38 0.04 55)", "roughness": 0.95}, "physics": "static", "primitive": {"depth": 0.8, "height": 0.85, "kind": "box", "width": 1.6}, "tags": ["town-dress"]}, {"at": ["feetPosition"]}, { selfId: true });
// PostLantern: a lantern hung high on a dark post, lit warm over a roadside station
export const PostLantern = part("PostLantern", {"children": [{"feetPosition": {"x": 0, "y": 2.5, "z": 0}, "material": {"color": "oklch(0.85 0.12 75)", "emissive": "oklch(0.85 0.14 70)", "emissiveIntensity": 2}, "primitive": {"depth": 0.3, "height": 0.4, "kind": "box", "width": 0.3}}, {"feetPosition": {"x": 0, "y": 2.7, "z": 0}, "light": {"color": "oklch(0.85 0.12 70)", "distance": 9, "intensity": 2, "kind": "point"}}], "material": {"color": "oklch(0.3 0.03 55)"}, "physics": "static", "primitive": {"height": 2.6, "kind": "cylinder", "radiusBottom": 0.1, "radiusTop": 0.08}, "tags": ["town-dress"]}, {"at": ["feetPosition"]}, { selfId: true });
// TollHouse: the one-storey toll house, red shutters and door, its sign naming the crown toll
export const TollHouse = part("TollHouse", {"castShadow": true, "material": {"pbr": true}, "physics": "static", "primitive": {"kind": "scripted", "params": {"boxCol": "#7a2e24", "chim": -1, "d": 5, "doorX": 0, "roofCol": "oklch(0.5 0.02 250)", "shut": "#7a2e24", "two": false, "w": 6}, "script": "scripts/gen/house.js"}, "receiveShadow": true, "tags": ["building", "town-dress"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });

// square, lantern-quarter, oak-yard and burying-ground pieces (harvested Nov 7 from held rows), each placed from its district anchor
// MarketCrate: a searchable smithy crate by a market stall; size is its cube edge in metres, level its loot level
export const MarketCrate = part("MarketCrate", {"castShadow": true, "material": {"color": "oklch(0.62 0.06 60)", "texture": "cdn/texture-weathered-oak-planks.png"}, "physics": "static", "primitive": {"kind": "box"}, "state": {"container": {"kind": "crate", "tier": 1}, "name": "Crate", "owner": "smithy", "prompt": "Search"}, "tags": ["interactable", "container"]}, {"at": ["feetPosition"], "face": ["rotation"], "w": ["primitive", "width"], "h": ["primitive", "height"], "d": ["primitive", "depth"], "level": ["state", "container", "level"]}, { selfId: true });
// MootBench: the long plank bench where the town moot sits
export const MootBench = part("MootBench", {"children": [{"feetPosition": {"x": 0, "y": 0.45, "z": 0}, "material": {"color": "oklch(0.66 0.015 80)", "roughness": 0.7}, "primitive": {"depth": 0.6, "height": 0.1, "kind": "box", "width": 2.6}}, {"feetPosition": {"x": -0.6, "y": 0.55, "z": 0.05}, "material": {"color": "#c9a45a", "metalness": 0.9, "roughness": 0.3}, "primitive": {"height": 0.02, "kind": "cylinder", "radiusBottom": 0.04, "radiusTop": 0.04}}, {"feetPosition": {"x": 0.9, "y": 0.55, "z": -0.1}, "material": {"color": "oklch(0.5 0.06 60)"}, "primitive": {"depth": 0.04, "height": 0.03, "kind": "box", "width": 0.3}, "rotation": {"yaw": 30}}], "material": {"color": "oklch(0.58 0.02 80)", "roughness": 0.9, "texture": "cdn/texture-lichen-fieldstone.png"}, "physics": "static", "primitive": {"depth": 0.5, "height": 0.45, "kind": "box", "width": 2.4}, "tags": ["town-dress", "vf-beauty"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// RainBarrel: a rain barrel under a lantern-quarter eave
export const RainBarrel = part("RainBarrel", {"castShadow": true, "material": {"color": "oklch(0.5 0.05 55)", "texture": "cdn/texture-weathered-oak-planks.png"}, "physics": "static", "primitive": {"height": 0.85, "kind": "cylinder", "radiusBottom": 0.3, "radiusTop": 0.3}, "state": {"container": {"kind": "barrel", "level": 14, "tier": 1}, "name": "Barrel", "owner": "inn", "prompt": "Search"}, "tags": ["interactable", "container"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// BeggarBowl: a beggar's wooden bowl left on the cobbles
export const BeggarBowl = part("BeggarBowl", {"material": {"color": "oklch(0.5 0.06 45)"}, "primitive": {"height": 0.07, "kind": "cylinder", "radiusBottom": 0.07, "radiusTop": 0.12}}, {"at": ["feetPosition"]}, { selfId: true });
// HatchLamp: a small lamp hung over a cellar hatch
export const HatchLamp = part("HatchLamp", {"children": [{"id": "l", "light": {"color": "#ff9a4a", "distance": 6, "intensity": 1.2, "kind": "point"}}], "material": {"color": "oklch(0.3 0.02 60)", "emissive": "oklch(0.75 0.15 60)", "emissiveIntensity": 1.5}, "primitive": {"depth": 0.18, "height": 0.25, "kind": "box", "width": 0.18}}, {"at": ["feetPosition"]}, { selfId: true });
// CellarHatch: a plank cellar hatch set in the street
export const CellarHatch = part("CellarHatch", {"castShadow": true, "children": [{"feetPosition": {"x": 0, "y": 0.05, "z": 0.3}, "id": "ring", "material": {"color": "oklch(0.3 0.01 60)", "metalness": 0.7}, "primitive": {"kind": "torus", "radius": 0.09, "tube": 0.015}}], "material": {"color": "oklch(0.45 0.05 50)", "texture": "cdn/texture-weathered-oak-planks.png"}, "physics": "static", "primitive": {"depth": 1.3, "height": 0.08, "kind": "box", "width": 1.6}, "state": {"link": "+inn#inn-exit", "prompt": "Go down into the Lowcellar"}, "tags": ["door", "interactable"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// RagPile: a heap of rags where somebody sleeps
export const RagPile = part("RagPile", {"material": {"color": "oklch(0.45 0.03 70)", "roughness": 1}, "primitive": {"heightSegments": 5, "kind": "sphere", "radius": 0.45, "widthSegments": 7}, "scale": {"x": 1.4, "y": 0.45, "z": 1}}, {"at": ["feetPosition"]}, { selfId: true });
// SpareWheel: a cart wheel leaning against a wall
export const SpareWheel = part("SpareWheel", {"material": {"color": "oklch(0.4 0.04 55)", "roughness": 0.95}, "primitive": {"kind": "torus", "radialSegments": 6, "radius": 0.45, "tube": 0.05, "tubularSegments": 12}, "tags": ["town-dress", "oak-courts"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// Woodpile: split logs stacked against a house wall
export const Woodpile = part("Woodpile", {"material": {"color": "oklch(0.45 0.05 60)", "texture": "cdn/texture-dark-oak-planks-weathered.png"}, "physics": "static", "primitive": {"depth": 0.6, "height": 0.9, "kind": "box", "width": 1.8}, "tags": ["town-dress", "oak-courts"]}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });
// LychBeam: the lych gate's cross beam over the burying ground's path
export const LychBeam = part("LychBeam", {"castShadow": true, "material": {"color": "oklch(0.42 0.04 60)", "roughness": 0.9, "texture": "cdn/texture-smoke-dark-oak-planks.png"}, "primitive": {"depth": 1.8, "height": 0.2, "kind": "box", "width": 4.3}, "tags": ["graveyard"]}, {"at": ["feetPosition"]}, { selfId: true });
// LychLamp: the lamp hung under the lych gate
export const LychLamp = part("LychLamp", {"light": {"color": "oklch(0.82 0.12 70)", "distance": 9, "intensity": 2, "kind": "point"}, "material": {"color": "oklch(0.3 0.02 60)", "emissive": "oklch(0.85 0.14 70)", "emissiveIntensity": 1.6}, "primitive": {"depth": 0.22, "height": 0.3, "kind": "box", "width": 0.22}, "tags": ["graveyard"]}, {"at": ["feetPosition"]}, { selfId: true });
// YardLantern: a lantern on a tall post lighting the burying ground
export const YardLantern = part("YardLantern", {"children": [{"feetPosition": {"x": 0, "y": 2.2, "z": 0}, "material": {"color": "#c9a45a", "emissive": "#ffb050", "emissiveIntensity": 1.6}, "primitive": {"depth": 0.24, "height": 0.32, "kind": "box", "width": 0.24}}, {"feetPosition": {"x": 0, "y": 2.3, "z": 0}, "light": {"color": "oklch(0.82 0.11 70)", "distance": 10, "intensity": 1.6, "kind": "point"}}], "material": {"color": "#3a2e22", "roughness": 0.95}, "physics": "static", "primitive": {"height": 2.2, "kind": "cylinder", "radiusBottom": 0.09, "radiusTop": 0.07}}, {"at": ["feetPosition"]}, { selfId: true });
// SpoilHeap: a heap of dug earth beside an open grave
export const SpoilHeap = part("SpoilHeap", {"material": {"color": "oklch(0.36 0.05 55)", "roughness": 1}, "physics": "static", "primitive": {"kind": "sphere", "radius": 1.1}, "scale": {"x": 1, "y": 0.55, "z": 1.4}}, {"at": ["feetPosition"]}, { selfId: true });
// OpenGrave: a freshly dug grave, open and waiting
export const OpenGrave = part("OpenGrave", {"material": {"color": "oklch(0.36 0.05 60)", "roughness": 1}, "primitive": {"depth": 0.9, "height": 0.06, "kind": "box", "width": 1.1}}, {"at": ["feetPosition"], "face": ["rotation"]}, { selfId: true });

// generic town parts (harvested Nov 7): what differs between members rides as props
// AmbientSound: a sound bed hung at a spot in town: market murmur, pigeons, a quarter's night noise
export const AmbientSound = part("AmbientSound", {}, {"at": ["feetPosition"], "audio": ["audio"]}, { selfId: true });
// TownLight: a bare point light that warms a doorway or a window from outside
export const TownLight = part("TownLight", {}, {"at": ["feetPosition"], "light": ["light"]}, { selfId: true });
// PostedNpc: a townsperson who keeps one post: a door guard, the warden, a beggar, a mourner; who they are rides in state
export const PostedNpc = part("PostedNpc", {"behavior": ["scripts/humanoid-locomotion.js"]}, {"at": ["feetPosition"], "layout": ["layout"], "model": ["model"], "physics": ["physics"], "rotation": ["rotation"], "state": ["state"], "tags": ["tags"]}, { selfId: true });
// StandingNpc: a named townsperson standing at their trade with no model override
export const StandingNpc = part("StandingNpc", {"physics": "character", "behavior": ["scripts/humanoid-locomotion.js"], "tags": ["npc", "interactable"]}, {"at": ["feetPosition"], "rotation": ["rotation"], "state": ["state"]}, { selfId: true });
// LootChest: a lockable chest with its own loot table in state
export const LootChest = part("LootChest", {"physics": "static", "primitive": {"kind": "scripted", "params": {}, "script": "scripts/gen/chest.js"}}, {"at": ["feetPosition"], "castShadow": ["castShadow"], "rotation": ["rotation"], "scale": ["scale"], "state": ["state"], "tags": ["tags"]}, { selfId: true });
// KitProp: one small prop from the kits prop template: a pouch, a bundle, a dropped thing
export const KitProp = part("KitProp", {"template": "templates/kits.js#prop"}, {"overrides": ["overrides"]});

// Valenfeld set-piece parts (harvested Nov 7)
// Footing: a stone footing a building stands on where the ground falls away
export const Footing = part("Footing", {"physics": "static"}, {"at": ["feetPosition"], "material": ["material"], "primitive": ["primitive"], "receiveShadow": ["receiveShadow"]}, { selfId: true });
// Washline: a washing line strung between two poles, laundry pegged on it
export const Washline = part("Washline", {"tags": ["town-dress", "oak-courts"]}, {"at": ["feetPosition"], "pieces": ["children"], "rotation": ["rotation"]}, { selfId: true });
// CrownHall: the crown hall: the reeve's great hall on the keep hill
export const CrownHall = part("CrownHall", {"physics": "static", "primitive": {"kind": "scripted", "params": {"closed": true}, "script": "scripts/gen/crown-hall.js"}}, {"at": ["feetPosition"], "rotation": ["rotation"]}, { selfId: true });
// Jail: the town jail: squat stone, barred windows, the warden's door
export const Jail = part("Jail", {"physics": "static", "primitive": {"kind": "scripted", "params": {"closed": true}, "script": "scripts/gen/jail.js"}, "state": {"name": "The Reeve's Jail"}, "tags": ["jail", "crown-hall"]}, {"at": ["feetPosition"]}, { selfId: true });
// GallowsTavern: the Gallows tavern by the north road
export const GallowsTavern = part("GallowsTavern", {"physics": "static", "primitive": {"kind": "scripted", "params": {"closed": true}, "script": "scripts/gen/tavern.js"}, "state": {"name": "The Crooked Tankard"}, "tags": ["tavern", "lookable"]}, {"at": ["feetPosition"]}, { selfId: true });
// WardWall: the curtain wall around the crown ward
export const WardWall = part("WardWall", {"material": {"pbr": true}, "physics": "static", "primitive": {"kind": "scripted", "params": {"H": 7, "T": 2.2, "pts": [[-14, 4.89, -66], [-19.71, 4.85, -66], [-25.43, 4.22, -66], [-31.14, 3.56, -66], [-36.86, 3.94, -66], [-42.57, 2.76, -66], [-48.29, 3.25, -66], [-54, 4.45, -66], [-54, 4.77, -71.71], [-54, 4.7, -77.43], [-54, 5.32, -83.14], [-54, 6.48, -88.86], [-54, 8.89, -94.57], [-54, 6.58, -100.29], [-54, 14.37, -106], [-48, 6.25, -106], [-42, 9.51, -106], [-36, 8.37, -106], [-30, 9.34, -106], [-24, 11.27, -106], [-18, 12.91, -106], [-12, 12.4, -106], [-6, 11.73, -106], [0, 11.32, -106], [6, 9.12, -106], [12, 6.77, -106], [12, 5.42, -100.29], [12, 4.57, -94.57], [12, 5.27, -88.86], [12, 5.88, -83.14], [12, 6.7, -77.43], [12, 6.14, -71.71], [12, 5.99, -66], [7.33, 6.2, -66], [2.67, 7, -66], [-2, 6.99, -66]]}, "script": "scripts/gen/curtain-wall.js"}}, {"at": ["feetPosition"]}, { selfId: true });
// MarketWagon: a covered trader's wagon parked at the market
export const MarketWagon = part("MarketWagon", {"castShadow": true, "physics": "static", "primitive": {"kind": "scripted", "script": "scripts/gen/coach.js"}}, {"at": ["feetPosition"], "rotation": ["rotation"]}, { selfId: true });
// SmithySign: the smithy's hanging trade sign
export const SmithySign = part("SmithySign", {"physics": "static", "primitive": {"kind": "scripted", "params": {"board": "#3b3a36", "color": "#a8452e", "icon": "anvil", "mount": "wall"}, "script": "scripts/gen/store-sign.js"}, "scale": 1.5, "state": {"kind": "store", "name": "Smithy", "title": "Smithy", "town": "valenfeld"}, "tags": ["store", "lookable"]}, {"at": ["feetPosition"], "rotation": ["rotation"]}, { selfId: true });
// WellDog: the dog that sleeps by the well
export const WellDog = part("WellDog", {"bones": {"head": {"pitch": 25}, "legBL": {"pitch": 70}, "legBR": {"pitch": 70}, "legFL": {"pitch": -80}, "legFR": {"pitch": -80}, "tail": {"yaw": 40}}, "material": {"color": "oklch(0.78 0.08 60)"}, "primitive": {"kind": "scripted", "script": "scripts/gen/wolf.js"}, "scale": 0.55, "state": {"name": "Biscuit"}, "tags": ["town-dress", "vf-beauty", "lookable"]}, {"at": ["feetPosition"], "rotation": ["rotation"]}, { selfId: true });
// HearthGlow: a fire effect hung where a hearth or chimney burns, with an optional light
export const HearthGlow = part("HearthGlow", {}, {"at": ["feetPosition"], "fx": ["fx"], "light": ["light"]}, { selfId: true });
// SewerMouthStone: a stone piece of a sewer mouth in a bank: lintel, wing wall or the trickle of water out of it
export const SewerMouthStone = part("SewerMouthStone", {"tags": ["sewer-deeps-dress"]}, {"at": ["feetPosition"], "material": ["material"], "physics": ["physics"], "primitive": ["primitive"], "rotation": ["rotation"]}, { selfId: true });
// StairRun: a run of steps built as child treads up to a door
export const StairRun = part("StairRun", {}, {"at": ["feetPosition"], "pieces": ["children"], "rotation": ["rotation"], "tags": ["tags"]}, { selfId: true });

// Valenfeld one-offs, named (Nov 7). valenfeld-life stays held: it is the town-life manager, logic not a place piece
// HildGrave: Hild's fresh grave, a quest mark in the churchyard
export const HildGrave = part("HildGrave", {"material": {"color": "oklch(0.55 0.02 120)", "roughness": 0.95}, "physics": "static", "primitive": {"depth": 0.14, "height": 0.8, "kind": "box", "width": 0.55}, "tags": ["quest-prop"], "ui": "<div face=\"front\" class=\"p-2 text-center\" style=\"color:#2b2a26;font-family:serif;font-size:60px;line-height:1.1\">HILD<br>MALLOW<br><span style=\"font-size:38px\">SHE LAUGHED</span></div>"}, {"at": ["feetPosition"], "rotation": ["rotation"], "pieces": ["children"]}, { selfId: true });
// CourierStall: the courier post stall where letters and coach fares are paid
export const CourierStall = part("CourierStall", {"tags": ["courier-stall"]}, {"at": ["feetPosition"], "rotation": ["rotation"], "pieces": ["children"]}, { selfId: true });
// CrownRoad: the crown road running through town
export const CrownRoad = part("CrownRoad", {}, {"at": ["feetPosition"], "pieces": ["children"]}, { selfId: true });
// GarretStone: Garret's marker stone
export const GarretStone = part("GarretStone", {"overrides": {"feetPosition": {"x": 40, "y": {"terrain": -0.2}, "z": 62}, "physics": "static", "primitive": {"kind": "scripted", "params": {"seed": 21}, "script": "scripts/gen/rock.js"}, "rotation": {"yaw": 30}, "scale": 1.1}, "template": "templates/kits.js#rock"}, {"at": ["feetPosition"]});
// PeatStack: stacked peat turves drying by a cottage
export const PeatStack = part("PeatStack", {"tags": ["dressing"]}, {"at": ["feetPosition"], "pieces": ["children"]}, { selfId: true });
// SewerDeepsDoor: the arched door into the sewer deeps
export const SewerDeepsDoor = part("SewerDeepsDoor", {"behavior": "scripts/gate.js", "material": {"color": "#06070a", "emissive": "#0a1408", "emissiveIntensity": 0.4, "roughness": 1}, "physics": {"body": "static", "trigger": true}, "primitive": {"depth": 0.3, "height": 1.9, "kind": "arch", "width": 1.6}, "state": {"act": "Enter", "name": "the Old Sewer Deeps", "to": "+sewer-deeps#sewer-deeps-exit"}, "tags": ["portal", "interactable", "door"]}, {"at": ["feetPosition"], "rotation": ["rotation"], "pieces": ["children"]}, { selfId: true });
// TavernCellarHatch: the tavern's cellar hatch set in the ground
export const TavernCellarHatch = part("TavernCellarHatch", {"material": {"color": "oklch(0.32 0.04 55)", "roughness": 0.95}, "physics": "static", "primitive": {"depth": 1.3, "height": 0.12, "kind": "box", "width": 1.6}, "tags": ["prop"]}, {"at": ["feetPosition"], "pieces": ["children"]}, { selfId: true });
// PilgrimLamp: the pilgrims' lamp at the temple steps
export const PilgrimLamp = part("PilgrimLamp", {"material": {"color": "oklch(0.3 0.02 60)"}, "physics": "static", "primitive": {"height": 2.2, "kind": "cylinder", "radiusBottom": 0.1, "radiusTop": 0.08}}, {"at": ["feetPosition"], "pieces": ["children"]}, { selfId: true });
// WellLantern: the lantern hung over the town well
export const WellLantern = part("WellLantern", {"castShadow": false, "tags": ["town-dress", "vf-beauty"]}, {"at": ["feetPosition"], "pieces": ["children"]}, { selfId: true });
// YardWall: a drystone yard wall laid along a spline
export const YardWall = part("YardWall", {"spline": {"kind": "wall", "points": [[-60, 10.670976945690741, 68], [-76, 10.670976945690741, 68], [-77, 10.670976945690741, 85], [-51, 10.670976945690741, 85], [-51, 10.670976945690741, 68], [-56, 10.670976945690741, 68]], "width": 0.5}}, {"at": ["feetPosition"]}, { selfId: true });
// TollSign: the painted toll board on the toll house
export const TollSign = part("TollSign", {"material": {"color": "oklch(0.35 0.05 50)"}, "parent": "vf-tollhouse", "primitive": {"depth": 0.06, "height": 0.55, "kind": "box", "width": 1.3}, "state": {"name": "Crown Toll"}, "tags": ["lookable"], "ui": "<div face=\"front\" class=\"w-full h-full flex items-center justify-center\" style=\"font-family:serif;color:#e8d9b0;font-size:150px;letter-spacing:6px\">CROWN TOLL</div>"}, {"at": ["feetPosition"]}, { selfId: true });
// QuestSatchel: a dropped satchel a quest sends you to find
export const QuestSatchel = part("QuestSatchel", {"material": {"color": "oklch(0.42 0.06 55)", "roughness": 0.9}, "physics": "static", "primitive": {"depth": 0.1, "height": 0.28, "kind": "box", "width": 0.38}, "tags": ["quest-prop"]}, {"at": ["feetPosition"], "rotation": ["rotation"], "pieces": ["children"]}, { selfId: true });
