import React, { useState } from "react";
import "../../App.css";

function Clinicians() {
  const [clinicians, setClinicians] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    role: "",
    specialty: "",
    contact: "",
    registrationId: "", // GMC / NMC / HCPC (optional)
  });

  // Internal system-generated ID
  function generateId() {
    return crypto.randomUUID();
  }

  // Validate GMC / NMC / HCPC
  function validateRegistrationId(id) {
    if (!id) return true; // optional field

    const GMC = /^\d{7}$/;
    const NMC = /^[A-Za-z]{2}\d{6}$/;
    const HCPC = /^[A-Za-z]{2}\d{5}$/;

    return GMC.test(id) || NMC.test(id) || HCPC.test(id);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // clear error when typing
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Validate real-world ID
    if (!validateRegistrationId(form.registrationId)) {
      setError(
        "Invalid ID format. GMC: 7 digits • NMC: AA###### • HCPC: AA#####"
      );
      return;
    }

    if (editingId) {
      // UPDATE existing clinician
      const updated = clinicians.map((c) =>
        c.id === editingId ? { ...form, id: editingId } : c
      );
      setClinicians(updated);
      setEditingId(null);
    } else {
      // ADD new clinician
      setClinicians([...clinicians, { ...form, id: generateId() }]);
    }

    // Reset form
    setForm({
      name: "",
      role: "",
      specialty: "",
      contact: "",
      registrationId: "",
    });
  }

  function handleDelete(id) {
    setClinicians(clinicians.filter((c) => c.id !== id));
  }

  function handleUpdate(id) {
    const clinician = clinicians.find((c) => c.id === id);
    setForm(clinician);
    setEditingId(id);
    setError("");
  }

  return (
    <div>
      <h2>Clinicians</h2>

      <form onSubmit={handleSubmit} className="form-box">
        <input
          name="name"
          placeholder="Clinician Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="role"
          placeholder="Role (GP, Nurse, Consultant)"
          value={form.role}
          onChange={handleChange}
        />

        <input
          name="specialty"
          placeholder="Specialty"
          value={form.specialty}
          onChange={handleChange}
        />

        <input
          name="contact"
          placeholder="Contact Number"
          value={form.contact}
          onChange={handleChange}
        />

        <input
          name="registrationId"
          placeholder="GMC / NMC / HCPC (optional)"
          value={form.registrationId}
          onChange={handleChange}
        />

        {error && <p className="error-box">{error}</p>}

        <button type="submit" className="btn-clinician">
          {editingId ? "Update Clinician" : "Add Clinician"}
        </button>
      </form>

      {clinicians.length === 0 ? (
        <p className="placeholder-box">
          No clinicians added yet. Add your first clinician above.
        </p>
      ) : (
        <ul>
          {clinicians.map((c) => (
            <li key={c.id}>
              <strong>ID:</strong> {c.id.slice(0, 8)} •{" "}
              {c.registrationId && (
                <>
                  <strong>Reg:</strong> {c.registrationId} •{" "}
                </>
              )}
              {c.name} — {c.role} — {c.specialty} — {c.contact}

              <button
                className="btn-update"
                onClick={() => handleUpdate(c.id)}
              >
                Update
              </button>

              <button
                className="btn-delete"
                onClick={() => handleDelete(c.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Clinicians;
