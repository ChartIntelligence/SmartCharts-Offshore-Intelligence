import assert from "node:assert/strict";

import {
  buildOceanSnapshotStorageRow
} from "../oceanMemoryStorageContract.js";


function buildTestSnapshot() {
  return {
    available:
      true,

    identity: {
      snapshotId:
        "pelora-snapshot-test",

      snapshotSchemaVersion:
        "pelora-ocean-memory-snapshot-schema-v1"
    },

    metadata: {
      time: {
        observedAt:
          "2026-08-02T20:00:00.000Z",

        generatedAt:
          "2026-08-02T20:05:00.000Z"
      },

      location: {
        latitude:
          29.5,

        longitude:
          -87.2
      },

      provenance: {
        captureMode:
          "live"
      },

      lifecycleState:
        "live",

      availability: {
        classification:
          "complete"
      }
    },

    contractVersion:
      "pelora-ocean-snapshot-assembly-v1"
  };
}


const row =
  buildOceanSnapshotStorageRow({
    userId:
      "user-test",

    oceanSnapshot:
      buildTestSnapshot(),

    fishingDayReportId:
      "report-test"
  });

assert.equal(
  row.snapshot_id,
  "pelora-snapshot-test"
);

assert.equal(
  row.user_id,
  "user-test"
);

assert.equal(
  row.fishing_day_report_id,
  "report-test"
);

assert.equal(
  row.capture_mode,
  "live"
);

assert.equal(
  row.snapshot_contract_version,
  "pelora-ocean-snapshot-assembly-v1"
);

console.log(
  "PASS Ocean Memory storage row preserves governed snapshot metadata"
);


const unlinkedRow =
  buildOceanSnapshotStorageRow({
    userId:
      "user-test",

    oceanSnapshot:
      buildTestSnapshot()
  });

assert.equal(
  unlinkedRow.fishing_day_report_id,
  null
);

console.log(
  "PASS Ocean Memory storage row supports unlinked live snapshots"
);


assert.throws(
  () =>
    buildOceanSnapshotStorageRow({
      userId:
        "",

      oceanSnapshot:
        buildTestSnapshot()
    }),
  /authenticated user ID/
);

console.log(
  "PASS Ocean Memory storage requires authenticated ownership"
);


assert.throws(
  () =>
    buildOceanSnapshotStorageRow({
      userId:
        "user-test",

      oceanSnapshot: {
        ...buildTestSnapshot(),

        available:
          false
      }
    }),
  /Only available Ocean Snapshots/
);

console.log(
  "PASS Ocean Memory storage rejects unavailable snapshots"
);


assert.throws(
  () =>
    buildOceanSnapshotStorageRow({
      userId:
        "user-test",

      oceanSnapshot: {
        ...buildTestSnapshot(),

        contractVersion:
          "unsupported-version"
      }
    }),
  /Unsupported Ocean Snapshot/
);

console.log(
  "PASS Ocean Memory storage rejects unsupported contracts"
);


assert.throws(
  () => {
    const snapshot =
      buildTestSnapshot();

    snapshot.metadata.location.latitude =
      null;

    buildOceanSnapshotStorageRow({
      userId:
        "user-test",

      oceanSnapshot:
        snapshot
    });
  },
  /latitude/
);

console.log(
  "PASS Ocean Memory storage discloses missing required fields"
);


assert.throws(
  () => {
    const snapshot =
      buildTestSnapshot();

    snapshot.metadata.time.observedAt =
      "not-a-date";

    buildOceanSnapshotStorageRow({
      userId:
        "user-test",

      oceanSnapshot:
        snapshot
    });
  },
  /observedAt must be a valid timestamp/
);

console.log(
  "PASS Ocean Memory storage validates observation timestamps"
);
