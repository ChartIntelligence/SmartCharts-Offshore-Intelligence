// Labels consume existing field state and freshness policy; no new thresholds.
export function captainFieldStatus(state, now) {
  const field = state?.field;
  const age = field?.validTime ? Math.max(0, (now - Date.parse(field.validTime)) / 3600000) : null;
  const ageText = Number.isFinite(age) ? ` · ${Math.floor(age)}h old` : "";
  const stale = state?.status === "stale" || field?.status === "stale" ||
    (Number.isFinite(age) && field?.freshness?.maxFreshAgeHours != null && age > field.freshness.maxFreshAgeHours);
  const retained = stale ? "Stale · latest available" : field?.status === "latest-available" ? "Latest available" : "Available";
  if (state?.status === "loading" || !state) return `Loading…${field ? " · " + retained + ageText : ""}`;
  if (state.status === "off") return "Off";
  if (state.status === "degraded") return `Degraded${field ? " · " + retained + ageText : " · unavailable"}`;
  if (state.status === "error") return `Error${field ? " · " + retained + ageText : " · unavailable"}`;
  if (!field || state.status === "unavailable" || field.status === "unavailable") return "Unavailable";
  return retained + ageText;
}

