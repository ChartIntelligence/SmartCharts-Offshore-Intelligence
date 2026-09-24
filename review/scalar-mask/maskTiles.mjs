// REJECTED EXPERIMENT: MASK_SAFETY_UNRESOLVED UNDER PIXEL-AUTHORITY CRITERION.
// Neither guard is selected. Historical algorithm only; no production imports.
import {POLICY,tileIdentity,sourceIndex,lonLat,encodePng} from '../scalar-tiles/presentationTiles.mjs';
import {sstColor} from '../../frontend/src/utils/syntheticSstDisplay.js';
export function maskPolicy(guard) {
  if(!Number.isInteger(guard)||guard<0||guard>2)throw Error('Review guard must be 0, 1 or 2');
  return Object.freeze({...POLICY,renderer:'synthetic-scalar-mask-xyz-v1',mask:'chebyshev-missing-dilation-v1',guard,
    overview:'each-z-exact-source-cell-center-v1',halo:'global-tile-pixel-centers-v1'});
}
export function guardedTile(field,z,x,y,guard) {
  const policy=maskPolicy(guard),id=tileIdentity(field.deliveryId,z,x,y,policy),size=policy.size;
  if(field.grid.axes.x.length<2||field.grid.axes.y.length<2)throw Error('No singleton footprint');
  const span=size+2*guard,halo=new Int32Array(span*span);
  // Sample the same global pixel lattice beyond this tile, never treating tile edge as missing.
  for(let row=-guard;row<size+guard;row++)for(let col=-guard;col<size+guard;col++)
    halo[(row+guard)*span+col+guard]=sourceIndex(field,...lonLat(z,x,y,col+0.5,row+0.5,size));
  const valid=i=>i>=0&&field.grid.missing[i]===null;
  const rgba=new Uint8Array(size*size*4);let validPixels=0,suppressedPixels=0;
  for(let row=0;row<size;row++)for(let col=0;col<size;col++) {
    const index=halo[(row+guard)*span+col+guard];if(!valid(index))continue;validPixels++;
    let safe=true;
    for(let dy=-guard;dy<=guard&&safe;dy++)for(let dx=-guard;dx<=guard;dx++)
      if(!valid(halo[(row+guard+dy)*span+col+guard+dx])){safe=false;break;}
    if(!safe){suppressedPixels++;continue;}
    const color=sstColor(field.grid.values[index]);if(!color)throw Error('Invalid scientific value');
    rgba.set([...color.match(/\d+/g).map(Number),255],(row*size+col)*4);
  }
  return {id,policy,rgba,png:encodePng(size,size,rgba),validPixels,suppressedPixels};
}
