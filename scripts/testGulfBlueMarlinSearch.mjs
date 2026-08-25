import {
  evaluateControlledGulfBlueMarlinV1
} from "../backend/server.js";


const maximumCandidates =
  Number(
    process.argv[2]
  ) || 6;

const concurrency =
  Number(
    process.argv[3]
  ) || 3;


const startedAt =
  Date.now();


const result =
  await evaluateControlledGulfBlueMarlinV1({
    maximumCandidates,
    concurrency
  });


console.log(
  "seconds",
  (
    (
      Date.now() -
      startedAt
    ) /
    1000
  ).toFixed(2)
);


console.log(
  "evaluation",
  result.evaluation
);


console.table(
  result.opportunities.map(
    opportunity => ({
      rank:
        opportunity.rank,

      latitude:
        opportunity.location
          ?.coordinates?.[0],

      longitude:
        opportunity.location
          ?.coordinates?.[1],

      score:
        opportunity.score,

      confidence:
        opportunity.confidence
          ?.score,

      pathway:
        opportunity.pathway,

      signal:
        opportunity.primarySignal
          ?.type ?? null
    })
  )
);