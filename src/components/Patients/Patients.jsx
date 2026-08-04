import React, { useState } from "react";
import "../../App.css";
function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    dob: "",
    contact: "",
    nhsNumber: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setPatients([...patients, form]);
    setForm({ name: "", dob: "", contact: "", nhsNumber: "" });
  }

  return (
    <div>
      <h2>Patients</h2>

      <form onSubmit={handleSubmit} className="form-box">
        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="dob"
          type="date"
          value={form.dob}
          onChange={handleChange}
        />

        <input
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
        />

        <input
          name="nhsNumber"
          placeholder="NHS Number"
          value={form.nhsNumber}
          onChange={handleChange}
        />

        <button type="submit" className="btn-patient">Add Patient</button>
      </form>

      <ul>
        {patients.map((p, i) => (
          <li key={i}>
            {p.name} — {p.dob} — {p.contact} — NHS: {p.nhsNumber}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Patients;
