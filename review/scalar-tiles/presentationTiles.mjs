// Presentation experiment only. PNG pixels must never be used as scientific evidence.
import {createHash} from 'node:crypto';
import {deflateSync} from 'node:zlib';
import {sstColor} from '../../frontend/src/utils/syntheticSstDisplay.js';
const canonical = v => Array.isArray(v) ? `[${v.map(canonical).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map(k => `${JSON.stringify(k)}:${canonical(v[k])}`).join(',')}}` : JSON.stringify(v);
export const POLICY = Object.freeze({renderer: 'synthetic-scalar-xyz-v1', ramp: 'sst-review-ramp-v1', mask: 'all-missing-transparent-v1', resampling: 'pixel-center-source-cell-v1', projection: 'EPSG:3857', size: 256});
export function tileIdentity(derivativeId, z, x, y, policy = POLICY) {
  if (!/^osfd-[a-f0-9]{64}$/.test(derivativeId) || ![z,x,y].every(Number.isSafeInteger) || z < 0 || z > 22 || x < 0 || y < 0 || x >= 2 ** z || y >= 2 ** z) throw Error('Invalid tile identity');
  return 'spt-' + createHash('sha256').update(canonical({derivativeId, z, x, y, policy})).digest('hex');
}
export function lonLat(z, x, y, px, py, size = 256) {
  const n = 2 ** z;
  return [(x + px / size) / n * 360 - 180, Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + py / size) / n))) * 180 / Math.PI];
}
// Midpoint footprints, clipped to original axis endpoints. Ties belong to east/north.
// A scientific cell can span several tiles; no scientific samples are added or duplicated.
export function sourceIndex(field, lon, lat) {
  const {axes: {x,y}, width} = field.grid;
  if (lon < x[0] || lon > x.at(-1) || lat < y[0] || lat > y.at(-1)) return -1;
  const index = (a,v) => { let i = 0; while (i + 1 < a.length && v >= (a[i] + a[i+1]) / 2) i++; return i; };
  return index(y,lat) * width + index(x,lon);
}
export function rasterTile(field, z, x, y) {
  const id = tileIdentity(field.deliveryId,z,x,y);
  if (field.grid.axes.x.length < 2 || field.grid.axes.y.length < 2) throw Error('No inferred singleton footprint');
  const size = POLICY.size, rgba = new Uint8Array(size * size * 4), indices = new Int32Array(size * size).fill(-1);
  for (let row = 0; row < size; row++) for (let col = 0; col < size; col++) {
    const cell = sourceIndex(field,...lonLat(z,x,y,col+0.5,row+0.5,size)), offset = row * size + col;
    indices[offset] = cell;
    if (cell < 0 || field.grid.missing[cell] !== null) continue;
    const color = sstColor(field.grid.values[cell]);
    if (!color) throw Error('Invalid scientific number');
    rgba.set([...color.match(/\d+/g).map(Number),255],offset*4);
  }
  return {id,rgba,indices,png: encodePng(size,size,rgba)};
}
function crc(bytes) { let c = 0xffffffff; for (const b of bytes) { c ^= b; for (let i=0;i<8;i++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0); } return (c ^ 0xffffffff) >>> 0; }
function chunk(type,data) { const t=Buffer.from(type), len=Buffer.alloc(4), sum=Buffer.alloc(4); len.writeUInt32BE(data.length); sum.writeUInt32BE(crc(Buffer.concat([t,data]))); return Buffer.concat([len,t,data,sum]); }
export function encodePng(width,height,rgba) {
  const header=Buffer.alloc(13); header.writeUInt32BE(width,0); header.writeUInt32BE(height,4); header[8]=8; header[9]=6;
  const scan=Buffer.alloc(height*(width*4+1));
  for(let row=0;row<height;row++) scan.set(rgba.subarray(row*width*4,(row+1)*width*4),row*(width*4+1)+1);
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),chunk('IDAT',deflateSync(scan)),chunk('IEND',Buffer.alloc(0))]);
}
