import { Link } from "react-router-dom";

function JourneyStart({ activityLog = [], onRunPracticeStep, onResetPracticeBoard }) {
  return (
    <section className="journey-start">
      <div className="journey-start-header">
        <p className="command-kicker">Shared care journey front door</p>
        <h2>Begin Care Journey</h2>
        <p>
          Start from one place, then enter the pathway that matches your role.
          Each view keeps the same journey visible without giving staff information
          they do not need for their part of the work.
        </p>
      </div>

      <PracticeControls
        activityLog={activityLog}
        onRunPracticeStep={onRunPracticeStep}
        onResetPracticeBoard={onResetPracticeBoard}
      />

      <GuidedWalkthrough />

      <div className="journey-start-grid">
        <JourneyStartCard
          to="/concern/new"
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
          to="/clinician-queue"
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
          to="/administration"
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

function PracticeControls({ activityLog, onRunPracticeStep, onResetPracticeBoard }) {
  return (
    <section className="practice-controls">
      <div>
        <p className="command-kicker">Practice prototype</p>
        <h3>Run the mock care system</h3>
        <p>
          Use the mock patients, clinicians, slots and appointments as a live
          training board. Move one safe step at a time, or reset everything back
          to the starting scenario.
        </p>
      </div>
      <div className="practice-actions">
        <button type="button" className="btn btn-appointment" onClick={onRunPracticeStep}>
          Run next practice step
        </button>
        <button type="button" className="btn btn-quiet" onClick={onResetPracticeBoard}>
          Reset practice board
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
  return (
    <Link to={to} className={`journey-start-card ${className}`}>
      <strong>{title}</strong>
      <span>{subtitle}</span>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Link>
  );
}

export default JourneyStart;
