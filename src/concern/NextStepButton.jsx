import { getNextConcernStep, getPreviousConcernStatus } from "./concernJourney";

function NextStepButton({ status, id, onAdvanceConcern }) {
  const nextStep = getNextConcernStep(status);
  const previousStatus = getPreviousConcernStatus(status);

  if (!nextStep && !previousStatus) return null;

  return (
    <div className="journey-actions">
      {previousStatus && (
        <button
          className="previous-step-button"
          onClick={() => onAdvanceConcern?.(id, "set-status", previousStatus)}
          type="button"
        >
          Back to {previousStatus}
        </button>
      )}
      {nextStep && (
        <button
          className="next-step-button"
          onClick={() => onAdvanceConcern?.(id, nextStep.action)}
          type="button"
        >
          {nextStep.label}
        </button>
      )}
    </div>
  );
}

export default NextStepButton;
