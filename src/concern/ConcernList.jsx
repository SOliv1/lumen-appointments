import ConcernRow from "./ConcernRow";

function ConcernList({ concerns, onAdvanceConcern }) {
  return (
    <section className="concern-list">
      <h2>Concern List</h2>

      {concerns.length === 0 ? (
        <p className="empty">No concerns yet</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Appointment Purpose</th>
              <th>Patient Information</th>
              <th>Triage Preview</th>
              <th>Concern Status</th>
              <th>Next Step</th>
            </tr>
          </thead>

          <tbody>
            {concerns.map((c) => (
              <ConcernRow key={c.id} concern={c} onAdvanceConcern={onAdvanceConcern} />
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default ConcernList;
