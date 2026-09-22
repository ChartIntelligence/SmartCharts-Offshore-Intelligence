// Bounded ERDDAP acquisition. Coordinates and masks come from provider rows.
export async function readProviderJson(url, fetchImpl = fetch) {
  const response = await fetchImpl(url, {signal: AbortSignal.timeout(20000)});
  if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
  const reader = response.body.getReader();
  let bytes = 0;
  const chunks = [];
  while (true) {
    const {done,value} = await reader.read();
    if (done) break;
    bytes += value.byteLength;
    if (bytes > 2_000_000) { await reader.cancel(); throw new Error("Provider payload exceeds 2 MB limit"); }
    chunks.push(Buffer.from(value));
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

export function parseGridRows(product, tables, validTime, maxCells = product.maxCells) {
  const cells = new Map();
  const missing = value => !Number.isFinite(value) || value === -99999 || value === -214748.3648;
  for (const table of tables) {
    if (!Array.isArray(table?.columnNames) || !Array.isArray(table?.rows)) throw new Error("Invalid provider table");
    const required = ["latitude", "longitude", ...product.variables, ...(validTime ? ["time"] : [])];
    if (required.some(name => !table.columnNames.includes(name))) throw new Error("Missing provider columns");
    if (table.rows.length > maxCells) throw new Error("Provider grid exceeds cell limit");
    for (const row of table.rows) {
      const get = name => row[table.columnNames.indexOf(name)];
      const lat = get("latitude"), rawLon = get("longitude");
      if (!Number.isFinite(lat) || Math.abs(lat)>90 || !Number.isFinite(rawLon) || rawLon < -180 || rawLon>360)
        throw new Error("Invalid provider coordinates");
      const lon = rawLon > 180 ? rawLon-360 : rawLon;
      if (validTime && Date.parse(get("time")) !== Date.parse(validTime)) throw new Error("Mixed field valid times");
      const values = product.variables.map(name => missing(get(name)) ? null : get(name));
      if (product.layer === "currents" && values.some(v => v === null)) values.fill(null);
      cells.set(`${lon},${lat}`, [lon,lat,...values]);
      if (cells.size > maxCells) throw new Error("Provider grid exceeds cell limit");
    }
  }
  return [...cells.values()];
}

export function createErddapAdapter(readJson = readProviderJson) {
  const latestCache = new Map();
  return async (product, request) => {
    let validTime = null;
    if (product.layer === "currents") {
      const cached = latestCache.get(product.id);
      if (cached && Date.now()-cached.at<60000) validTime = cached.time;
      else {
        const info = await readJson(`${product.baseUrl}/info/${product.dataset}/index.json`);
        validTime = info.table?.rows?.find(row => row[1]==="NC_GLOBAL" && row[2]==="time_coverage_end")?.[4];
        if (!Number.isFinite(Date.parse(validTime))) throw new Error("Provider valid time unavailable");
        latestCache.set(product.id,{time:validTime,at:Date.now()});
      }
    }
    const [w,s,e,n] = request.bounds;
    const step = product.nativeResolutionDegrees;
    const stride = Math.max(1,Math.ceil(Math.max(e-w,n-s)/(request.density-1)/step));
    const pieces = product.longitudeConvention === "0-360" && w < 0 && e > 0 ? [[w,0],[0,e]] : [[w,e]];
    const tables = [];
    for (const [west,east] of pieces) {
      const a = product.longitudeConvention === "0-360" && west<0 ? west+360 : west;
      const b = product.longitudeConvention === "0-360" && east<=0 && west<0 ? east+360 : east;
      const [minLon,minLat,maxLon,maxLat] = product.nativeBounds;
      const south=Math.max(s,minLat), north=Math.min(n,maxLat);
      const start=Math.max(a,minLon), stop=Math.min(b,maxLon);
      if (south>north || start>stop) continue;
      const slice = `${validTime ? `[(${validTime})]` : ""}[(${south}):${stride}:(${north})][(${start}):${stride}:(${stop})]`;
      const query = product.variables.map(v=>v+slice).join(",");
      tables.push((await readJson(`${product.baseUrl}/griddap/${product.dataset}.json?${encodeURIComponent(query)}`)).table);
    }
    const cells = parseGridRows(product,tables,validTime);
    return {cells, validTime, stride, retrievedAt:new Date().toISOString()};
  };
}
