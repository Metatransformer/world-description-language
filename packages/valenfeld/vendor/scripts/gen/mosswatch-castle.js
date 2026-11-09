import { kit } from './barrow-kit.js';
function build(ctx, col) {
  const k = kit(ctx, col);
  k.paint('cdn/texture-grey-ashlar-stone-wall.png', '#c4c7b5');
  // Earth-filled foundations sink below the hillside; the open gate has no invisible collider.
  k.box(-18,-12,-15,18,-0.2,14);
  k.box(-18,-1,-15,-16,8,14); k.box(16,-1,-15,18,6,14);
  k.box(-18,-1,-15,18,7,-13);
  k.box(-18,-1,12,-2.4,7,14); k.box(2.4,-1,12,18,7,14);
  k.box(-2.4,4.5,12,2.4,7,14);
  for (const [x,z,h] of [[-14,10,13],[14,10,10],[-14,-11,9]]) {
    k.box(x-3,-1,z-3,x-2,h,z+3); k.box(x+2,-1,z-3,x+3,h-1,z+3);
    k.box(x-2,-1,z-3,x+2,h-2,z-2); k.box(x-2,-1,z+2,x+2,h,z+3);
    for (let a=-2;a<=2;a+=2) k.box(x+a-.45,h,z+2,x+a+.45,h+1.2,z+3);
  }
  for(let x=-17;x<18;x+=3) { if(Math.abs(x)>3) k.box(x,7,12,x+1.3,8.2,14); }
  k.paint('cdn/texture-dark-oak-planks-weathered.png','#786952');
  k.at(()=>k.box(-10,0,-.25,10,.35,.25),-5,2,-8,18,0,12);
}
export function geometry(ctx) { build(ctx,false); }
export function collider(ctx) { build(ctx,true); }
