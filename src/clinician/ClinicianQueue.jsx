import {
  CLINICIAN_JOURNEY_STEPS,
  getClinicianStepNumber,
  getNextClinicianStep,
  getPreviousClinicianStep,
} from "./clinicianJourney";
import JourneyPositionBanner from "../JourneyPositionBanner";
import NoteTimeline from "../notes/NoteTimeline";
import { formatPatientStoryDate } from "../dateUtils";

function ClinicianQueue({ concerns, patientLookup, onUpdateClinicianJourney, onAddConcernNote }) {
  const activeConcern =
    concerns.find((concern) => concern.isSpotlightJourney && concern.status !== "Closed") ||
    concerns.find((concern) => (concern.clinicianContact?.queryStatus || "").includes("requested")) ||
    concerns.find((concern) => concern.status !== "Closed") ||
    concerns[0];
  const activePatientName =
    activeConcern &&
    (patientLookup[activeConcern.patientId]?.name || activeConcern.patientName || activeConcern.patientId);
  const activeStep = activeConcern?.clinicianStep || "Today's care queue";

  return (
    <section className="clinician-queue">
      <div className="queue-header">
        <p className="command-kicker">Internal admin-clinical communication</p>
        <h2>Today's Care Queue</h2>
      </div>

      <main className="page-main clinician-queue-explainer">
        <h3>Today's Care Queue</h3>
        <p>Real patient queues will appear here once connected.</p>

        <h3>Structured Notes</h3>
        <p>Clinician notes and handoff details will surface here.</p>
      </main>

      {activeConcern && (
        <JourneyPositionBanner
          pathway="Clinician"
          waymark={activeStep}
          state={activeConcern.status}
          detail={`${activePatientName}: ${activeConcern.description}`}
          registeredAt={formatPatientStoryDate(activeConcern.patientRegisteredAt)}
          className="clinician-position-banner"
        />
      )}

      <div className="queue-list">
        {concerns.map((concern) => (
          <ClinicianQueueCard
            key={concern.id}
            concern={concern}
            patientName={patientLookup[concern.patientId]?.name || concern.patientName || concern.patientId}
            onUpdateClinicianJourney={onUpdateClinicianJourney}
            onAddConcernNote={onAddConcernNote}
          />
        ))}
      </div>
    </section>
  );
}

function ClinicianQueueCard({ concern, patientName, onUpdateClinicianJourney, onAddConcernNote }) {
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
          <span className="journey-card-registration">
            Registered {formatPatientStoryDate(concern.patientRegisteredAt)}
          </span>
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

      <NoteTimeline
        notes={concern.notes}
        title="Clinical and Internal Notes"
        defaultType="Clinical"
        defaultAuthor={clinicianContact.sentTo || "Clinical team"}
        onAddNote={(note) => onAddConcernNote?.(concern.id, note)}
      />

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
