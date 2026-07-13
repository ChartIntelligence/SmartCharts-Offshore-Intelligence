function OffshorePlatformIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="location-svg"
    >
      <path
        d="M19 15h26l5 12H14l5-12Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M22 27 17 54M42 27l5 27M27 27l-2 27M37 27l2 27"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M14 54h36M20 43h24M25 15V8h14v7"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M32 8V3"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}


function FishingGroundIcon() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="location-svg"
    >
      <circle
        cx="32"
        cy="32"
        r="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />

      <circle
        cx="32"
        cy="32"
        r="5"
        fill="currentColor"
      />

      <path
        d="M32 6v12M32 46v12M6 32h12M46 32h12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />

      <path
        d="M23 35c5-8 14-8 19-1-5 7-14 8-19 1Zm19-1 7-5v10l-7-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function LocationIcon({ type }) {
  if (type === "platform") {
    return <OffshorePlatformIcon />;
  }

  return <FishingGroundIcon />;
}


export default LocationIcon;