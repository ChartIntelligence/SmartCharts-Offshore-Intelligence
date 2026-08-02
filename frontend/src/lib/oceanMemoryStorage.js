import {
  supabase as defaultSupabase
} from "./supabase";

import {
  buildOceanSnapshotStorageRow
} from "./oceanMemoryStorageContract.js";


const TABLE =
  "ocean_snapshots";


let storageClient =
  defaultSupabase;


export function setOceanMemoryStorageClientForTests(
  client
) {
  storageClient =
    client ?? defaultSupabase;
}


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




export async function saveOceanSnapshot({
  userId,
  oceanSnapshot,
  fishingDayReportId = null
}) {
  const row =
    buildOceanSnapshotStorageRow({
      userId,
      oceanSnapshot,
      fishingDayReportId
    });

  const {
    data: createdRow,
    error: insertError
  } =
    await storageClient
      .from(TABLE)
      .insert(
        row
      )
      .select()
      .maybeSingle();

  if (
    !insertError
  ) {
    return {
      status:
        "created",

      row:
        createdRow
    };
  }

  if (
    insertError.code !==
    "23505"
  ) {
    throw insertError;
  }

  const {
    data: existingRow,
    error: existingError
  } =
    await storageClient
      .from(TABLE)
      .select("*")
      .eq(
        "user_id",
        row.user_id
      )
      .eq(
        "snapshot_id",
        row.snapshot_id
      )
      .maybeSingle();

  if (existingError) {
    throw existingError;
  }

  if (!existingRow) {
    throw new Error(
      "The Ocean Snapshot already exists but could not be retrieved."
    );
  }

  return {
    status:
      "already-exists",

    row:
      existingRow
  };
}


export async function getOceanSnapshotById({
  userId,
  snapshotId
}) {
  const validUserId =
    requireUserId(userId);

  if (
    typeof snapshotId !== "string" ||
    snapshotId.trim() === ""
  ) {
    throw new Error(
      "A valid snapshot ID is required."
    );
  }

  const {
    data,
    error
  } =
    await storageClient
      .from(TABLE)
      .select("*")
      .eq(
        "user_id",
        validUserId
      )
      .eq(
        "snapshot_id",
        snapshotId
      )
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


export async function getLatestOceanSnapshot({
  userId,
  latitude = null,
  longitude = null
}) {
  const validUserId =
    requireUserId(userId);

  let query =
    storageClient
      .from(TABLE)
      .select("*")
      .eq(
        "user_id",
        validUserId
      );

  if (
    Number.isFinite(latitude)
  ) {
    query =
      query.eq(
        "latitude",
        latitude
      );
  }

  if (
    Number.isFinite(longitude)
  ) {
    query =
      query.eq(
        "longitude",
        longitude
      );
  }

  const {
    data,
    error
  } =
    await query
      .order(
        "observed_at",
        {
          ascending:
            false
        }
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


export async function getPreviousOceanSnapshot({
  userId,
  latitude,
  longitude,
  beforeObservedAt
}) {
  const validUserId =
    requireUserId(userId);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error(
      "Valid snapshot coordinates are required."
    );
  }

  requireTimestamp(
    beforeObservedAt,
    "beforeObservedAt"
  );

  const {
    data,
    error
  } =
    await storageClient
      .from(TABLE)
      .select("*")
      .eq(
        "user_id",
        validUserId
      )
      .eq(
        "latitude",
        latitude
      )
      .eq(
        "longitude",
        longitude
      )
      .lt(
        "observed_at",
        beforeObservedAt
      )
      .order(
        "observed_at",
        {
          ascending:
            false
        }
      )
      .limit(1)
      .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}


export async function getOceanSnapshotsBetweenDates({
  userId,
  startObservedAt,
  endObservedAt,
  latitude = null,
  longitude = null
}) {
  const validUserId =
    requireUserId(userId);

  requireTimestamp(
    startObservedAt,
    "startObservedAt"
  );

  requireTimestamp(
    endObservedAt,
    "endObservedAt"
  );

  let query =
    storageClient
      .from(TABLE)
      .select("*")
      .eq(
        "user_id",
        validUserId
      )
      .gte(
        "observed_at",
        startObservedAt
      )
      .lte(
        "observed_at",
        endObservedAt
      );

  if (
    Number.isFinite(latitude)
  ) {
    query =
      query.eq(
        "latitude",
        latitude
      );
  }

  if (
    Number.isFinite(longitude)
  ) {
    query =
      query.eq(
        "longitude",
        longitude
      );
  }

  const {
    data,
    error
  } =
    await query.order(
      "observed_at",
      {
        ascending:
          true
      }
    );

  if (error) {
    throw error;
  }

  return data ?? [];
}
