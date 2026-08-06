function CommunicationJourney({
  stage,
  communication = {},
  fallbackChannel,
  fallbackBy = "Care Navigation Team",
  onMarkInformed,
  onMarkOutstanding,
}) {
  const informed = communication.patientInformed ? "Yes" : "No";
  const byWhom = communication.by || (communication.patientInformed ? fallbackBy : "Not recorded");
  const channel = communication.channel || fallbackChannel || "Not recorded";
  const when = formatCommunicationDate(communication.at);
  const confirmationOutstanding = communication.confirmationOutstanding ? "Yes" : "No";

  return (
    <div className="communication-journey">
      <strong>Communication Journey</strong>
      <dl>
        <div>
          <dt>Stage</dt>
          <dd>{stage || "Not recorded"}</dd>
        </div>
        <div>
          <dt>Patient informed?</dt>
          <dd>{informed}</dd>
        </div>
        <div>
          <dt>By whom?</dt>
          <dd>{byWhom}</dd>
        </div>
        <div>
          <dt>How?</dt>
          <dd>{channel}</dd>
        </div>
        <div>
          <dt>When?</dt>
          <dd>{when}</dd>
        </div>
        <div>
          <dt>Confirmation outstanding?</dt>
          <dd>{confirmationOutstanding}</dd>
        </div>
      </dl>
      {(onMarkInformed || onMarkOutstanding) && (
        <div className="communication-actions">
          {onMarkInformed && (
            <button type="button" className="action-button" onClick={onMarkInformed}>
              Mark patient informed
            </button>
          )}
          {onMarkOutstanding && (
            <button type="button" className="action-button" onClick={onMarkOutstanding}>
              Mark confirmation outstanding
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function formatCommunicationDate(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default CommunicationJourney;
