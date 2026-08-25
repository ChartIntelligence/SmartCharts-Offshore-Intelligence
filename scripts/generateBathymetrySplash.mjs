import fs from "node:fs";


const SOURCE_FILE =
  "./etopo-gulf.json";

const NOAA_SOURCE_URL =
  "https://oceanwatch.pifsc.noaa.gov/erddap/griddap/" +
  "ETOPO_2022_v1_60s.json?" +
  "z[(18):12:(31)][(262):12:(280)]";


const OUTPUT_FILE =
  "./frontend/src/assets/branding/pelora-bathymetry-real.svg";


const CONTOUR_LEVELS = [
  -100,
  -200,
  -500,
  -1000,
  -2000,
  -3000
];


const WIDTH = 1600;
const HEIGHT = 1000;

if (!fs.existsSync(SOURCE_FILE)) {
  console.log(
    "Downloading NOAA/NCEI ETOPO Gulf subset..."
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
    "Temporary Gulf subset downloaded."
  );
}

const data =
  JSON.parse(
    fs.readFileSync(
      SOURCE_FILE,
      "utf8"
    )
  );


const rows =
  data?.table?.rows ?? [];


if (!rows.length) {
  throw new Error(
    "ETOPO source contains no rows."
  );
}


const latitudes = [
  ...new Set(
    rows.map(row => row[0])
  )
].sort(
  (a, b) => a - b
);


const longitudes = [
  ...new Set(
    rows.map(row => row[1])
  )
].sort(
  (a, b) => a - b
);


const latIndex =
  new Map(
    latitudes.map(
      (value, index) => [
        value,
        index
      ]
    )
  );


const lonIndex =
  new Map(
    longitudes.map(
      (value, index) => [
        value,
        index
      ]
    )
  );


const grid =
  Array.from(
    {
      length:
        latitudes.length
    },
    () =>
      Array(
        longitudes.length
      ).fill(null)
  );


for (const [
  latitude,
  longitude,
  elevation
] of rows) {
  grid[
    latIndex.get(latitude)
  ][
    lonIndex.get(longitude)
  ] =
    elevation;
}


function project(
  x,
  y
) {
  return [
    (
      x /
      (longitudes.length - 1)
    ) * WIDTH,

    HEIGHT -
    (
      y /
      (latitudes.length - 1)
    ) * HEIGHT
  ];
}


function interpolate(
  a,
  b,
  level
) {
  if (a === b) {
    return 0.5;
  }

  return (
    level - a
  ) / (
    b - a
  );
}


function edgePoint({
  edge,
  x,
  y,
  nw,
  ne,
  se,
  sw,
  level
}) {
  let px = x;
  let py = y;


  switch (edge) {
    case 0: {
      const t =
        interpolate(
          nw,
          ne,
          level
        );

      px = x + t;
      py = y + 1;

      break;
    }


    case 1: {
      const t =
        interpolate(
          ne,
          se,
          level
        );

      px = x + 1;
      py = y + 1 - t;

      break;
    }


    case 2: {
      const t =
        interpolate(
          sw,
          se,
          level
        );

      px = x + t;
      py = y;

      break;
    }


    case 3: {
      const t =
        interpolate(
          sw,
          nw,
          level
        );

      px = x;
      py = y + t;

      break;
    }
  }


  return project(
    px,
    py
  );
}


const CASES = {
  0: [],
  1: [[3, 2]],
  2: [[2, 1]],
  3: [[3, 1]],
  4: [[0, 1]],
  5: [
    [0, 3],
    [2, 1]
  ],
  6: [[0, 2]],
  7: [[0, 3]],
  8: [[3, 0]],
  9: [[0, 2]],
  10: [
    [3, 2],
    [0, 1]
  ],
  11: [[0, 1]],
  12: [[3, 1]],
  13: [[2, 1]],
  14: [[3, 2]],
  15: []
};


function buildSegments(
  level
) {
  const segments = [];


  for (
    let y = 0;
    y < latitudes.length - 1;
    y += 1
  ) {
    for (
      let x = 0;
      x < longitudes.length - 1;
      x += 1
    ) {
      const sw =
        grid[y][x];

      const se =
        grid[y][x + 1];

      const nw =
        grid[y + 1][x];

      const ne =
        grid[y + 1][x + 1];


      if (
        ![
          sw,
          se,
          nw,
          ne
        ].every(Number.isFinite)
      ) {
        continue;
      }


      const code =
        (nw < level ? 8 : 0) |
        (ne < level ? 4 : 0) |
        (se < level ? 2 : 0) |
        (sw < level ? 1 : 0);


      const pairs =
        CASES[code] ?? [];


      for (
        const [
          firstEdge,
          secondEdge
        ] of pairs
      ) {
        segments.push([
          edgePoint({
            edge: firstEdge,
            x,
            y,
            nw,
            ne,
            se,
            sw,
            level
          }),

          edgePoint({
            edge: secondEdge,
            x,
            y,
            nw,
            ne,
            se,
            sw,
            level
          })
        ]);
      }
    }
  }


  return segments;
}


function formatPoint(
  point
) {
  return point
    .map(value =>
      value.toFixed(1)
    )
    .join(" ");
}


const contourGroups =
  CONTOUR_LEVELS.map(
    level => {
      const segments =
        buildSegments(
          level
        );


      const paths =
        segments
          .map(
            ([start, end]) =>
              `<path d="M ${formatPoint(start)} L ${formatPoint(end)}" />`
          )
          .join("\n");


      return `
  <g
    data-depth="${level}"
    opacity="${
      level >= -500
        ? "0.52"
        : level >= -1000
          ? "0.42"
          : "0.30"
    }"
  >
${paths}
  </g>`;
    }
  )
  .join("\n");


const svg = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Pelora startup bathymetry.
  Geometry derived from NOAA/NCEI ETOPO 2022
  60 arc-second global relief data.
  Decorative startup representation only.
-->
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 ${WIDTH} ${HEIGHT}"
  fill="none"
>
  <g
    stroke="#4aa5c5"
    stroke-width="1.15"
    stroke-linecap="round"
    vector-effect="non-scaling-stroke"
  >
${contourGroups}
  </g>
</svg>
`;


fs.writeFileSync(
  OUTPUT_FILE,
  svg,
  "utf8"
);


console.log(
  "Bathymetry SVG created."
);

console.log(
  `${latitudes.length} latitude rows`
);

console.log(
  `${longitudes.length} longitude columns`
);

console.log(
  OUTPUT_FILE
);


try {
  fs.unlinkSync(
    SOURCE_FILE
  );

  console.log(
    "Temporary Gulf source removed."
  );
} catch (error) {
  console.warn(
    "Temporary Gulf source could not be removed:",
    error
  );
}