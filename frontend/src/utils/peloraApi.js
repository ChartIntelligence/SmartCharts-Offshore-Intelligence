const HOSTED_PELORA_API = "https://velion-ocean-engine.onrender.com";

// The optional environment argument supports deterministic, network-free tests.
// Endpoints and species are request data, never environment selectors.
export function resolvePeloraApiUrl(path, environment = import.meta.env ?? {}) {
  const override = environment.VITE_PELORA_API_BASE?.trim();
  let base = override || (environment.DEV ? "" : HOSTED_PELORA_API);
  if (base.startsWith("//") || /[?#]/.test(base)) {
    throw new TypeError("Invalid Pelora API base configuration");
  }
  if (base && !base.startsWith("/")) {
    const url = new URL(base);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
      throw new TypeError("Invalid Pelora API base configuration");
    }
    base = url.origin + url.pathname.replace(/\/{2,}/g, "/");
  } else {
    base = base.replace(/\/{2,}/g, "/");
  }
  base = base.replace(/\/+$/, "").replace(/\/api$/, "");

  // Normalize only the path; preserve query strings byte-for-byte.
  const queryIndex = path.indexOf("?");
  const pathname = queryIndex < 0 ? path : path.slice(0, queryIndex);
  const query = queryIndex < 0 ? "" : path.slice(queryIndex);
  const endpoint = pathname.replace(/^\/+/, "").replace(/^api(?:\/|$)/, "");
  if (!endpoint || endpoint.includes(":") || endpoint.includes("#") ||
      endpoint.split("/").some(segment => !segment || segment === "." || segment === ".." || segment === "api")) {
    throw new TypeError("Invalid Pelora API endpoint path");
  }
  return `${base}/api/${endpoint}${query}`;
}
