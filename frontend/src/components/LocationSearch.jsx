import { useMemo, useState } from "react";


function getLocationType(spot) {
  if (
    spot.category === "structure" ||
    spot.type === "Deepwater Platform"
  ) {
    return "platform";
  }

  return "fishing-ground";
}


function LocationSearch({
  structures,
  selectedSpot,
  setSelectedSpot
}) {

  const [query, setQuery] = useState("");
  const [locationType, setLocationType] = useState("all");


  const filteredLocations = useMemo(() => {

    const normalizedQuery =
      query.trim().toLowerCase();


    return structures.filter((spot) => {

      const matchesQuery =
        !normalizedQuery ||
        spot.name.toLowerCase().includes(normalizedQuery) ||
        spot.region.toLowerCase().includes(normalizedQuery) ||
        spot.type.toLowerCase().includes(normalizedQuery);


      const matchesType =
        locationType === "all" ||
        getLocationType(spot) === locationType;


      return matchesQuery && matchesType;

    });

  }, [query, locationType, structures]);


  return (
    <div className="location-search">

      <div className="location-search-header">

        <div>
          <h3>Location Search</h3>

          <p>
            Find offshore platforms and fishing grounds.
          </p>
        </div>


        {selectedSpot && (
          <button
            type="button"
            className="clear-selection-button"
            onClick={() => setSelectedSpot(null)}
          >
            Clear Selection
          </button>
        )}

      </div>


      <div className="location-search-controls">

        <input
          type="search"
          value={query}
          placeholder="Search location, region, or type..."
          aria-label="Search offshore locations"
          onChange={(event) =>
            setQuery(event.target.value)
          }
        />


        <select
          value={locationType}
          aria-label="Filter location type"
          onChange={(event) =>
            setLocationType(event.target.value)
          }
        >
          <option value="all">
            All Locations
          </option>

          <option value="platform">
            Offshore Platforms
          </option>

          <option value="fishing-ground">
            Fishing Grounds
          </option>
        </select>

      </div>


      <div className="location-search-results">

        {filteredLocations.map((spot) => {

          const type =
            getLocationType(spot);

          const isSelected =
            selectedSpot?.name === spot.name;


          return (
            <button
              type="button"
              key={spot.name}
              className={
                isSelected
                  ? "location-result selected-location-result"
                  : "location-result"
              }
              onClick={() => setSelectedSpot(spot)}
            >

              <span
                className={`location-result-icon ${type}`}
                aria-hidden="true"
              >
                {type === "platform" ? "P" : "F"}
              </span>


              <span className="location-result-content">

                <strong>
                  {spot.name}
                </strong>

                <small>
                  {spot.type} · {spot.region}
                </small>

              </span>

            </button>
          );

        })}


        {filteredLocations.length === 0 && (
          <p className="no-location-results">
            No matching locations found.
          </p>
        )}

      </div>

    </div>
  );
}


export default LocationSearch;