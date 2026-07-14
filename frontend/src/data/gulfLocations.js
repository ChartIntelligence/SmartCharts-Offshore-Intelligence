import intelligenceZones from "./intelligenceZones.json";
import oilPlatforms from "./oilPlatforms.json";
import drillShips from "./drillShips.json";
import fads from "./fads.json";
import fishingAreas from "./fishingAreas.json";
import boemPlatforms from "./boemPlatformsImported.json";

const gulfLocations = [
  ...intelligenceZones,
  ...oilPlatforms,
  ...drillShips,
  ...fads,
  ...fishingAreas,
  ...boemPlatforms
];

export default gulfLocations;