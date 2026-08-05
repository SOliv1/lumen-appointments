import NextStepButton from "./NextStepButton";
import StatusBadge from "./StatusBadge";
import TriageSummary from "./TriageSummary";
import { CONCERN_STATUSES, STATUS_COLOR_CLASSES, getConcernStepNumber } from "./concernJourney";
import { buildPatientScript } from "./patientScript";

function ConcernRow({ concern, onAdvanceConcern }) {
  const currentStep = getConcernStepNumber(concern.status);
  const staffScript = concern.staffScript || buildPatientScript(concern);
  const statusClass = STATUS_COLOR_CLASSES[concern.status] || "badge-grey";

  return (
    <tr className={`concern-row row-${statusClass}`}>
      <td>
        <strong className="patient-name">{concern.patientName}</strong>
        <span className="patient-id">Concern {concern.id}</span>
      </td>
      <td>
        <strong>{concern.description}</strong>
        <dl className="concern-facts">
          <div>
            <dt>Confirmed time</dt>
            <dd>{concern.confirmedTime || "Not confirmed yet"}</dd>
          </div>
          <div>
            <dt>Confirmed by</dt>
            <dd>{concern.confirmationMethod || "Not confirmed"}</dd>
          </div>
        </dl>
      </td>
      <td>
        <p className="patient-message">
          {concern.patientMessage || "No patient-facing explanation has been recorded yet."}
        </p>
        <div className="staff-script">
          <strong>Staff script</strong>
          <p>{staffScript}</p>
        </div>
      </td>
      <td>
        <TriageSummary triage={concern.triage} />
      </td>
      <td>
        <StatusBadge status={concern.status} />
        <div className="journey-progress">
          Step {currentStep} of {CONCERN_STATUSES.length}
        </div>
        <ol className="journey-waymarks" aria-label="Concern journey steps">
          {CONCERN_STATUSES.map((status, index) => {
            const stepNumber = index + 1;
            const isCurrent = status === concern.status;
            const isComplete = stepNumber < currentStep;

            return (
              <li
                key={status}
                className={[
                  "journey-waymark",
                  isCurrent ? "current" : "",
                  isComplete ? "complete" : "",
                ].filter(Boolean).join(" ")}
              >
                <span>{stepNumber}</span>
                {status}
              </li>
            );
          })}
        </ol>
      </td>
      <td>
        <NextStepButton status={concern.status} id={concern.id} onAdvanceConcern={onAdvanceConcern} />
      </td>
    </tr>
  );
}

export default ConcernRow;
