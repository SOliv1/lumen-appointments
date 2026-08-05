import { STATUS_COLOR_CLASSES } from "./concernJourney";

function StatusBadge({ status }) {
  return (
    <span className={`status-badge ${STATUS_COLOR_CLASSES[status] || "badge-grey"}`}>
      {status || "Awaiting Review"}
    </span>
  );
}
export default StatusBadge;
