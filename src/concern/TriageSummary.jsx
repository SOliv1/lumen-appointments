function TriageSummary({ triage }) {
  const details = {
    urgency: triage?.urgency || "Not triaged",
    route: triage?.route || "Not assigned",
    timeframe: triage?.timeframe || "Not set",
    redFlagCheck: triage?.redFlagCheck || "Not recorded",
    note: triage?.note || "No clinician triage note recorded yet.",
  };

  return (
    <div className="triage-summary">
      <strong>Clinical triage preview</strong>
      <dl>
        <div>
          <dt>Urgency</dt>
          <dd>{details.urgency}</dd>
        </div>
        <div>
          <dt>Route</dt>
          <dd>{details.route}</dd>
        </div>
        <div>
          <dt>Timeframe</dt>
          <dd>{details.timeframe}</dd>
        </div>
        <div>
          <dt>Red flag check</dt>
          <dd>{details.redFlagCheck}</dd>
        </div>
      </dl>
      <p>{details.note}</p>
    </div>
  );
}

export default TriageSummary;
