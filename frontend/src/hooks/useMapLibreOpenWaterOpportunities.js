import {
  useEffect,
  useRef
} from "react";

import maplibregl from "maplibre-gl";


export function useMapLibreOpenWaterOpportunities({
  mapRef,
  opportunities = [],
  selectedOpportunity = null,
  setSelectedOpportunity
}) {
  const markersRef = useRef([]);


  useEffect(() => {
    const map =
      mapRef?.current;

    if (!map) {
      return;
    }


    const removeMarkers = () => {
      markersRef.current
        .forEach(marker => {
          marker.remove();
        });

      markersRef.current = [];
    };


    const createMarkers = () => {
      removeMarkers();


      if (
        !Array.isArray(
          opportunities
        ) ||
        opportunities.length === 0
      ) {
        return;
      }


      opportunities.forEach(
        opportunity => {
          const coordinates =
            normalizeCoordinates(
              opportunity?.coordinates
            );


          if (!coordinates) {
            return;
          }


          const [
            longitude,
            latitude
          ] = coordinates;


          const rank =
            Number(
              opportunity
                ?.dynamicOpportunity
                ?.rank
            );


          const score =
            Number(
              opportunity
                ?.dynamicOpportunity
                ?.score
            );


          const isSelected =
            selectedOpportunity?.id != null &&
            selectedOpportunity?.id ===
              opportunity?.id;


          const markerAnchor =
            document.createElement(
              "div"
            );

          markerAnchor.className =
            "pelora-open-water-opportunity-anchor";


          const markerButton =
            document.createElement(
              "button"
            );

          markerButton.type =
            "button";

          markerButton.className = [
            "pelora-open-water-opportunity-marker",

            isSelected
              ? "selected-open-water-opportunity"
              : ""
          ]
            .filter(Boolean)
            .join(" ");


          const displayedRank =
            Number.isFinite(rank)
                ? Math.round(rank)
                : "?";


          markerButton.innerHTML = `
            <span
              class="pelora-open-water-opportunity-pulse"
              aria-hidden="true"
            ></span>

            <span
              class="pelora-open-water-opportunity-core"
            >
              ${escapeHtml(
                String(
                  displayedRank
                )
              )}
            </span>
          `;


          const opportunityName =
            opportunity?.name ??
            (
              Number.isFinite(rank)
                ? `Open Water Opportunity ${rank}`
                : "Open Water Opportunity"
            );


          markerButton.setAttribute(
            "aria-label",
            `Select ${opportunityName}`
          );

          markerButton.title =
            opportunityName;


          markerButton.addEventListener(
            "click",
            event => {
              event.preventDefault();
              event.stopPropagation();

              setSelectedOpportunity?.(
                opportunity
              );
            }
          );


          markerAnchor.appendChild(
            markerButton
          );


          const scoreLabel =
            Number.isFinite(score)
              ? `${Math.round(score)}`
              : "Unavailable";


          const popup =
            new maplibregl.Popup({
              offset: 30,
              closeButton: true,
              closeOnClick: false
            })
              .setHTML(`
                <div class="smartcharts-popup pelora-open-water-opportunity-popup">
                  <strong>
                    ${escapeHtml(
                      opportunityName
                    )}
                  </strong>

                  <p>
                    Dynamic open-water opportunity
                  </p>

                  <p>
                    Opportunity score:
                    ${escapeHtml(
                      scoreLabel
                    )}
                  </p>
                </div>
              `);


          const marker =
            new maplibregl.Marker({
              element:
                markerAnchor,

              anchor:
                "center"
            })
              .setLngLat([
                longitude,
                latitude
              ])
              .setPopup(popup)
              .addTo(map);


          markersRef.current.push(
            marker
          );
        }
      );
    };


    createMarkers();


    return () => {
     removeMarkers();
    };
  }, [
    mapRef,
    opportunities,
    selectedOpportunity?.id,
    setSelectedOpportunity
  ]);
}


function normalizeCoordinates(
  coordinates
) {
  if (
    !Array.isArray(
      coordinates
    ) ||
    coordinates.length < 2
  ) {
    return null;
  }


  const first =
    Number(
      coordinates[0]
    );

  const second =
    Number(
      coordinates[1]
    );


  if (
    !Number.isFinite(first) ||
    !Number.isFinite(second)
  ) {
    return null;
  }


  const firstLooksLikeLongitude =
    first >= -100 &&
    first <= -75;

  const secondLooksLikeLatitude =
    second >= 15 &&
    second <= 32;


  if (
    firstLooksLikeLongitude &&
    secondLooksLikeLatitude
  ) {
    return [
      first,
      second
    ];
  }


  const firstLooksLikeLatitude =
    first >= 15 &&
    first <= 32;

  const secondLooksLikeLongitude =
    second >= -100 &&
    second <= -75;


  if (
    firstLooksLikeLatitude &&
    secondLooksLikeLongitude
  ) {
    return [
      second,
      first
    ];
  }


  return null;
}


function escapeHtml(
  value
) {
  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}