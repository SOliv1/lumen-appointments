export const CLINICIAN_JOURNEY_STEPS = [
  "Today's care queue",
  "Review concern",
  "Add clinical notes",
  "Request investigations",
  "Arrange follow-up",
  "Complete consultation",
];

export function getClinicianStepNumber(step) {
  const index = CLINICIAN_JOURNEY_STEPS.indexOf(step);
  return index === -1 ? 1 : index + 1;
}

export function getPreviousClinicianStep(step) {
  const index = CLINICIAN_JOURNEY_STEPS.indexOf(step);

  if (index <= 0) {
    return null;
  }

  return CLINICIAN_JOURNEY_STEPS[index - 1];
}

export function getNextClinicianStep(step) {
  const index = CLINICIAN_JOURNEY_STEPS.indexOf(step);

  if (index === -1 || index >= CLINICIAN_JOURNEY_STEPS.length - 1) {
    return null;
  }

  return CLINICIAN_JOURNEY_STEPS[index + 1];
}
