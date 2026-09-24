// Narrow, fail-closed NetCDF-3 decoder for the inspected ERDDAP response.
// No network, packing inference, numeric coercion or scientific interpolation.
export function decodeNetcdf(bytes) {
  const b = Buffer.from(bytes); let p = 0;
  const require = condition => { if (!condition) throw Error('Unsupported or malformed pilot NetCDF'); };
  const take = n => { require(Number.isSafeInteger(n) && n >= 0 && p + n <= b.length); const start = p; p += n; return start; };
  const u32 = () => b.readUInt32BE(take(4));
  const pad = n => take((4 - n % 4) % 4);
  const name = () => { const n = u32(); require(n < 65536); const s = b.toString('utf8', take(n), p); pad(n); return s; };
  const size = {1: 1, 2: 1, 3: 2, 4: 4, 5: 4, 6: 8};
  const numeric = (type, count) => {
    require(Object.hasOwn(size, type) && count <= 1000000);
    const start = take(size[type] * count);
    if (type === 2) return b.toString('utf8', start, p);
    const methods = {1: 'readInt8', 3: 'readInt16BE', 4: 'readInt32BE', 5: 'readFloatBE', 6: 'readDoubleBE'};
    return Array.from({length: count}, (_, i) => b[methods[type]](start + i * size[type]));
  };
  const list = (tag, read) => {
    const t = u32(), count = u32(); require((t === tag || t === 0 && count === 0) && count < 10000);
    return Array.from({length: count}, read);
  };
  const attrs = () => Object.fromEntries(list(12, () => {
    const key = name(), type = u32(), count = u32(); const value = numeric(type, count); pad(size[type] * count);
    return [key, typeof value === 'string' ? value : value.length === 1 ? value[0] : value];
  }));
  require(b.toString('ascii', 0, 3) === 'CDF' && [1, 2].includes(b[3]));
  const version = b[3]; p = 4; const records = u32();
  const dimensions = list(10, () => ({name: name(), length: u32()}));
  require(dimensions.every(d => d.length > 0)); // No record-variable interleaving in this narrow decoder.
  const global = attrs();
  const variables = list(11, () => {
    const variable = {name: name()}; const count = u32(); require(count <= dimensions.length);
    variable.dimensions = Array.from({length: count}, () => u32());
    require(variable.dimensions.every(i => i < dimensions.length));
    variable.attributes = attrs(); variable.type = u32(); variable.byteSize = u32();
    variable.offset = version === 1 ? u32() : Number(b.readBigUInt64BE(take(8)));
    return variable;
  });
  const headerEnd = p;
  for (const v of variables) {
    const count = v.dimensions.reduce((n, i) => n * dimensions[i].length, 1);
    require(v.offset >= headerEnd && Number.isSafeInteger(v.offset) && Object.hasOwn(size, v.type));
    require(count * size[v.type] <= v.byteSize);
    p = v.offset; v.values = numeric(v.type, count);
  }
  require(new Set(variables.map(v => v.name)).size === variables.length);
  return {version, records, dimensions, global, variables: Object.fromEntries(variables.map(v => [v.name, v]))};
}
