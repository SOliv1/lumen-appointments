import React from "react";
import "./Splash.css";

const LiveSplash: React.FC = () => {
  return (
    <div className="splash">
      <div className="splash-shell">
        <header className="splash-header">
          <p className="splash-kicker">Live clinical access</p>
          <h1>Lumen Appointments</h1>
          <p>
            Sign in to the clinical appointment system for queues, handoffs,
            structured notes, and safe booking workflows.
          </p>
        </header>

        <main className="splash-grid">
          <section className="splash-tile splash-tile-active">
            <p className="splash-status">Available now</p>
            <h2>Clinician</h2>
            <p>
              Access the clinical queue, handoff pathway, and structured notes
              that support safe, timely care.
            </p>
            <button
              className="splash-button splash-button-primary"
              onClick={() => (window.location.href = "/login")}
            >
              Sign in as Clinician
            </button>
          </section>

          <section className="splash-tile splash-tile-disabled">
            <p className="splash-status">Future release</p>
            <h2>Patient portal</h2>
            <p>
              View appointment status, reassurance messaging, and your
              communication journey with the clinic.
            </p>
            <button className="splash-button splash-button-disabled" disabled>
              Coming soon
            </button>
          </section>

          <section className="splash-tile splash-tile-disabled">
            <p className="splash-status">Future release</p>
            <h2>Admin portal</h2>
            <p>
              Oversee tasks, communications, and appointment movements across
              the service to keep the system flowing.
            </p>
            <button className="splash-button splash-button-disabled" disabled>
              Coming soon
            </button>
          </section>
        </main>

        <footer className="splash-footer">
          <p>
            This live deployment currently supports Clinician access only.
            Patient and Admin portals will be released in future updates.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LiveSplash;
