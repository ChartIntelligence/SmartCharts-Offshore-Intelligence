// Shared evidence normalization, independent of species habitat rules.
// Preserve existing nonblank numeric-string support at candidate boundaries.
export function normalizeBathymetryElevationV1(value) {
  if (typeof value !== "number" &&
      !(typeof value === "string" && value.trim() !== "")) return null;
  const elevation = Number(value);
  return Number.isFinite(elevation) ? elevation : null;
}

// ETOPO JSON ingestion already expects numeric observations and rounds to 2 decimals.
export function normalizeEtopoWaterMaskObservationV1(value) {
  const elevation = typeof value === "number" ? normalizeBathymetryElevationV1(value) : null;
  return {
    elevationMeters: elevation === null ? null : Number(elevation.toFixed(2)),
    water: elevation === null ? null : elevation < 0
  };
}
