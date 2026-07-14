import {
  useMemo,
  useState
} from "react";


function getLocationType(spot) {
  const category =
    String(
      spot.category || ""
    ).toLowerCase();

  const type =
    String(
      spot.type || ""
    ).toLowerCase();

  if (
    category === "oil_platform" ||
    category === "structure" ||
    type.includes("platform") ||
    type.includes("rig") ||
    type.includes("drillship")
  ) {
    return "platform";
  }

  if (
    category === "fad" ||
    type.includes("fish aggregating device")
  ) {
    return "fad";
  }

  return "fishing-ground";
}


function LocationSearch({
  structures = [],
  selectedSpot,
  setSelectedSpot
}) {

  const [
    searchOpen,
    setSearchOpen
  ] = useState(false);

  const [
    query,
    setQuery
  ] = useState("");

  const [
    locationType,
    setLocationType
  ] = useState("all");


  const filteredLocations =
    useMemo(() => {

      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return structures
        .filter((spot) => {

          const searchableValues = [
            spot.name,
            spot.region,
            spot.type,
            spot.shortName
          ]
            .filter(Boolean)
            .map((value) =>
              String(value)
                .toLowerCase()
            );

          const matchesQuery =
            !normalizedQuery ||
            searchableValues.some(
              (value) =>
                value.includes(
                  normalizedQuery
                )
            );

          const matchesType =
            locationType === "all" ||
            getLocationType(spot) ===
              locationType;

          return (
            matchesQuery &&
            matchesType
          );
        })
        .slice(0, 25);

    }, [
      query,
      locationType,
      structures
    ]);


  const selectLocation = (spot) => {
    setSelectedSpot(spot);
    setSearchOpen(false);
  };


  return (
    <div className="floating-location-search">

      <button
        type="button"
        className="floating-location-search-toggle"
        onClick={() =>
          setSearchOpen(
            (current) => !current
          )
        }
      >
        <span aria-hidden="true">
          ⌕
        </span>

        {selectedSpot
          ? selectedSpot.name
          : "Search Locations"}
      </button>


      {searchOpen && (
        <div className="floating-location-search-panel">

          <div className="floating-location-search-header">

            <div>
              <h3>
                Location Search
              </h3>

              <p>
                Find rigs, FADs and fishing areas.
              </p>
            </div>


            <button
              type="button"
              className="floating-search-close"
              onClick={() =>
                setSearchOpen(false)
              }
              aria-label="Close location search"
            >
              ×
            </button>

          </div>


          <div className="floating-location-search-controls">

            <input
              type="search"
              value={query}
              placeholder="Search name, region or type"
              aria-label="Search offshore locations"
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
            />


            <select
              value={locationType}
              aria-label="Filter location type"
              onChange={(event) =>
                setLocationType(
                  event.target.value
                )
              }
            >

              <option value="all">
                All Locations
              </option>

              <option value="platform">
                Platforms and Rigs
              </option>

              <option value="fad">
                FADs
              </option>

              <option value="fishing-ground">
                Fishing Areas
              </option>

            </select>

          </div>


          {selectedSpot && (
            <button
              type="button"
              className="floating-clear-selection"
              onClick={() =>
                setSelectedSpot(null)
              }
            >
              Clear Current Selection
            </button>
          )}


          <div className="floating-location-results">

            {filteredLocations.map(
              (spot) => {

                const type =
                  getLocationType(spot);

                const isSelected =
                  selectedSpot?.id
                    ? selectedSpot.id ===
                      spot.id
                    : selectedSpot?.name ===
                      spot.name;

                return (
                  <button
                    type="button"
                    key={
                      spot.id ||
                      spot.name
                    }
                    className={[
                      "floating-location-result",

                      isSelected
                        ? "selected-floating-location-result"
                        : ""
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() =>
                      selectLocation(spot)
                    }
                  >

                    <span
                      className={`floating-location-result-icon ${type}`}
                      aria-hidden="true"
                    >
                      {type === "platform"
                        ? "P"
                        : type === "fad"
                          ? "FAD"
                          : "F"}
                    </span>


                    <span className="floating-location-result-content">

                      <strong>
                        {spot.name}
                      </strong>

                      <small>
                        {spot.type}
                        {spot.region
                          ? ` · ${spot.region}`
                          : ""}
                      </small>

                    </span>

                  </button>
                );
              }
            )}


            {filteredLocations.length === 0 && (
              <p className="no-location-results">
                No matching locations found.
              </p>
            )}

          </div>

        </div>
      )}

    </div>
  );
}


export default LocationSearch;