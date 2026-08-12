import { Link } from "react-router-dom";

function JourneyStart({
  activityLog = [],
  practiceLevelId,
  practiceLevels = [],
  seasonLabel = "Seasonal",
  routes = {},
  onPracticeLevelChange,
  onRunPracticeStep,
  onResetPracticeBoard,
}) {
  return (
    <section className="journey-start">
      <div className="practice-mode-hero">
        <div>
          <p className="command-kicker">{seasonLabel} tint</p>
          <h2>PRACTICE MODE - TRAINING ONLY</h2>
          <p>
            Mock scenarios, practice badges and training controls stay visible
            so this board cannot be mistaken for live booking work.
          </p>
          <strong className="practice-mock-warning">This is mock data - do not use for real bookings.</strong>
        </div>
        <div className="practice-mode-hero-actions">
          <button type="button" className="btn btn-appointment" onClick={onRunPracticeStep}>
            Run Next Practice Step
          </button>
          <button type="button" className="btn btn-quiet" onClick={onResetPracticeBoard}>
            Reset Practice Board
          </button>
        </div>
      </div>

      <div className="journey-start-header">
        <div className="mock-badge-row" aria-label="Practice mode mock data badges">
          <span>Mock patients</span>
          <span>Mock clinicians</span>
          <span>Mock appointments</span>
        </div>
        <p className="command-kicker">Training journey front door</p>
        <h2>Practice Pathway</h2>
        <p>
          Start from one place, then enter the pathway that matches your role.
          Each view keeps the same journey visible without giving staff information
          they do not need for their part of the work.
        </p>
      </div>

      <PracticeControls
        activityLog={activityLog}
        practiceLevelId={practiceLevelId}
        practiceLevels={practiceLevels}
        onPracticeLevelChange={onPracticeLevelChange}
        onRunPracticeStep={onRunPracticeStep}
        onResetPracticeBoard={onResetPracticeBoard}
      />

      <GuidedWalkthrough />

      <div className="journey-start-grid">
        <JourneyStartCard
          to={routes.newConcern}
          className="patient-start-card"
          title="Patient Care"
          subtitle="Create a concern and begin the patient pathway."
          items={[
            "Record patient and concern",
            "Show status and reassurance",
            "Move through triage, appointment, treatment, follow-up, and closure",
          ]}
        />
        <JourneyStartCard
          to={routes.clinicianQueue}
          className="clinician-start-card"
          title="Clinician Care Queue"
          subtitle="Review only the clinical items that need attention."
          items={[
            "See today's care queue",
            "Review concern and add brief notes",
            "Request clarification without carrying admin workload",
          ]}
        />
        <JourneyStartCard
          to={routes.admin}
          className="admin-start-card"
          title="Administration"
          subtitle="Coordinate the pathway and prevent avoidable confusion."
          items={[
            "Monitor outstanding tasks",
            "Handle changes, cancellations, released slots, and communications",
            "Clarify missing information before sending work forward",
          ]}
        />
      </div>
    </section>
  );
}

function GuidedWalkthrough() {
  const steps = [
    {
      title: "Start the practice board",
      detail: "Press Run next practice step and watch the recent activity log update.",
      check: "A concern, task, appointment, or communication item moves forward.",
    },
    {
      title: "Open Administration",
      detail: "Review the You are in banner, outstanding tasks, communications and appointment movements.",
      check: "Admin can see what needs attention and which channel is involved.",
    },
    {
      title: "Resolve or record one admin action",
      detail: "Use an admin task button, record communication, or update an appointment date/time.",
      check: "The task state changes and the activity log records the action.",
    },
    {
      title: "Open Patient Care",
      detail: "Check the concern list, patient journey waymarks, communication journey and structured notes.",
      check: "The patient view shows status, reassurance, notes and whether confirmation is outstanding.",
    },
    {
      title: "Open Clinician Care Queue",
      detail: "Check the clinician handoff, clinical waymarks and structured clinical notes.",
      check: "Clinicians only see the handoff and clinical work they need.",
    },
    {
      title: "Reset and repeat",
      detail: "Press Reset practice board when the training route is complete or muddled.",
      check: "The mock board returns to the original busy-day scenario.",
    },
  ];

  return (
    <section className="guided-walkthrough">
      <div className="guided-walkthrough-header">
        <p className="command-kicker">Guided walkthrough</p>
        <h3>Mini live demo route</h3>
      </div>
      <ol>
        {steps.map((step, index) => (
          <li key={step.title}>
            <span>{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.detail}</p>
              <small>{step.check}</small>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function PracticeControls({
  activityLog,
  practiceLevelId,
  practiceLevels,
  onPracticeLevelChange,
  onRunPracticeStep,
  onResetPracticeBoard,
}) {
  const activeLevel = practiceLevels.find((level) => level.id === practiceLevelId) || practiceLevels[0];

  return (
    <section className="practice-controls">
      <div>
        <p className="command-kicker">Practice prototype</p>
        <h3>Learn the appointment flow one level at a time</h3>
        <p>
          Start with one appointment. When that feels familiar, move to 2, then
          3, then 6, then the full board. Each level resets the mock data so you
          can practise without carrying confusion forward.
        </p>
        {activeLevel && <small className="practice-level-summary">{activeLevel.summary}</small>}
      </div>
      <div className="practice-level-panel">
        <label htmlFor="practice-level">Practice level</label>
        <select
          id="practice-level"
          value={practiceLevelId}
          onChange={(event) => onPracticeLevelChange?.(event.target.value)}
        >
          {practiceLevels.map((level) => (
            <option value={level.id} key={level.id}>
              {level.label}
            </option>
          ))}
        </select>
        <ol>
          <li>Choose a level.</li>
          <li>Review Patients, Availability and Appointments.</li>
          <li>Press Run next practice step to move one safe action forward.</li>
          <li>Reset the level when you want a clean repeat.</li>
        </ol>
      </div>
      <div className="practice-actions">
        <button type="button" className="btn btn-appointment" onClick={onRunPracticeStep}>
          Run Next Practice Step
        </button>
        <button type="button" className="btn btn-quiet" onClick={onResetPracticeBoard}>
          Reset Practice Board
        </button>
      </div>
      <div className="practice-log">
        <strong>Recent activity</strong>
        {activityLog.length ? (
          <ol>
            {activityLog.slice(0, 5).map((item) => (
              <li key={item.id}>
                <span>{formatLogTime(item.at)}</span>
                {item.text}
              </li>
            ))}
          </ol>
        ) : (
          <p>No practice actions recorded yet.</p>
        )}
      </div>
    </section>
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

function JourneyStartCard({ to, className, title, subtitle, items }) {
  const CardElement = to ? Link : "article";
  const cardProps = to ? { to } : {};

  return (
    <CardElement className={`journey-start-card ${className}`} {...cardProps}>
      <strong>{title}</strong>
      <small className="practice-card-badge">Practice</small>
      <span>{subtitle}</span>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </CardElement>
  );
}

export default JourneyStart;
