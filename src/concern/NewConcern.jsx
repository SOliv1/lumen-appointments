import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { buildPatientScript } from "./patientScript";

function buildDefaultPatientMessage(description) {
  const recordedReason = description || "the recorded concern";
  return `The request is recorded as ${recordedReason}. Staff can confirm the recorded reason, the current appointment status, and that the concern is being handled through the care journey.`;
}

function NewConcern({ addConcern, patients = [], descriptions = [], returnTo = "/concerns" }) {
  const history = useHistory();

  const [patientId, setPatientId] = useState(patients[0]?.id || "");
  const [patientName, setPatientName] = useState(patients[0]?.name || "");
  const [description, setDescription] = useState(descriptions[0] || "");
  const [patientMessage, setPatientMessage] = useState(buildDefaultPatientMessage(descriptions[0]));
  const [confirmedTime, setConfirmedTime] = useState("");
  const [confirmationMethod, setConfirmationMethod] = useState("Not confirmed");
  const [trigger, setTrigger] = useState("email");
  const staffScript = buildPatientScript({
    description,
    status: "Awaiting Review",
    confirmedTime,
    confirmationMethod,
  });

  useEffect(() => {
    if (!patientId && patients[0]) {
      setPatientId(patients[0].id);
      setPatientName(patients[0].name);
    }
  }, [patientId, patients]);

  useEffect(() => {
    if (!description && descriptions[0]) {
      setDescription(descriptions[0]);
      setPatientMessage(buildDefaultPatientMessage(descriptions[0]));
    }
  }, [description, descriptions]);

  const updateDescription = (value) => {
    setDescription(value);
    setPatientMessage(buildDefaultPatientMessage(value));
  };

  function handleSubmit(e) {
    e.preventDefault();

    const newConcern = {
      id: Date.now(),
      patientId,
      patientName,
      description,
      patientMessage,
      staffScript,
      confirmedTime,
      confirmationMethod,
      trigger,
      status: "Awaiting Review"
    };

    addConcern?.(newConcern);

    history.push(returnTo);
  }

  return (
    <section className="new-concern">
      <h2>Begin Care Journey</h2>
      <p>Capture demand before turning it into booked care.</p>

      <form onSubmit={handleSubmit}>
        <label>Patient</label>
        {patients.length > 0 ? (
          <select
            value={patientId}
            onChange={(e) => {
              const selectedPatient = patients.find((patient) => patient.id === e.target.value);
              setPatientId(e.target.value);
              setPatientName(selectedPatient?.name || "");
            }}
            required
          >
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Patient name"
            required
          />
        )}

        <label>Concern description</label>
        {descriptions.length > 0 && (
          <select value={description} onChange={(e) => updateDescription(e.target.value)} required>
            {descriptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={description}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="What is this appointment or request about?"
          required
        />

        <label>Patient-facing factual note</label>
        <textarea
          value={patientMessage}
          onChange={(e) => setPatientMessage(e.target.value)}
          placeholder="Auto-filled from the recorded concern. Keep this factual and non-clinical."
          rows="4"
          required
        />

        <label>Staff script if patient asks</label>
        <textarea value={staffScript} rows="5" readOnly />

        <label>Confirmed appointment time</label>
        <input
          type="text"
          value={confirmedTime}
          onChange={(e) => setConfirmedTime(e.target.value)}
          placeholder="Not confirmed yet, or e.g. 11:30 AM"
          required
        />

        <label>How was this confirmed?</label>
        <select
          value={confirmationMethod}
          onChange={(e) => setConfirmationMethod(e.target.value)}
        >
          <option>Not confirmed</option>
          <option>Phone</option>
          <option>Letter</option>
          <option>Email</option>
          <option>SMS</option>
          <option>Portal</option>
        </select>

        <label>Trigger source</label>
        <select
          value={trigger}
          onChange={(e) => setTrigger(e.target.value)}
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="walk-in">Walk-in</option>
          <option value="portal">Portal</option>
          <option value="referral">Referral</option>
        </select>

        <button type="submit" className="create-button">
          Begin Care Journey
        </button>
      </form>
    </section>
  );
}

export default NewConcern;
