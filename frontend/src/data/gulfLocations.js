import intelligenceZones from "./intelligenceZones.json";
import oilPlatforms from "./oilPlatforms.json";
import drillShips from "./drillShips.json";
import fads from "./fads.json";
import fishingAreas from "./fishingAreas.json";

const gulfLocations = [
  ...intelligenceZones,
  ...oilPlatforms,
  ...drillShips,
  ...fads,
  ...fishingAreas
];

export default gulfLocations;