import ConcernRow from "./ConcernRow";
import JourneyPositionBanner from "../JourneyPositionBanner";
import { formatPatientStoryDate } from "../dateUtils";

const formatUkDisplayDate = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return "Date not recorded";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function ConcernList({ concerns, onAdvanceConcern, onUpdateConcern, onAddConcernNote }) {
  const todayLabel = formatUkDisplayDate();
  const activeConcern = concerns.find((concern) => concern.status !== "Closed") || concerns[0];

  return (
    <section className="concern-list">
      <div className="concern-list-header">
        <div>
          <p className="command-kicker">Patient pathway</p>
          <h2>Concern List</h2>
        </div>
        <div className="today-marker">
          <span>Today</span>
          <strong>{todayLabel}</strong>
        </div>
      </div>

      {activeConcern && (
        <JourneyPositionBanner
          pathway="Patient Care"
          waymark="Concern"
          state={activeConcern.status}
          detail={`${activeConcern.patientName}: ${activeConcern.description}`}
          registeredAt={formatPatientStoryDate(activeConcern.patientRegisteredAt)}
          className="patient-position-banner"
        />
      )}

      {concerns.length === 0 ? (
        <p className="empty">No concerns yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Appointment Purpose</th>
              <th>Patient Information</th>
              <th>Triage Preview</th>
              <th>Concern Status</th>
              <th>Next Step</th>
            </tr>
          </thead>

          <tbody>
            {concerns.map((c) => (
              <ConcernRow
                key={c.id}
                concern={c}
                onAdvanceConcern={onAdvanceConcern}
                onUpdateConcern={onUpdateConcern}
                onAddConcernNote={onAddConcernNote}
                formatDate={formatUkDisplayDate}
              />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default ConcernList;
