import React from "react";
import "./Splash.css";

const DemoSplash: React.FC = () => {
  return (
    <div className="splash">
      <div className="splash-shell">
        <header className="splash-header">
          <p className="splash-kicker">Demo role pathways</p>
          <h1>Lumen Appointments Demo</h1>
          <p>
            Choose a role to explore how the appointment system supports
            clinicians, patients, and service administrators.
          </p>
        </header>

        <main className="splash-grid">
          <section className="splash-tile splash-tile-active">
            <p className="splash-status">Active demo</p>
            <h2>Clinician</h2>
            <p>
              See the clinical queue, handoff pathway, and structured clinical
              notes used to support safe care.
            </p>
            <button
              className="splash-button splash-button-primary"
              onClick={() => (window.location.href = "/login")}
            >
              Enter as Clinician
            </button>
          </section>

          <section className="splash-tile splash-tile-disabled">
            <p className="splash-status">Prototype view only</p>
            <h2>Patient portal</h2>
            <p>
              View reassurance messaging, appointment status, and the
              communication journey. Not active in this demo.
            </p>
            <button className="splash-button splash-button-disabled" disabled>
              Demo only
            </button>
          </section>

          <section className="splash-tile splash-tile-disabled">
            <p className="splash-status">Prototype view only</p>
            <h2>Admin portal</h2>
            <p>
              Review tasks, communications, and appointment movements for
              service oversight. Not active in this demo.
            </p>
            <button className="splash-button splash-button-disabled" disabled>
              Demo only
            </button>
          </section>
        </main>

        <footer className="splash-footer">
          <p>
            This prototype demonstrates role-based routing, route protection,
            and timed sessions. Only Clinician login is active in this demo.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DemoSplash;
