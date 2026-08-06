export const CONCERN_STATUSES = [
  "Awaiting Review",
  "Needs Information",
  "Ready for Triage",
  "Triaged",
  "Appointment Required",
  "Appointment Booked",
  "Treatment",
  "Follow-up",
  "Closed",
];

export const STATUS_COLOR_CLASSES = {
  "Awaiting Review": "badge-yellow",
  "Needs Information": "badge-amber",
  "Ready for Triage": "badge-blue",
  "Triaged": "badge-purple",
  "Appointment Required": "badge-purple",
  "Appointment Booked": "badge-green",
  "Treatment": "badge-teal",
  "Follow-up": "badge-gold",
  "Closed": "badge-grey",
};

export const PATIENT_JOURNEY_STAGES = [
  "Concern",
  "Triage",
  "Appointment",
  "Treatment",
  "Follow-up",
  "Closed",
];

export const PATIENT_JOURNEY_COLOR_CLASSES = {
  Concern: "journey-concern",
  Triage: "journey-triage",
  Appointment: "journey-appointment",
  Treatment: "journey-treatment",
  "Follow-up": "journey-follow-up",
  Closed: "journey-closed",
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
      return { label: "Begin Treatment", action: "treatment" };

    case "Treatment":
      return { label: "Move to Follow-up", action: "follow-up" };

    case "Follow-up":
      return { label: "Close", action: "close" };

    default:
      return null;
  }
}

export function getPatientJourneyStage(status) {
  switch (status) {
    case "Awaiting Review":
    case "Needs Information":
      return "Concern";
    case "Ready for Triage":
    case "Triaged":
      return "Triage";
    case "Appointment Required":
    case "Appointment Booked":
      return "Appointment";
    case "Treatment":
      return "Treatment";
    case "Follow-up":
      return "Follow-up";
    case "Closed":
      return "Closed";
    default:
      return "Concern";
  }
}

export function getPatientJourneyStepNumber(status) {
  const stage = getPatientJourneyStage(status);
  const index = PATIENT_JOURNEY_STAGES.indexOf(stage);
  return index === -1 ? 1 : index + 1;
}
