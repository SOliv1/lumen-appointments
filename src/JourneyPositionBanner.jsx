function JourneyPositionBanner({ pathway, waymark, state, detail, registeredAt, className = "" }) {
  return (
    <div className={`journey-position-banner ${className}`}>
      <div className="journey-position-main">
        <span>You are in:</span>
        <strong>{[pathway, waymark, state].filter(Boolean).join(" -> ")}</strong>
      </div>
      {registeredAt && (
        <div className="journey-registration-marker">
          <span>Registered</span>
          <strong>{registeredAt}</strong>
        </div>
      )}
      {detail && <p>{detail}</p>}
    </div>
  );
}

export default JourneyPositionBanner;
