import {
  CLINICIAN_JOURNEY_STEPS,
  getClinicianStepNumber,
  getNextClinicianStep,
  getPreviousClinicianStep,
} from "./clinicianJourney";

function ClinicianQueue({ concerns, patientLookup, onUpdateClinicianJourney }) {
  return (
    <section className="clinician-queue">
      <div className="queue-header">
        <p className="command-kicker">Internal admin-clinical communication</p>
        <h2>Today's Care Queue</h2>
      </div>

      <div className="queue-list">
        {concerns.map((concern) => (
          <ClinicianQueueCard
            key={concern.id}
            concern={concern}
            patientName={patientLookup[concern.patientId]?.name || concern.patientName || concern.patientId}
            onUpdateClinicianJourney={onUpdateClinicianJourney}
          />
        ))}
      </div>
    </section>
  );
}

function ClinicianQueueCard({ concern, patientName, onUpdateClinicianJourney }) {
  const currentStep = concern.clinicianStep || "Today's care queue";
  const currentStepNumber = getClinicianStepNumber(currentStep);
  const previousStep = getPreviousClinicianStep(currentStep);
  const nextStep = getNextClinicianStep(currentStep);
  const clinicianContact = {
    method: "Internal care queue",
    sentTo: concern.triage?.route || "Unassigned clinician/team",
    responseChannel: "Today's Care Queue",
    notifiedBy: "Care Navigation Team",
    clarificationContact: "Care Navigation Team",
    escalationRoute: "Return to admin for clarification before clinical action",
    queryStatus: "No clarification requested",
    ...concern.clinicianContact,
  };

  const requestClarification = () => {
    onUpdateClinicianJourney(concern.id, {
      clinicianStep: "Review concern",
      clinicianContact: {
        ...clinicianContact,
        queryStatus: "Clarification requested",
      },
    });
  };

  return (
    <article className="clinician-card">
      <div className="clinician-card-main">
        <div>
          <span className="internal-pill">Internal queue item</span>
          <h3>{patientName}</h3>
          <p>{concern.description}</p>
        </div>

        <dl className="clinician-contact">
          <div>
            <dt>Contact method</dt>
            <dd>{clinicianContact.method || "Internal care queue"}</dd>
          </div>
          <div>
            <dt>Sent to</dt>
            <dd>{clinicianContact.sentTo || concern.triage?.route || "Unassigned clinician/team"}</dd>
          </div>
          <div>
            <dt>Respond here</dt>
            <dd>{clinicianContact.responseChannel || "Today's Care Queue"}</dd>
          </div>
        </dl>
      </div>

      <div className="handoff-panel">
        <strong>Handoff and Clarification</strong>
        <dl>
          <div>
            <dt>Notified by</dt>
            <dd>{clinicianContact.notifiedBy}</dd>
          </div>
          <div>
            <dt>Contact for clarification</dt>
            <dd>{clinicianContact.clarificationContact}</dd>
          </div>
          <div>
            <dt>If unclear or inconsistent</dt>
            <dd>{clinicianContact.escalationRoute}</dd>
          </div>
          <div>
            <dt>Clarification status</dt>
            <dd>{clinicianContact.queryStatus}</dd>
          </div>
        </dl>
      </div>

      <div className="clinician-waymark-panel">
        <strong>Clinician Journey</strong>
        <div className="clinician-progress">
          Step {currentStepNumber} of {CLINICIAN_JOURNEY_STEPS.length}: {currentStep}
        </div>
        <ol className="clinician-waymarks" aria-label="Clinician journey waymarks">
          {CLINICIAN_JOURNEY_STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isCurrent = step === currentStep;
            const isComplete = stepNumber < currentStepNumber;

            return (
              <li
                key={step}
                className={[
                  "clinician-waymark",
                  isCurrent ? "current" : "",
                  isComplete ? "complete" : "",
                ].filter(Boolean).join(" ")}
              >
                <span>{stepNumber}</span>
                {step}
              </li>
            );
          })}
        </ol>
      </div>

      <label className="clinical-note-field">
        Brief clinical note
        <textarea
          value={concern.clinicalNote || ""}
          onChange={(event) =>
            onUpdateClinicianJourney(concern.id, { clinicalNote: event.target.value })
          }
          placeholder="Brief note only. Not a full medical record."
          rows="3"
        />
      </label>

      <div className="journey-actions clinician-actions">
        <button
          type="button"
          className="previous-step-button"
          onClick={requestClarification}
        >
          Request clarification
        </button>
        {previousStep && (
          <button
            type="button"
            className="previous-step-button"
            onClick={() => onUpdateClinicianJourney(concern.id, { clinicianStep: previousStep })}
          >
            Back to {previousStep}
          </button>
        )}
        {nextStep && (
          <button
            type="button"
            className="next-step-button internal-next-button"
            onClick={() => onUpdateClinicianJourney(concern.id, { clinicianStep: nextStep })}
          >
            {nextStep}
          </button>
        )}
      </div>
    </article>
  );
}

export default ClinicianQueue;
