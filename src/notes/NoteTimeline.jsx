import { useState } from "react";
import { NOTE_TYPE_CLASSES, NOTE_TYPES } from "./noteTypes";

function NoteTimeline({
  notes = [],
  title = "Structured Notes",
  defaultType = "Administrative",
  defaultAuthor = "Care Navigation Team",
  onAddNote,
}) {
  const [type, setType] = useState(defaultType);
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState("Internal");

  const submitNote = (event) => {
    event.preventDefault();
    const trimmedText = text.trim();

    if (!trimmedText) {
      return;
    }

    onAddNote?.({
      type,
      text: trimmedText,
      author: defaultAuthor,
      visibility,
      createdAt: new Date().toISOString(),
    });
    setText("");
  };

  return (
    <section className="note-timeline">
      <strong>{title}</strong>
      {notes.length ? (
        <ol>
          {notes.map((note) => {
            const noteClass = NOTE_TYPE_CLASSES[note.type] || "note-administrative";

            return (
              <li className={`typed-note ${noteClass}`} key={note.id || `${note.type}-${note.createdAt}`}>
                <span>{note.type || "Administrative"}</span>
                <p>{note.text}</p>
                <small>
                  {note.author || "Not recorded"} - {formatNoteDate(note.createdAt)} - {note.visibility || "Internal"}
                </small>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="empty-note-state">No structured notes recorded yet.</p>
      )}

      {onAddNote && (
        <form className="note-composer" onSubmit={submitNote}>
          <div className="note-composer-grid">
            <label>
              Note type
              <select value={type} onChange={(event) => setType(event.target.value)}>
                {NOTE_TYPES.map((noteType) => (
                  <option key={noteType}>{noteType}</option>
                ))}
              </select>
            </label>
            <label>
              Visibility
              <select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
                <option>Internal</option>
                <option>Patient-facing</option>
                <option>Clinical team</option>
              </select>
            </label>
          </div>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Add a concise structured note"
            rows="3"
          />
          <button type="submit" className="action-button">
            Add structured note
          </button>
        </form>
      )}
    </section>
  );
}

function formatNoteDate(value) {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "Date not recorded";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default NoteTimeline;
