import {
  useEffect,
  useRef
} from "react";

import {
  saveOceanSnapshot
} from "../lib/oceanMemoryStorage";


export function useOceanMemoryPersistence({
  user,
  selectedLocation,
  oceanSnapshot
}) {
  const attemptedSnapshotIds =
    useRef(
      new Set()
    );


  useEffect(() => {
    const snapshotId =
      oceanSnapshot
        ?.identity
        ?.snapshotId ??
      null;

    const integrity =
      oceanSnapshot
        ?.integrity ??
      null;

    const integrityValid =
      integrity
        ?.metadataAvailable === true &&
      integrity
        ?.observationSnapshotAvailable === true &&
      integrity
        ?.intelligenceSnapshotAvailable === true &&
      integrity
        ?.observedAtConsistent === true &&
      integrity
        ?.generatedAtConsistent === true &&
      integrity
        ?.observationContractConsistent === true &&
      integrity
        ?.intelligenceContractConsistent === true &&
      integrity
        ?.immutable === true;

    const selectedLocationAvailable =
      selectedLocation !== null &&
      typeof selectedLocation ===
        "object";

    if (
      !user?.id ||
      !selectedLocationAvailable ||
      oceanSnapshot?.available !== true ||
      oceanSnapshot?.snapshotType !==
        "ocean-memory" ||
      oceanSnapshot?.contractVersion !==
        "pelora-ocean-snapshot-assembly-v1" ||
      typeof snapshotId !==
        "string" ||
      snapshotId.trim() ===
        "" ||
      !integrityValid
    ) {
      return;
    }

    if (
      attemptedSnapshotIds
        .current
        .has(
          snapshotId
        )
    ) {
      return;
    }

    attemptedSnapshotIds
      .current
      .add(
        snapshotId
      );


    async function persistSnapshot() {
      try {
        const result =
          await saveOceanSnapshot({
            userId:
              user.id,

            oceanSnapshot
          });

        console.info(
          "Ocean Memory capture:",
          result.status,
          snapshotId
        );
      } catch (error) {
        attemptedSnapshotIds
          .current
          .delete(
            snapshotId
          );

        console.error(
          "Unable to preserve selected Ocean Snapshot:",
          error
        );
      }
    }


    persistSnapshot();
  }, [
    user?.id,
    selectedLocation,
    oceanSnapshot
  ]);
}
