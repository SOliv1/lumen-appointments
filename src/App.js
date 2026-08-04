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

const TIME_OPTIONS = [
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

const getLaterTimeOptions = (time) => {
  const timeIndex = TIME_OPTIONS.indexOf(time);
  return TIME_OPTIONS.slice(timeIndex + 1);
};

const formatUkDate = (isoDate) => {
  if (!isoDate) {
    return "Date not set";
  }

  const [year, month, day] = isoDate.split("-");
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
};

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
          <p className="eyebrow">Seasonal care studio</p>
          <p>
            Coordinate patients, clinicians, availability and bookings inside a calm,
            seasonal workspace.
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
  const [editingId, setEditingId] = useState(null);

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const resetPatientForm = () => {
    setForm({ name: "", dob: "", contact: "", notes: "" });
    setEditingId(null);
  };

  const savePatient = (event) => {
    event.preventDefault();
    if (editingId) {
      setPatients(
        patients.map((patient) =>
          patient.id === editingId ? { ...form, id: editingId } : patient
        )
      );
    } else {
      setPatients([...patients, { ...form, id: makeId("patient") }]);
    }
    resetPatientForm();
  };

  const updatePatient = (patient) => {
    setForm({
      name: patient.name,
      dob: patient.dob,
      contact: patient.contact,
      notes: patient.notes || "",
    });
    setEditingId(patient.id);
  };

  const deletePatient = (id) => {
    setPatients(patients.filter((patient) => patient.id !== id));
    if (editingId === id) {
      resetPatientForm();
    }
  };

  return (
    <section className="page-grid">
      <Panel
        title={editingId ? "Update Patient" : "Register Patient"}
        subtitle="Capture the minimum details needed for scheduling."
      >
        <form onSubmit={savePatient} className="form-grid">
          <input name="name" value={form.name} onChange={updateForm} placeholder="Full name" required />
          <input name="dob" type="date" value={form.dob} onChange={updateForm} required />
          <input name="contact" value={form.contact} onChange={updateForm} placeholder="Contact number" required />
          <textarea name="notes" value={form.notes} onChange={updateForm} placeholder="Care notes" rows="4" />
          <div className="form-actions">
            <button type="submit" className="btn btn-patient">
              {editingId ? "Save Patient" : "Add Patient"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-quiet" onClick={resetPatientForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Patient List" subtitle={`${patients.length} active records`}>
        <RecordList
          items={patients}
          renderItem={(patient) => (
            <>
              <strong>{patient.name}</strong>
              <span>DOB {formatUkDate(patient.dob)}</span>
              <span>{patient.contact}</span>
              {patient.notes && <small>{patient.notes}</small>}
              <div className="record-actions">
                <button type="button" className="action-button" onClick={() => updatePatient(patient)}>
                  Update
                </button>
                <button type="button" className="action-button danger" onClick={() => deletePatient(patient.id)}>
                  Delete
                </button>
              </div>
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
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const isValidRegistration = (id) => {
    if (!id) return true;
    return /^\d{7}$/.test(id) || /^[A-Za-z]{2}\d{6}$/.test(id) || /^[A-Za-z]{2}\d{5}$/.test(id);
  };

  const resetClinicianForm = () => {
    setForm({ name: "", role: "", specialty: "", contact: "", registrationId: "" });
    setEditingId(null);
    setError("");
  };

  const saveClinician = (event) => {
    event.preventDefault();
    if (!isValidRegistration(form.registrationId)) {
      setError("Use GMC 7 digits, NMC AA######, or HCPC AA#####.");
      return;
    }
    if (editingId) {
      setClinicians(
        clinicians.map((clinician) =>
          clinician.id === editingId ? { ...form, id: editingId } : clinician
        )
      );
    } else {
      setClinicians([...clinicians, { ...form, id: makeId("clinician") }]);
    }
    resetClinicianForm();
  };

  const editClinician = (clinician) => {
    setForm({
      name: clinician.name,
      role: clinician.role,
      specialty: clinician.specialty,
      contact: clinician.contact,
      registrationId: clinician.registrationId || "",
    });
    setEditingId(clinician.id);
    setError("");
  };

  const deleteClinician = (id) => {
    setClinicians(clinicians.filter((clinician) => clinician.id !== id));
    if (editingId === id) {
      resetClinicianForm();
    }
  };

  return (
    <section className="page-grid">
      <Panel
        title={editingId ? "Update Clinician" : "Add Clinician"}
        subtitle="Build the rota with verified clinical staff."
      >
        <form onSubmit={saveClinician} className="form-grid">
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
          <div className="form-actions">
            <button type="submit" className="btn btn-clinician">
              {editingId ? "Save Clinician" : "Add Clinician"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-quiet" onClick={resetClinicianForm}>
                Cancel
              </button>
            )}
          </div>
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
              <div className="record-actions">
                <button type="button" className="action-button" onClick={() => editClinician(clinician)}>
                  Update
                </button>
                <button type="button" className="action-button danger" onClick={() => deleteClinician(clinician.id)}>
                  Delete
                </button>
              </div>
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
    startTime: "09:00",
    endTime: "09:30",
    status: "Available",
  });
  const [editingId, setEditingId] = useState(null);

  const updateForm = (event) => {
    const { name, value } = event.target;

    if (name === "startTime") {
      const nextEndOptions = getLaterTimeOptions(value);
      const endTime = nextEndOptions.includes(form.endTime)
        ? form.endTime
        : nextEndOptions[0] || value;

      setForm({ ...form, startTime: value, endTime });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const resetAvailabilityForm = () => {
    setForm({
      clinicianId: clinicians[0]?.id || "",
      date: "",
      startTime: "09:00",
      endTime: "09:30",
      status: "Available",
    });
    setEditingId(null);
  };

  const saveSlot = (event) => {
    event.preventDefault();
    if (editingId) {
      setAvailability(
        availability.map((slot) =>
          slot.id === editingId ? { ...form, id: editingId } : slot
        )
      );
    } else {
      setAvailability([...availability, { ...form, id: makeId("slot") }]);
    }
    resetAvailabilityForm();
  };

  const updateSlot = (slot) => {
    const [startTime = "", endTime = ""] = slot.time ? slot.time.split("-") : [];

    setForm({
      clinicianId: slot.clinicianId,
      date: slot.date,
      startTime: slot.startTime || startTime,
      endTime: slot.endTime || endTime,
      status: slot.status || "Available",
    });
    setEditingId(slot.id);
  };

  const deleteSlot = (id) => {
    setAvailability(availability.filter((slot) => slot.id !== id));
    if (editingId === id) {
      resetAvailabilityForm();
    }
  };

  return (
    <section className="page-grid">
      <Panel
        title={editingId ? "Update Availability" : "Open Availability"}
        subtitle="Publish clinician slots for booking."
      >
        <form onSubmit={saveSlot} className="form-grid">
          <select name="clinicianId" value={form.clinicianId} onChange={updateForm} required>
            {clinicians.map((clinician) => (
              <option key={clinician.id} value={clinician.id}>
                {clinician.name} - {clinician.role}
              </option>
            ))}
          </select>
          <input name="date" type="date" value={form.date} onChange={updateForm} required />
          <div className="split-row">
            <select name="startTime" value={form.startTime} onChange={updateForm} required>
              {TIME_OPTIONS.slice(0, -1).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <select name="endTime" value={form.endTime} onChange={updateForm} required>
              {getLaterTimeOptions(form.startTime).map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <select name="status" value={form.status} onChange={updateForm}>
            <option>Available</option>
            <option>Booked</option>
            <option>Unavailable</option>
          </select>
          <div className="form-actions">
            <button type="submit" className="btn btn-availability">
              {editingId ? "Save Availability" : "Add Availability"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-quiet" onClick={resetAvailabilityForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Availability Board" subtitle={`${availability.length} slots`}>
        <RecordList
          items={availability}
          renderItem={(slot) => (
            <>
              <strong>{clinicianLookup[slot.clinicianId]?.name || slot.clinicianId}</strong>
              <span>{formatUkDate(slot.date)}</span>
              <span>{slot.time || `${slot.startTime} - ${slot.endTime}`}</span>
              <small className={`status status-${slot.status.toLowerCase()}`}>{slot.status}</small>
              <div className="record-actions">
                <button type="button" className="action-button" onClick={() => updateSlot(slot)}>
                  Update
                </button>
                <button type="button" className="action-button danger" onClick={() => deleteSlot(slot.id)}>
                  Delete
                </button>
              </div>
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
    time: "09:00",
    reason: "",
  });
  const [editingId, setEditingId] = useState(null);

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const resetAppointmentForm = () => {
    setForm({
      patientId: patients[0]?.id || "",
      clinicianId: clinicians[0]?.id || "",
      date: "",
      time: "09:00",
      reason: "",
    });
    setEditingId(null);
  };

  const saveAppointment = (event) => {
    event.preventDefault();
    if (editingId) {
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === editingId ? { ...form, id: editingId } : appointment
        )
      );
    } else {
      setAppointments([...appointments, { ...form, id: makeId("appt") }]);
    }
    resetAppointmentForm();
  };

  const editAppointment = (appointment) => {
    setForm({
      patientId: appointment.patientId,
      clinicianId: appointment.clinicianId,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
    });
    setEditingId(appointment.id);
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter((appointment) => appointment.id !== id));
    if (editingId === id) {
      resetAppointmentForm();
    }
  };

  return (
    <section className="page-grid">
      <Panel
        title={editingId ? "Update Appointment" : "Book Appointment"}
        subtitle="Match a patient with the right clinician and time."
      >
        <form onSubmit={saveAppointment} className="form-grid">
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
            <select name="time" value={form.time} onChange={updateForm} required>
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <textarea name="reason" value={form.reason} onChange={updateForm} placeholder="Reason for appointment" rows="4" />
          <div className="form-actions">
            <button type="submit" className="btn btn-appointment">
              {editingId ? "Save Appointment" : "Book Appointment"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-quiet" onClick={resetAppointmentForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Appointment Schedule" subtitle={`${appointments.length} appointments`}>
        <RecordList
          items={appointments}
          renderItem={(appointment) => (
            <>
              <strong>{patientLookup[appointment.patientId]?.name || appointment.patientId}</strong>
              <span>{clinicianLookup[appointment.clinicianId]?.name || appointment.clinicianId}</span>
              <span>{formatUkDate(appointment.date)} at {appointment.time}</span>
              <small>{appointment.reason}</small>
              <div className="record-actions">
                <button type="button" className="action-button" onClick={() => editAppointment(appointment)}>
                  Update
                </button>
                <button type="button" className="action-button danger" onClick={() => deleteAppointment(appointment.id)}>
                  Delete
                </button>
              </div>
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
