function requireUserId(
  userId
) {
  if (
    typeof userId !== "string" ||
    userId.trim() === ""
  ) {
    throw new Error(
      "A valid authenticated user ID is required."
    );
  }

  return userId;
}


function requireTimestamp(
  value,
  label
) {
  if (
    typeof value !== "string" ||
    !Number.isFinite(
      Date.parse(value)
    )
  ) {
    throw new Error(
      `${label} must be a valid timestamp.`
    );
  }

  return value;
}


function requireOceanSnapshot(
  oceanSnapshot
) {
  if (
    !oceanSnapshot ||
    typeof oceanSnapshot !== "object" ||
    Array.isArray(oceanSnapshot)
  ) {
    throw new Error(
      "A valid Ocean Snapshot is required."
    );
  }

  if (
    oceanSnapshot.available !== true
  ) {
    throw new Error(
      "Only available Ocean Snapshots may be stored."
    );
  }

  if (
    oceanSnapshot.contractVersion !==
    "pelora-ocean-snapshot-assembly-v1"
  ) {
    throw new Error(
      "Unsupported Ocean Snapshot contract version."
    );
  }

  return oceanSnapshot;
}


export function buildOceanSnapshotStorageRow({
  userId,
  oceanSnapshot,
  fishingDayReportId = null
}) {
  const validUserId =
    requireUserId(userId);

  const snapshot =
    requireOceanSnapshot(
      oceanSnapshot
    );

  const metadata =
    snapshot.metadata ?? {};

  const requiredFields = {
    snapshotId:
      snapshot.identity
        ?.snapshotId ?? null,

    snapshotSchemaVersion:
      snapshot.identity
        ?.snapshotSchemaVersion ?? null,

    observedAt:
      metadata.time
        ?.observedAt ?? null,

    latitude:
      metadata.location
        ?.latitude ?? null,

    longitude:
      metadata.location
        ?.longitude ?? null,

    captureMode:
      metadata.provenance
        ?.captureMode ?? null,

    lifecycleState:
      metadata.lifecycleState ?? null,

    availabilityClassification:
      metadata.availability
        ?.classification ?? null
  };

  const missingFields =
    Object.entries(requiredFields)
      .filter(
        ([, value]) =>
          value === null ||
          value === undefined ||
          value === ""
      )
      .map(
        ([field]) =>
          field
      );

  if (
    missingFields.length > 0
  ) {
    throw new Error(
      `Ocean Snapshot storage fields are missing: ${missingFields.join(", ")}.`
    );
  }

  return {
    snapshot_id:
      requiredFields.snapshotId,

    user_id:
      validUserId,

    fishing_day_report_id:
      typeof fishingDayReportId === "string" &&
      fishingDayReportId.trim() !== ""
        ? fishingDayReportId
        : null,

    observed_at:
      requireTimestamp(
        requiredFields.observedAt,
        "observedAt"
      ),

    generated_at:
      metadata.time
        ?.generatedAt == null
        ? null
        : requireTimestamp(
            metadata.time.generatedAt,
            "generatedAt"
          ),

    latitude:
      requiredFields.latitude,

    longitude:
      requiredFields.longitude,

    capture_mode:
      requiredFields.captureMode,

    lifecycle_state:
      requiredFields.lifecycleState,

    availability_classification:
      requiredFields.availabilityClassification,

    snapshot_schema_version:
      requiredFields.snapshotSchemaVersion,

    snapshot_contract_version:
      snapshot.contractVersion,

    snapshot_payload:
      snapshot
  };
}
