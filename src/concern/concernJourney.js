export const CONCERN_STATUSES = [
  "Awaiting Review",
  "Needs Information",
  "Ready for Triage",
  "Triaged",
  "Appointment Required",
  "Appointment Booked",
  "Closed",
];

export const STATUS_COLOR_CLASSES = {
  "Awaiting Review": "badge-yellow",
  "Needs Information": "badge-amber",
  "Ready for Triage": "badge-blue",
  "Triaged": "badge-purple",
  "Appointment Required": "badge-purple",
  "Appointment Booked": "badge-green",
  "Closed": "badge-grey",
};

export function getConcernStepNumber(status) {
  const index = CONCERN_STATUSES.indexOf(status);
  return index === -1 ? 1 : index + 1;
}

export function getPreviousConcernStatus(status) {
  const index = CONCERN_STATUSES.indexOf(status);

  if (index <= 0) {
    return null;
  }

  return CONCERN_STATUSES[index - 1];
}

export function getNextConcernStep(status) {
  switch (status) {
    case "Awaiting Review":
      return { label: "Ready for Triage", action: "triage" };

    case "Needs Information":
      return { label: "Ready for Triage", action: "triage" };

    case "Ready for Triage":
      return { label: "Mark Triaged", action: "review" };

    case "Triaged":
      return { label: "Appointment Required", action: "assign" };

    case "Appointment Required":
      return { label: "Book Appointment", action: "match" };

    case "Appointment Booked":
      return { label: "Close", action: "close" };

    default:
      return null;
  }
}
