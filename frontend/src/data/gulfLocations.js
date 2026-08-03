import intelligenceZones from "./intelligenceZones.json";
import gulfStructures from "./gulfStructures.json";
import boemPlatformsImported from "./boemPlatformsImported.json";
import drillShips from "./drillShips.json";
import fads from "./fads.json";


function normalizeLocationName(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}


/*
 * Priority matters:
 *
 * 1. Intelligence zones
 * 2. Curated structures
 * 3. FADs
 * 4. Drill ships
 * 5. Imported BOEM platforms
 *
 * The first version of a duplicate name is retained.
 */
const combinedLocations = [
  ...intelligenceZones,
  ...gulfStructures,
  ...fads.filter((fad) => fad.active !== false),
  ...drillShips,
  ...boemPlatformsImported,
];


const seenNames = new Set();


const gulfLocations =
  combinedLocations.filter((location) => {
    const normalizedName =
      normalizeLocationName(
        location?.name
      );

    if (!normalizedName) {
      return false;
    }

    if (
      seenNames.has(normalizedName)
    ) {
      return false;
    }

    seenNames.add(normalizedName);

    return true;
  });


export default gulfLocations;
