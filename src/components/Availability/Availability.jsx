import React, { useState } from "react";
import "../../App.css";
function Availability() {
  const [availability, setAvailability] = useState([]);
  const [form, setForm] = useState({
    clinicianId: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setAvailability([...availability, form]);
    setForm({ clinicianId: "", date: "", startTime: "", endTime: "" });
  }

  return (
    <div>
      <h2>Availability</h2>

      <form onSubmit={handleSubmit} className="form-box">
        <input
          name="clinicianId"
          placeholder="Clinician ID"
          value={form.clinicianId}
          onChange={handleChange}
        />

        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
        />

        <input
          name="startTime"
          type="time"
          value={form.startTime}
          onChange={handleChange}
        />

        <input
          name="endTime"
          type="time"
          value={form.endTime}
          onChange={handleChange}
        />

        <button type="submit" className="btn-availability">Add Availability</button>
      </form>

      <ul>
        {availability.map((a, i) => (
          <li key={i}>
            Clinician {a.clinicianId}: {a.date} — {a.startTime} to {a.endTime}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Availability;
