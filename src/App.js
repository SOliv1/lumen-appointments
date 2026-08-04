import React, { useMemo, useState } from "react";
import { NavLink, Redirect, Route, Switch } from "react-router-dom";
import "./App.css";
import initialAppointments from "./mockups/appointments.json";
import initialAvailability from "./mockups/availability.json";
import initialClinicians from "./mockups/clinicians.json";
import initialPatients from "./mockups/patients.json";

const ROUTES = {
  PATIENTS: "/patients",
  CLINICIANS: "/clinicians",
  AVAILABILITY: "/availability",
  APPOINTMENTS: "/appointments",
};

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

function App() {
  const [patients, setPatients] = useState(initialPatients);
  const [clinicians, setClinicians] = useState(initialClinicians);
  const [availability, setAvailability] = useState(initialAvailability);
  const [appointments, setAppointments] = useState(initialAppointments);

  const patientLookup = useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id, patient])),
    [patients]
  );
  const clinicianLookup = useMemo(
    () => Object.fromEntries(clinicians.map((clinician) => [clinician.id, clinician])),
    [clinicians]
  );

  return (
    <div className="app-shell">
      <header className="hero">
        <img src="/serenecare-banner.png" alt="" className="hero-image" />
        <div className="hero-content">
          <p className="eyebrow">Care coordination workspace</p>
          <h1>serene-care-sync</h1>
          <p>
            Coordinate patients, clinicians, availability and bookings from one calm,
            operational view.
          </p>
        </div>
      </header>

      <nav className="app-nav" aria-label="Primary navigation">
        <NavLink to={ROUTES.PATIENTS} activeClassName="active">
          Patients
        </NavLink>
        <NavLink to={ROUTES.CLINICIANS} activeClassName="active">
          Clinicians
        </NavLink>
        <NavLink to={ROUTES.AVAILABILITY} activeClassName="active">
          Availability
        </NavLink>
        <NavLink to={ROUTES.APPOINTMENTS} activeClassName="active">
          Appointments
        </NavLink>
      </nav>

      <main className="workspace">
        <Switch>
          <Route exact path="/">
            <Redirect to={ROUTES.AVAILABILITY} />
          </Route>
          <Route path={ROUTES.PATIENTS}>
            <PatientsPage patients={patients} setPatients={setPatients} />
          </Route>
          <Route path={ROUTES.CLINICIANS}>
            <CliniciansPage clinicians={clinicians} setClinicians={setClinicians} />
          </Route>
          <Route path={ROUTES.AVAILABILITY}>
            <AvailabilityPage
              availability={availability}
              setAvailability={setAvailability}
              clinicians={clinicians}
              clinicianLookup={clinicianLookup}
            />
          </Route>
          <Route path={ROUTES.APPOINTMENTS}>
            <AppointmentsPage
              appointments={appointments}
              setAppointments={setAppointments}
              patients={patients}
              clinicians={clinicians}
              patientLookup={patientLookup}
              clinicianLookup={clinicianLookup}
            />
          </Route>
        </Switch>
      </main>
    </div>
  );
}

function PatientsPage({ patients, setPatients }) {
  const [form, setForm] = useState({ name: "", dob: "", contact: "", notes: "" });

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const addPatient = (event) => {
    event.preventDefault();
    setPatients([...patients, { ...form, id: makeId("patient") }]);
    setForm({ name: "", dob: "", contact: "", notes: "" });
  };

  return (
    <section className="page-grid">
      <Panel title="Register Patient" subtitle="Capture the minimum details needed for scheduling.">
        <form onSubmit={addPatient} className="form-grid">
          <input name="name" value={form.name} onChange={updateForm} placeholder="Full name" required />
          <input name="dob" type="date" value={form.dob} onChange={updateForm} required />
          <input name="contact" value={form.contact} onChange={updateForm} placeholder="Contact number" required />
          <textarea name="notes" value={form.notes} onChange={updateForm} placeholder="Care notes" rows="4" />
          <button type="submit" className="btn btn-patient">Add Patient</button>
        </form>
      </Panel>

      <Panel title="Patient List" subtitle={`${patients.length} active records`}>
        <RecordList
          items={patients}
          renderItem={(patient) => (
            <>
              <strong>{patient.name}</strong>
              <span>DOB {patient.dob}</span>
              <span>{patient.contact}</span>
              {patient.notes && <small>{patient.notes}</small>}
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function CliniciansPage({ clinicians, setClinicians }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    specialty: "",
    contact: "",
    registrationId: "",
  });
  const [error, setError] = useState("");

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const isValidRegistration = (id) => {
    if (!id) return true;
    return /^\d{7}$/.test(id) || /^[A-Za-z]{2}\d{6}$/.test(id) || /^[A-Za-z]{2}\d{5}$/.test(id);
  };

  const addClinician = (event) => {
    event.preventDefault();
    if (!isValidRegistration(form.registrationId)) {
      setError("Use GMC 7 digits, NMC AA######, or HCPC AA#####.");
      return;
    }
    setClinicians([...clinicians, { ...form, id: makeId("clinician") }]);
    setForm({ name: "", role: "", specialty: "", contact: "", registrationId: "" });
  };

  return (
    <section className="page-grid">
      <Panel title="Add Clinician" subtitle="Build the rota with verified clinical staff.">
        <form onSubmit={addClinician} className="form-grid">
          <input name="name" value={form.name} onChange={updateForm} placeholder="Clinician name" required />
          <input name="role" value={form.role} onChange={updateForm} placeholder="Role" required />
          <input name="specialty" value={form.specialty} onChange={updateForm} placeholder="Specialty" required />
          <input name="contact" value={form.contact} onChange={updateForm} placeholder="Contact number" required />
          <input
            name="registrationId"
            value={form.registrationId}
            onChange={updateForm}
            placeholder="GMC / NMC / HCPC"
          />
          {error && <p className="error-box">{error}</p>}
          <button type="submit" className="btn btn-clinician">Add Clinician</button>
        </form>
      </Panel>

      <Panel title="Clinical Team" subtitle={`${clinicians.length} clinicians`}>
        <RecordList
          items={clinicians}
          renderItem={(clinician) => (
            <>
              <strong>{clinician.name}</strong>
              <span>{clinician.role} - {clinician.specialty}</span>
              <span>{clinician.contact}</span>
              {clinician.registrationId && <small>Registration {clinician.registrationId}</small>}
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function AvailabilityPage({ availability, setAvailability, clinicians, clinicianLookup }) {
  const [form, setForm] = useState({
    clinicianId: clinicians[0]?.id || "",
    date: "",
    startTime: "",
    endTime: "",
    status: "Available",
  });

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const addSlot = (event) => {
    event.preventDefault();
    setAvailability([...availability, { ...form, id: makeId("slot") }]);
    setForm({ ...form, date: "", startTime: "", endTime: "", status: "Available" });
  };

  return (
    <section className="page-grid">
      <Panel title="Open Availability" subtitle="Publish clinician slots for booking.">
        <form onSubmit={addSlot} className="form-grid">
          <select name="clinicianId" value={form.clinicianId} onChange={updateForm} required>
            {clinicians.map((clinician) => (
              <option key={clinician.id} value={clinician.id}>
                {clinician.name} - {clinician.role}
              </option>
            ))}
          </select>
          <input name="date" type="date" value={form.date} onChange={updateForm} required />
          <div className="split-row">
            <input name="startTime" type="time" value={form.startTime} onChange={updateForm} required />
            <input name="endTime" type="time" value={form.endTime} onChange={updateForm} required />
          </div>
          <select name="status" value={form.status} onChange={updateForm}>
            <option>Available</option>
            <option>Booked</option>
            <option>Unavailable</option>
          </select>
          <button type="submit" className="btn btn-availability">Add Availability</button>
        </form>
      </Panel>

      <Panel title="Availability Board" subtitle={`${availability.length} slots`}>
        <RecordList
          items={availability}
          renderItem={(slot) => (
            <>
              <strong>{clinicianLookup[slot.clinicianId]?.name || slot.clinicianId}</strong>
              <span>{slot.date}</span>
              <span>{slot.time || `${slot.startTime} - ${slot.endTime}`}</span>
              <small className={`status status-${slot.status.toLowerCase()}`}>{slot.status}</small>
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function AppointmentsPage({ appointments, setAppointments, patients, clinicians, patientLookup, clinicianLookup }) {
  const [form, setForm] = useState({
    patientId: patients[0]?.id || "",
    clinicianId: clinicians[0]?.id || "",
    date: "",
    time: "",
    reason: "",
  });

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const addAppointment = (event) => {
    event.preventDefault();
    setAppointments([...appointments, { ...form, id: makeId("appt") }]);
    setForm({ ...form, date: "", time: "", reason: "" });
  };

  return (
    <section className="page-grid">
      <Panel title="Book Appointment" subtitle="Match a patient with the right clinician and time.">
        <form onSubmit={addAppointment} className="form-grid">
          <select name="patientId" value={form.patientId} onChange={updateForm} required>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </select>
          <select name="clinicianId" value={form.clinicianId} onChange={updateForm} required>
            {clinicians.map((clinician) => (
              <option key={clinician.id} value={clinician.id}>
                {clinician.name} - {clinician.specialty}
              </option>
            ))}
          </select>
          <div className="split-row">
            <input name="date" type="date" value={form.date} onChange={updateForm} required />
            <input name="time" type="time" value={form.time} onChange={updateForm} required />
          </div>
          <textarea name="reason" value={form.reason} onChange={updateForm} placeholder="Reason for appointment" rows="4" />
          <button type="submit" className="btn btn-appointment">Book Appointment</button>
        </form>
      </Panel>

      <Panel title="Appointment Schedule" subtitle={`${appointments.length} appointments`}>
        <RecordList
          items={appointments}
          renderItem={(appointment) => (
            <>
              <strong>{patientLookup[appointment.patientId]?.name || appointment.patientId}</strong>
              <span>{clinicianLookup[appointment.clinicianId]?.name || appointment.clinicianId}</span>
              <span>{appointment.date} at {appointment.time}</span>
              <small>{appointment.reason}</small>
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function RecordList({ items, renderItem }) {
  if (!items.length) {
    return <p className="empty-state">No records yet.</p>;
  }

  return (
    <div className="record-list">
      {items.map((item) => (
        <article className="record-card" key={item.id}>
          {renderItem(item)}
        </article>
      ))}
    </div>
  );
}

export default App;
