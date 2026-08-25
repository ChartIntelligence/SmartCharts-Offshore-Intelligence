import fs from "node:fs";


const SOURCE_FILE =
  "./etopo-gulf-water-mask.json";


const NOAA_SOURCE_URL =
  "https://oceanwatch.pifsc.noaa.gov/erddap/griddap/" +
  "ETOPO_2022_v1_60s.json?" +
  "z[(18):60:(31)][(262):60:(280)]";


const OUTPUT_FILE =
  "./backend/data/gulf-water-mask-v1.json";


console.log(
  "Downloading NOAA/NCEI ETOPO Gulf water-mask subset..."
);


const response =
  await fetch(
    NOAA_SOURCE_URL
  );


if (!response.ok) {
  throw new Error(
    `NOAA ETOPO request failed: ${response.status} ${response.statusText}`
  );
}


const sourceText =
  await response.text();


fs.writeFileSync(
  SOURCE_FILE,
  sourceText,
  "utf8"
);


console.log(
  "Temporary ETOPO water-mask source downloaded."
);


const data =
  JSON.parse(
    sourceText
  );


const rows =
  data?.table?.rows ?? [];


if (!rows.length) {
  throw new Error(
    "ETOPO water-mask source contains no rows."
  );
}


const candidates =
  rows.map(
    ([
      latitude,
      longitude,
      elevationMeters
    ]) => ({
      coordinates: [
        Number(
          latitude.toFixed(4)
        ),

        Number(
          (
            longitude > 180
              ? longitude - 360
              : longitude
          ).toFixed(4)
        )
      ],

      elevationMeters:
        Number(
          elevationMeters.toFixed(2)
        ),

      water:
        elevationMeters < 0
    })
  );


const waterCount =
  candidates.filter(
    candidate =>
      candidate.water
  ).length;


const landCount =
  candidates.length -
  waterCount;


fs.mkdirSync(
  "./backend/data",
  {
    recursive: true
  }
);


const artifact = {
  source: {
    provider:
      "NOAA/NCEI",

    dataset:
      "ETOPO 2022",

    purpose:
      "Gulf search water-land discrimination"
  },

  classification: {
    water:
      "elevationMeters < 0",

    land:
      "elevationMeters >= 0"
  },

  sampling: {
    latitudeMinimum: 18,
    latitudeMaximum: 31,
    longitudeMinimum: -98,
    longitudeMaximum: -80,
    spacingDegrees: 1
  },

  counts: {
    total:
      candidates.length,

    water:
      waterCount,

    land:
      landCount
  },

  candidates,

  contractVersion:
    "pelora-gulf-water-mask-v1"
};


fs.writeFileSync(
  OUTPUT_FILE,
  JSON.stringify(
    artifact,
    null,
    2
  ),
  "utf8"
);


fs.rmSync(
  SOURCE_FILE,
  {
    force: true
  }
);


console.log(
  "Gulf water-mask artifact created."
);

console.log(
  `${candidates.length} sampled coordinates`
);

console.log(
  `${waterCount} water`
);

console.log(
  `${landCount} land`
);

console.log(
  OUTPUT_FILE
);

console.log(
  "Temporary ETOPO source removed."
);