export function buildPatientScript({ description, status, confirmedTime, confirmationMethod }) {
  const recordedReason = description || "your appointment request";
  const currentStatus = status || "Awaiting Review";
  const timeText = confirmedTime && confirmedTime !== "Not confirmed yet"
    ? `The time currently recorded is ${confirmedTime}.`
    : "I cannot see a confirmed appointment time yet.";
  const confirmationText = confirmationMethod && confirmationMethod !== "Not confirmed"
    ? `It is recorded as confirmed by ${confirmationMethod}.`
    : "I cannot see that this has been confirmed yet.";

  return `I can see this is recorded as: ${recordedReason}. The current status is ${currentStatus}. ${timeText} ${confirmationText} I do not want to guess or give you the wrong information, so I will keep to what is recorded here and make sure the next step is followed.`;
}
