import oilPlatforms from "./oilPlatforms.json";
import drillships from "./drillships.json";
import fads from "./fads.json";
import intelligenceZones from "./intelligenceZones.json";

const gulfLocations = [
  ...intelligenceZones,
  ...oilPlatforms,
  ...drillships,
  ...fads
];

export default gulfLocations;