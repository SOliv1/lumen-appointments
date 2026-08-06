function JourneyPositionBanner({ pathway, waymark, state, detail, className = "" }) {
  return (
    <div className={`journey-position-banner ${className}`}>
      <span>You are in:</span>
      <strong>{[pathway, waymark, state].filter(Boolean).join(" -> ")}</strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}

export default JourneyPositionBanner;
