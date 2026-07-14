import fs from "node:fs";
import path from "node:path";
import process from "node:process";


const INCLUDED_AREAS = new Set([
  "AC", // Alaminos Canyon
  "AT", // Atwater Valley
  "DC", // DeSoto Canyon
  "GB", // Garden Banks
  "GC", // Green Canyon
  "KC", // Keathley Canyon
  "LL", // Lloyd Ridge
  "MC", // Mississippi Canyon
  "VK", // Viosca Knoll
  "WR"  // Walker Ridge
]);

const ROOT =
  process.cwd();

const INPUT_PATH =
  path.join(
    ROOT,
    "scripts",
    "source-data",
    "boem-platform-locations",
    "platloc.DAT"
  );

const OUTPUT_PATH =
  path.join(
    ROOT,
    "frontend",
    "src",
    "data",
    "boemPlatformsImported.json"
  );


function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function cleanPlatformName(
  rawLabel,
  area,
  subarea,
  block,
  complexId
) {
  const label =
    String(rawLabel || "")
      .replace(/\s+/g, " ")
      .trim();

  /*
   * Handles:
   * A (Hoover)
   * A(Horn Mountain
   * A(Allegheny Sea
   */
  const parenthetical =
    label.match(
      /^[A-Z]?\s*\(([^)]+)\)?/i
    );

  if (parenthetical?.[1]) {
    return parenthetical[1].trim();
  }

  /*
   * Remove common leading platform
   * designations when followed by a name.
   */
  const cleaned =
    label
      .replace(
        /^[A-Z]\s+(?=[A-Za-z])/,
        ""
      )
      .trim();

  const isWeakName =
    !cleaned ||
    /^#?\d+$/.test(cleaned) ||
    /^[A-Z](-AUX\.?)?$/i.test(cleaned) ||
    cleaned.length < 3;

  if (!isWeakName) {
    return cleaned;
  }

  return `${area}${subarea ? ` ${subarea}` : ""} ${block} Platform ${complexId}`;
}

function extractLabel(details) {
  return String(details || "")
    /*
     * Remove survey offsets such as:
     * 5694S 2590E
     */
    .replace(
      /\s+\d{1,5}[NSEW]\s+\d{1,5}[NSEW].*$/i,
      ""
    )

    /*
     * Remove trailing large coordinate or
     * reference numbers.
     */
    .replace(
      /\s+\d{6,}.*$/,
      ""
    )
    .trim();
}


function parseRecord(
  line,
  lineNumber
) {
  const coordinateMatch =
    line.match(
      /(-?\d+\.\d+)\s+(-?\d+\.\d+)\s*$/
    );

  if (!coordinateMatch) {
  return null;
}


  const longitude =
    Number(coordinateMatch[1]);

  const latitude =
    Number(coordinateMatch[2]);


  if (
    !Number.isFinite(longitude) ||
    !Number.isFinite(latitude)
  ) {
    return null;
  }


  const prefix =
    line
      .slice(
        0,
        coordinateMatch.index
      )
      .trimEnd();


  /*
   * Examples:
   *
   * 4 183 1AC 25 A (Hoover) ...
   * 90320 1AT 37 PLEM 1A ...
   *
   * The first district field is optional.
   */
  
  const headerMatch =
  prefix.match(
    /^\s*(?:(\d+)\s+)?(\d+)\s+(\d[A-Z]{2})(?:\s+([A-Z]))?\s+(\d+)\s*(.*)$/
  );


 if (!headerMatch) {
  return null;
}


const [
  ,
  district = null,
  complexId,
  areaIdentifier,
  subarea = null,
  block,
  details = ""
] = headerMatch;


  const area =
    areaIdentifier.slice(1);

  const rawLabel =
    extractLabel(details);

  const name =
  cleanPlatformName(
    rawLabel,
    area,
    subarea,
    block,
    complexId
  );


  return {
  id: [
    "boem",
    area.toLowerCase(),
    subarea
      ? subarea.toLowerCase()
      : null,
    block,
    complexId
  ]
    .filter(Boolean)
    .join("-"),

    name,

    shortName: name,

    category:
      "oil_platform",

    type:
      "Offshore Platform",

    region:
  `${area}${subarea ? ` ${subarea}` : ""} ${block}`,

    coordinates: [
      latitude,
      longitude
    ],

    depth:
      "Waiting for verified water depth",

    influenceRadius:
      3500,

    active:
      true,

    source: {
      agency:
        "BOEM",

        subarea,

      dataset:
        "Platform Locations",

      complexId,

      district:
        district
          ? Number(district)
          : null,

      area,

      areaIdentifier,

      block:
        Number(block),

      datum:
        "NAD27",

      rawLabel:
        rawLabel || null,

      importedAt:
        new Date().toISOString(),

      locationAccuracy:
        "Approximate GIS coordinate"
    },

    structureProfile: {
      baitRetention: 0,
      currentInteraction: 0,
      marlinAttraction: 0
    },

    scores: {
      blueMarlin: 0,
      yellowfin: 0,
      blackfin: 0
    },

    conditions: {
      sst: null,
      current: null,
      chlorophyll: null
    },

    recommendation:
      "Review live ocean conditions before evaluating this structure."
  };
}


function main() {
  if (!fs.existsSync(INPUT_PATH)) {
    throw new Error(
      `BOEM input file not found: ${INPUT_PATH}`
    );
  }

  const lines =
    fs
      .readFileSync(
        INPUT_PATH,
        "utf8"
      )
      .split(/\r?\n/)
      .filter(Boolean);

  const parsed =
    lines
      .map((line, index) =>
        parseRecord(
          line,
          index + 1
        )
      )
      .filter(Boolean)
      .filter((platform) =>
        INCLUDED_AREAS.has(
          platform.source.area
        )
      )
      .filter((platform) => {
  const rawLabel =
    String(
      platform.source.rawLabel || ""
    ).toLowerCase();

  const excludedTerms = [
    "removed",
    "aux",
    "plet",
    "valve",
    "sump",
    "separator",
    "flare",
    "crane",
    "scrub",
    "floor brg",
    "manifold",
    "manifo",
    "ssmanifo",
    "pig"
  ];

  return !excludedTerms.some(
    (term) =>
      rawLabel.includes(term)
  );
});

  const uniqueById =
    new Map();

  parsed.forEach((platform) => {
    uniqueById.set(
      platform.id,
      platform
    );
  });

  const platforms =
    [...uniqueById.values()]
      .sort((a, b) =>
        a.name.localeCompare(
          b.name
        )
      );

  fs.writeFileSync(
    OUTPUT_PATH,
    `${JSON.stringify(
      platforms,
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(
    `Input records: ${lines.length}`
  );

  console.log(
    `Parsed records: ${parsed.length}`
  );

  console.log(
    `Unique records: ${platforms.length}`
  );

  console.log(
    `Created: ${OUTPUT_PATH}`
  );

  console.log(
    "First five records:"
  );

  console.log(
    platforms.slice(0, 5)
  );
}

main();