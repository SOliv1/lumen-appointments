import { Link } from "react-router-dom";
import JourneyPositionBanner from "../JourneyPositionBanner";
import CommunicationJourney from "../communication/CommunicationJourney";
import NoteTimeline from "../notes/NoteTimeline";
import { formatPatientStoryDate } from "../dateUtils";

const ADMIN_TIME_OPTIONS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

function AdminDashboard({
  concerns,
  appointments,
  availability,
  patientLookup,
  clinicianLookup,
  onAdvanceConcern,
  onUpdateConcern,
  onUpdateAppointment,
  onAddConcernNote,
  onAddAppointmentNote,
  activityLog = [],
  practiceLevelId,
  practiceLevels = [],
  onPracticeLevelChange,
  onRunPracticeStep,
  onResetPracticeBoard,
}) {
  const releasedSlots = availability
    .filter((slot) => slot.status === "Available")
    .slice(0, 8);
  const appointmentMovements = appointments.filter((appointment) =>
    ["Changed", "Cancelled", "Released"].includes(appointment.status)
  );
  const communications = concerns.slice(0, 8);
  const outstandingTasks = buildOutstandingTasks(concerns, appointments, patientLookup);
  const primaryTask =
    outstandingTasks.find((task) => task.priorityClass === "clarify" || task.priorityClass === "query") ||
    outstandingTasks[0];
  const currentAdminWaymark = primaryTask?.waymark || "Monitor";
  const currentAdminState = primaryTask?.priority || "No outstanding tasks";
  const adminWaymarks = [
    { label: "Monitor", colourClass: "admin-monitor" },
    { label: "Clarify", colourClass: "admin-clarify" },
    { label: "Coordinate", colourClass: "admin-coordinate" },
    { label: "Communicate", colourClass: "admin-communicate" },
    { label: "Resolve", colourClass: "admin-resolve" },
  ];
  const activePracticeLevel =
    practiceLevels.find((level) => level.id === practiceLevelId) || practiceLevels[0];

  return (
    <section className="admin-dashboard">
      <div className="admin-header">
        <div>
          <p className="command-kicker">Administration pathway</p>
          <h2>Administration</h2>
          <p>
            Monitor patient care paths, clinician queue items, appointments, changes,
            cancellations, released slots, communications, and unresolved tasks.
          </p>
        </div>
        <div className="admin-pathway-links" aria-label="Administration pathway links">
          <Link to="/concerns" className="admin-link patient-pathway">
            Patient pathway
          </Link>
          <Link to="/clinician-queue" className="admin-link clinician-pathway">
            Clinician pathway
          </Link>
          <Link to="/availability" className="admin-link slot-pathway">
            Availability
          </Link>
        </div>
      </div>

      <JourneyPositionBanner
        pathway="Administration"
        waymark={currentAdminWaymark}
        state={currentAdminState}
        detail={
          primaryTask
            ? `${primaryTask.patientName}: ${primaryTask.text}`
            : "No immediate administration action is waiting."
        }
        registeredAt={primaryTask?.patientRegisteredAt ? formatPatientStoryDate(primaryTask.patientRegisteredAt) : ""}
        className="admin-position-banner"
      />

      <div className="admin-waymark-strip">
        <strong>Administration Journey</strong>
        <ol aria-label="Administration journey waymarks">
          {adminWaymarks.map((waymark, index) => (
            <li className={waymark.colourClass} key={waymark.label}>
              <span>{index + 1}</span>
              {waymark.label}
            </li>
          ))}
        </ol>
      </div>

      <div className="admin-summary-grid">
        <SummaryTile label="Active concerns" value={concerns.filter((c) => c.status !== "Closed").length} />
        <SummaryTile label="Outstanding tasks" value={outstandingTasks.length} />
        <SummaryTile label="Released slots" value={releasedSlots.length} />
        <SummaryTile label="Appointment movements" value={appointmentMovements.length} />
      </div>

      <div className="admin-grid">
        <AdminPanel title="Practice Controls">
          <div className="admin-practice-panel">
            <p>
              Practise the mock system as if it is live. Start small, master
              the pattern, then add more appointments when the flow feels steady.
            </p>
            <div className="practice-level-panel admin-level-panel">
              <label htmlFor="admin-practice-level">Practice level</label>
              <select
                id="admin-practice-level"
                value={practiceLevelId}
                onChange={(event) => onPracticeLevelChange?.(event.target.value)}
              >
                {practiceLevels.map((level) => (
                  <option value={level.id} key={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
              {activePracticeLevel && <small>{activePracticeLevel.summary}</small>}
              <ol>
                <li>Confirm the patient registration story.</li>
                <li>Check appointment status and clinician assignment.</li>
                <li>Run one practice step, then read the activity log.</li>
                <li>Reset this level before moving up.</li>
              </ol>
            </div>
            <div className="admin-task-actions">
              <button type="button" className="action-button" onClick={onRunPracticeStep}>
                Run next practice step
              </button>
              <button type="button" className="action-button danger" onClick={onResetPracticeBoard}>
                Reset practice board
              </button>
            </div>
            <ActivityLog activityLog={activityLog} />
          </div>
        </AdminPanel>

        <AdminPanel title="Outstanding Tasks">
          {outstandingTasks.length ? (
            <div className="admin-task-list">
              {outstandingTasks.map((task) => (
                <article className="admin-task-card" key={task.id}>
                  <span className={`admin-task-priority ${task.priorityClass}`}>{task.priority}</span>
                  <strong>{task.patientName}</strong>
                  <p>{task.text}</p>
                  <dl className="admin-task-routing">
                    <div>
                      <dt>Waymark</dt>
                      <dd>{task.waymark}</dd>
                    </div>
                    <div>
                      <dt>From</dt>
                      <dd>{task.from}</dd>
                    </div>
                    <div>
                      <dt>To</dt>
                      <dd>{task.to}</dd>
                    </div>
                    <div>
                      <dt>Channel</dt>
                      <dd>{task.channel}</dd>
                    </div>
                  </dl>
                  <div className="admin-task-actions">
                    {task.action && (
                      <button
                        type="button"
                        className="action-button"
                        onClick={() => task.action(onAdvanceConcern, onUpdateConcern, onUpdateAppointment)}
                      >
                        {task.actionLabel}
                      </button>
                    )}
                    <Link to={task.route} className="action-button">
                      Open pathway
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No outstanding administration tasks.</p>
          )}
        </AdminPanel>

        <AdminPanel title="Administration Rules">
          <div className="admin-list">
            <article className="admin-list-item admin-rule-item">
              <strong>Awaiting Review</strong>
              <span>Admin checks the concern has enough basic information to be understood and routed.</span>
              <small>This is not clinical triage yet.</small>
            </article>
            <article className="admin-list-item admin-rule-item">
              <strong>Needs Information</strong>
              <span>The concern stays in the Clarify waymark until the missing information is recorded.</span>
              <small>Information may come from the patient, the original admin note, or a clinician clarification query.</small>
            </article>
            <article className="admin-list-item admin-rule-item">
              <strong>Ready for Triage</strong>
              <span>Only used once admin has recorded enough factual detail for clinical review.</span>
              <small>Admin do not give clinical advice; they make the handoff clear.</small>
            </article>
          </div>
        </AdminPanel>

        <AdminPanel title="Appointments, Changes and Cancellations">
          {appointmentMovements.length ? (
            <div className="admin-list">
              {appointmentMovements.map((appointment) => (
                <article className="admin-list-item" key={appointment.id}>
                  <strong>{patientLookup[appointment.patientId]?.name || appointment.patientId}</strong>
                  <span>{appointment.status}</span>
                  <dl className="appointment-detail-meta">
                    <div>
                      <dt>Registered</dt>
                      <dd>{formatPatientStoryDate(appointment.patientRegisteredAt)}</dd>
                    </div>
                    <div>
                      <dt>Appointment created</dt>
                      <dd>{formatPatientStoryDate(appointment.createdAt || appointment.date)}</dd>
                    </div>
                    <div>
                      <dt>Clinician assigned</dt>
                      <dd>{clinicianLookup[appointment.clinicianId]?.name || appointment.clinicianId}</dd>
                    </div>
                  </dl>
                  <small>
                    {appointment.previousTime ? `Was ${appointment.previousTime}, now ${appointment.time}` : appointment.time}
                  </small>
                  <small>{appointment.previousDate ? `Previous date ${appointment.previousDate}` : `Date ${appointment.date}`}</small>
                  <AppointmentMovementForm
                    appointment={appointment}
                    patientRegisteredAt={appointment.patientRegisteredAt}
                    clinicianName={clinicianLookup[appointment.clinicianId]?.name || appointment.clinicianId}
                    onUpdateAppointment={onUpdateAppointment}
                    onAddAppointmentNote={onAddAppointmentNote}
                  />
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No changed or cancelled appointments recorded.</p>
          )}
        </AdminPanel>

        <AdminPanel title="Released Slots">
          {releasedSlots.length ? (
            <div className="admin-list compact">
              {releasedSlots.map((slot) => (
                <article className="admin-list-item" key={slot.id}>
                  <strong>{slot.startTime || slot.time}</strong>
                  <span>{clinicianLookup[slot.clinicianId]?.name || slot.clinicianId}</span>
                  <small>{slot.date}</small>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No released slots available.</p>
          )}
        </AdminPanel>

        <AdminPanel title="Patient Communications">
          <div className="admin-list">
            {communications.map((concern) => (
              <article className="admin-list-item" key={concern.id}>
                <strong>{concern.patientName}</strong>
                <span>{concern.description}</span>
                <small>{concern.confirmationMethod || "Not confirmed"} - {concern.confirmedTime || "No time confirmed"}</small>
                <small>{concern.patientContactStatus || "Patient communication not yet recorded"}</small>
                <button
                  type="button"
                  className="action-button"
                  onClick={() =>
                    onUpdateConcern(concern.id, {
                      patientContactStatus: "Patient communication recorded",
                      communication: {
                        ...concern.communication,
                        patientInformed: true,
                        by: concern.communication?.by || "Care Navigation Team",
                        channel:
                          concern.communication?.channel ||
                          concern.confirmationMethod ||
                          "Phone",
                        at: new Date().toISOString(),
                        confirmationOutstanding: false,
                      },
                    })
                  }
                >
                  Mark communication recorded
                </button>
                <CommunicationJourney
                  stage={concern.status}
                  communication={concern.communication}
                  fallbackChannel={concern.confirmationMethod}
                  onMarkInformed={() =>
                    onUpdateConcern(concern.id, {
                      patientContactStatus: "Patient communication recorded",
                      communication: {
                        ...concern.communication,
                        patientInformed: true,
                        by: concern.communication?.by || "Care Navigation Team",
                        channel:
                          concern.communication?.channel ||
                          concern.confirmationMethod ||
                          "Phone",
                        at: new Date().toISOString(),
                        confirmationOutstanding: false,
                      },
                    })
                  }
                  onMarkOutstanding={() =>
                    onUpdateConcern(concern.id, {
                      patientContactStatus: "Confirmation outstanding",
                      communication: {
                        ...concern.communication,
                        patientInformed: Boolean(concern.communication?.patientInformed),
                        by: concern.communication?.by || "Care Navigation Team",
                        channel:
                          concern.communication?.channel ||
                          concern.confirmationMethod ||
                          "Phone",
                        at: concern.communication?.at || new Date().toISOString(),
                        confirmationOutstanding: true,
                      },
                    })
                  }
                />
                <NoteTimeline
                  notes={concern.notes}
                  title="Admin and Communication Notes"
                  defaultType="Communication"
                  onAddNote={(note) => onAddConcernNote?.(concern.id, note)}
                />
              </article>
            ))}
          </div>
        </AdminPanel>
      </div>
    </section>
  );
}

function SummaryTile({ label, value }) {
  return (
    <article className="admin-summary-tile">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function AdminPanel({ title, children }) {
  return (
    <section className="admin-panel">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ActivityLog({ activityLog }) {
  return (
    <div className="admin-activity-log">
      <strong>Recent activity</strong>
      {activityLog.length ? (
        <ol>
          {activityLog.slice(0, 6).map((item) => (
            <li key={item.id}>
              <span>{formatLogTime(item.at)}</span>
              {item.text}
            </li>
          ))}
        </ol>
      ) : (
        <p>No practice activity recorded yet.</p>
      )}
    </div>
  );
}

function formatLogTime(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Time not recorded";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AppointmentMovementForm({ appointment, patientRegisteredAt, clinicianName, onUpdateAppointment, onAddAppointmentNote }) {
  const updateAppointmentField = (field, value) => {
    onUpdateAppointment(appointment.id, {
      [field]: value,
      status: appointment.status === "Cancelled" ? "Changed" : appointment.status,
      patientCommunicationNeeded: true,
    });
  };

  const confirmUpdate = () => {
    onUpdateAppointment(appointment.id, {
      previousDate: appointment.previousDate || appointment.date,
      previousTime: appointment.previousTime || appointment.time,
      status: "Changed",
      patientCommunicationNeeded: true,
      adminUpdateNote: "Appointment date/time updated by administration",
    });
  };

  const markBooked = () => {
    onUpdateAppointment(appointment.id, {
      status: "Booked",
      patientCommunicationNeeded: true,
      adminUpdateNote: "Updated appointment ready for patient confirmation",
    });
  };

  return (
    <div className="appointment-update-panel">
      <strong>Update next appointment</strong>
      <dl className="appointment-detail-meta">
        <div>
          <dt>Registered</dt>
          <dd>{formatPatientStoryDate(patientRegisteredAt)}</dd>
        </div>
        <div>
          <dt>Appointment created</dt>
          <dd>{formatPatientStoryDate(appointment.createdAt || appointment.date)}</dd>
        </div>
        <div>
          <dt>Clinician assigned</dt>
          <dd>{clinicianName || "Not assigned"}</dd>
        </div>
      </dl>
      <div className="appointment-update-grid">
        <label>
          Next date
          <input
            type="date"
            value={appointment.date || ""}
            onChange={(event) => updateAppointmentField("date", event.target.value)}
          />
        </label>
        <label>
          Next time
          <select
            value={appointment.time || "09:00"}
            onChange={(event) => updateAppointmentField("time", event.target.value)}
          >
            {ADMIN_TIME_OPTIONS.map((time) => (
              <option value={time} key={time}>
                {time}
              </option>
            ))}
          </select>
        </label>
        <label>
          Movement status
          <select
            value={appointment.status || "Booked"}
            onChange={(event) => updateAppointmentField("status", event.target.value)}
          >
            <option>Changed</option>
            <option>Cancelled</option>
            <option>Booked</option>
            <option>Released</option>
          </select>
        </label>
      </div>
      <div className="admin-task-actions">
        <button type="button" className="action-button" onClick={confirmUpdate}>
          Save changed date/time
        </button>
        <button type="button" className="action-button" onClick={markBooked}>
          Mark ready to confirm with patient
        </button>
      </div>
      <small>
        Previous details are retained so admin can explain exactly what changed.
      </small>
      <CommunicationJourney
        stage={`Appointment ${appointment.status || "Booked"}`}
        communication={appointment.communication}
        fallbackChannel={appointment.confirmationMethod}
        onMarkInformed={() =>
          onUpdateAppointment(appointment.id, {
            patientCommunicationNeeded: false,
            communication: {
              ...appointment.communication,
              patientInformed: true,
              by: appointment.communication?.by || "Care Navigation Team",
              channel:
                appointment.communication?.channel ||
                appointment.confirmationMethod ||
                "Phone",
              at: new Date().toISOString(),
              confirmationOutstanding: false,
            },
            adminUpdateNote: "Patient informed of appointment movement",
          })
        }
        onMarkOutstanding={() =>
          onUpdateAppointment(appointment.id, {
            patientCommunicationNeeded: true,
            communication: {
              ...appointment.communication,
              patientInformed: Boolean(appointment.communication?.patientInformed),
              by: appointment.communication?.by || "Care Navigation Team",
              channel:
                appointment.communication?.channel ||
                appointment.confirmationMethod ||
                "Phone",
              at: appointment.communication?.at || new Date().toISOString(),
              confirmationOutstanding: true,
            },
          })
        }
      />
      <NoteTimeline
        notes={appointment.notes}
        title="Appointment Notes"
        defaultType="Administrative"
        onAddNote={(note) => onAddAppointmentNote?.(appointment.id, note)}
      />
    </div>
  );
}

function buildOutstandingTasks(concerns, appointments = [], patientLookup = {}) {
  const concernTasks = concerns.flatMap((concern) => {
    const patientName = concern.patientName || concern.patientId;
    const patientRegisteredAt = concern.patientRegisteredAt || patientLookup[concern.patientId]?.registeredAt;
    const tasks = [];

    if (concern.status === "Awaiting Review") {
      tasks.push({
        id: `${concern.id}-review`,
        patientName,
        patientRegisteredAt,
        priority: "Review",
        priorityClass: "review",
        text: "Admin checks the concern has a patient, a plain-language reason, a trigger, and enough detail to route safely.",
        waymark: "Monitor",
        from: "Patient concern record",
        to: "Administration",
        channel: "Internal admin dashboard",
        route: "/concerns",
        actionLabel: "Review complete - ready for triage",
        action: (onAdvanceConcern) => onAdvanceConcern(concern.id, "triage"),
      });
    }

    if (concern.status === "Needs Information") {
      tasks.push({
        id: `${concern.id}-info`,
        patientName,
        patientRegisteredAt,
        priority: "Clarify",
        priorityClass: "clarify",
        text: "This should not move to triage until the missing information has been requested, received, and recorded.",
        waymark: "Clarify",
        from: concern.clarificationFrom || "Patient or original admin record",
        to: "Administration",
        channel: concern.clarificationChannel || "Phone, SMS, email, portal, or walk-in note",
        route: "/concerns",
        actionLabel: "Information recorded - ready for triage",
        action: (_onAdvanceConcern, onUpdateConcern) =>
          onUpdateConcern(concern.id, {
            status: "Ready for Triage",
            clarificationStatus: "Information recorded",
            patientContactStatus: concern.patientContactStatus || "Clarification communication recorded",
          }),
      });
    }

    if (concern.status === "Appointment Required") {
      tasks.push({
        id: `${concern.id}-slot`,
        patientName,
        patientRegisteredAt,
        priority: "Slot",
        priorityClass: "slot",
        text: "Concern needs to be matched to an available slot.",
        waymark: "Coordinate",
        from: "Triage outcome",
        to: "Availability",
        channel: "Internal appointment board",
        route: "/availability",
        actionLabel: "Match to slot",
        action: (onAdvanceConcern) => onAdvanceConcern(concern.id, "match"),
      });
    }

    if (concern.clinicianContact?.queryStatus === "Clarification requested") {
      tasks.push({
        id: `${concern.id}-clinician-query`,
        patientName,
        patientRegisteredAt,
        priority: "Clinician query",
        priorityClass: "query",
        text: "Clinician has requested clarification before clinical action.",
        waymark: "Clarify",
        from: concern.clinicianContact?.sentTo || "Clinician/team",
        to: concern.clinicianContact?.clarificationContact || "Care Navigation Team",
        channel: concern.clinicianContact?.responseChannel || "Today's Care Queue",
        route: "/clinician-queue",
        actionLabel: "Mark answered",
        action: (_onAdvanceConcern, onUpdateConcern) =>
          onUpdateConcern(concern.id, {
            clinicianContact: {
              ...concern.clinicianContact,
              queryStatus: "Clarification answered",
            },
          }),
      });
    }

    if (concern.status === "Appointment Booked" && concern.patientContactStatus !== "Patient communication recorded") {
      tasks.push({
        id: `${concern.id}-patient-contact`,
        patientName,
        patientRegisteredAt,
        priority: "Contact",
        priorityClass: "contact",
        text: "Patient communication should confirm the recorded time, purpose, and current journey status.",
        waymark: "Communicate",
        from: "Administration",
        to: "Patient",
        channel: concern.confirmationMethod || "Phone, SMS, letter, email, or portal",
        route: "/concerns",
        actionLabel: "Mark contacted",
        action: (_onAdvanceConcern, onUpdateConcern) =>
          onUpdateConcern(concern.id, {
            patientContactStatus: "Patient communication recorded",
          }),
      });
    }

    return tasks;
  });

  const appointmentTasks = appointments
    .filter((appointment) => appointment.patientCommunicationNeeded)
    .map((appointment) => ({
      id: `${appointment.id}-appointment-communication`,
      patientName: appointment.patientName || appointment.patientId,
      patientRegisteredAt: appointment.patientRegisteredAt || patientLookup[appointment.patientId]?.registeredAt,
      priority: "Contact",
      priorityClass: "contact",
      text: "Appointment date/time has changed and needs clear patient confirmation.",
      waymark: "Communicate",
      from: "Administration",
      to: "Patient",
      channel: appointment.confirmationMethod || "Phone, SMS, letter, email, or portal",
      route: "/appointments",
      actionLabel: "Mark appointment communication recorded",
      action: (_onAdvanceConcern, _onUpdateConcern, onUpdateAppointment) =>
        onUpdateAppointment(appointment.id, {
          patientCommunicationNeeded: false,
          adminUpdateNote: "Patient communication recorded for appointment movement",
          communication: {
            ...appointment.communication,
            patientInformed: true,
            by: appointment.communication?.by || "Care Navigation Team",
            channel:
              appointment.communication?.channel ||
              appointment.confirmationMethod ||
              "Phone",
            at: new Date().toISOString(),
            confirmationOutstanding: false,
          },
        }),
    }));

  return [...concernTasks, ...appointmentTasks];
}

export default AdminDashboard;
