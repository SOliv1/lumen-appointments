# Appointment Safety Mockup

Lumen Appointments should not simply store appointments. It should help busy medical admin staff create appointments safely, with enough context to prevent avoidable mistakes, short-notice confusion, missed communications and wasted clinical time.

## Product Intent

The appointment flow should feel like a calm care OS:

- efficient enough for a busy reception or admin desk
- restful enough for tired or stressed staff
- structured enough to restore a lost chain of thought
- forgiving enough to prevent common appointment mistakes
- clear enough that a new staff member can follow it without training anxiety

## Date Format

Use UK date presentation for staff-facing screens: `dd/mm/yyyy`.

Store dates internally as ISO `yyyy-mm-dd` for backend/API reliability, then format them for display in the UI.

## Appointment Page Mockup

```text
+----------------------------+  +----------------------------+
| Book / Update Appointment  |  | Appointment Safety Panel   |
+----------------------------+  +----------------------------+
| Patient                    |  | Readiness                  |
| [Olivia Bennett v]         |  | [ok] Patient contact found |
| Clinician                  |  | [ok] Clinician available   |
| [Dr. Alice Morton v]       |  | [ok] No patient conflict   |
| Date                       |  | [ok] No clinician conflict |
| [26/08/2026]               |  | [!] Notice: under 3 weeks  |
| Time                       |  | [ok] Reason recorded       |
| [09:00 v]                  |  |                            |
| Reason                     |  | Suggested action           |
| [Medication review      ]  |  | Pick later date or record  |
|                            |  | short-notice reason.       |
| [Book Appointment]         |  |                            |
| [Cancel] when updating     |  | [View safe slots]          |
+----------------------------+  +----------------------------+

+----------------------------+  +----------------------------+
| Communication Plan         |  | Appointment Schedule       |
+----------------------------+  +----------------------------+
| Status                     |  | Olivia Bennett             |
| [Not notified v]           |  | Dr. Alice Morton           |
| Initial notice             |  | 26/08/2026 at 09:00        |
| [Send today]               |  | Medication review          |
| Reminder plan              |  | Patient notified           |
| [7 days before]            |  | [Update] [Delete]          |
| [24 hours before]          |  | [Reschedule] [Release slot]|
| [Same day if needed]       |  +----------------------------+
+----------------------------+
```

## Readiness Checklist

Show a clear checklist before save. It should update as the staff member completes the form.

| Check | Calm success state | Warning state |
|-------|--------------------|---------------|
| Patient selected | Patient chosen | Select a patient |
| Patient contact present | Contact available | Add contact before sending notice |
| Clinician selected | Clinician chosen | Select a clinician |
| Availability exists | Slot is open | Clinician not available at this time |
| Patient not double-booked | No patient clash | Patient has another appointment |
| Clinician not double-booked | No clinician clash | Clinician already booked |
| Reason entered | Reason recorded | Add reason before booking |
| Notice period checked | Enough notice | Short notice: record reason |

## Notice Warning

If the date is less than the required notice threshold, the form should not panic the user. It should calmly interrupt.

```text
+------------------------------------------------+
| Short notice appointment                        |
+------------------------------------------------+
| This appointment gives less than 3 weeks notice.|
| Choose a later date or record why this is safe. |
|                                                |
| [Suggested later slots]                         |
| 27/08/2026 09:30                                |
| 27/08/2026 10:00                                |
| 28/08/2026 11:30                                |
|                                                |
| Reason for short notice                         |
| [Urgent clinical need v]                        |
| [Continue with reason] [Choose later slot]      |
+------------------------------------------------+
```

## Conflict Prevention

The app should prevent avoidable appointment errors before the appointment is saved.

- Do not allow a clinician to be booked twice at the same time.
- Do not allow a patient to be booked twice at the same time.
- Warn when a patient already has a nearby appointment.
- Do not allow a booking outside published clinician availability.
- Do not allow a slot marked `Booked` or `Unavailable`.
- Keep end-time options after the selected start time.
- Suggest the nearest safe alternative instead of only showing an error.

## Change Reason Log

When staff update, delete, reschedule or release an appointment, ask for a reason. This should feel protective, not punitive.

Reason options:

- Patient requested change
- Clinician unavailable
- Admin correction
- Urgent clinical change
- Transport or carer issue
- Patient did not confirm
- Other

```text
+----------------------------------------------+
| Why is this appointment changing?             |
+----------------------------------------------+
| [Patient requested change v]                  |
| Optional note                                 |
| [Patient requested later morning slot      ]  |
|                                              |
| [Save change] [Cancel]                        |
+----------------------------------------------+
```

## Communication Status

Each appointment should show its communication state.

Statuses:

- Not notified
- Notification queued
- Patient notified
- Reminder sent
- Patient confirmed
- Needs follow-up
- Could not contact

The appointment card should show the current status in plain language:

```text
Olivia Bennett
Dr. Alice Morton
26/08/2026 at 09:00
Medication review
Communication: Patient notified
Next reminder: 19/08/2026
[Update] [Delete] [Reschedule]
```

## Reminder Schedule

The system should calculate reminders from the appointment date:

- initial notice when appointment is booked
- 7-day reminder
- 24-hour reminder
- same-day reminder if configured

If an appointment is short notice, the reminder panel should adapt:

```text
Short notice reminder plan
[Send notice now]
[Send 24-hour reminder]
[Mark patient confirmed]
```

## Short Notice List

When a slot is cancelled or released, offer it to patients who can attend quickly.

```text
+----------------------------------------------+
| Released slot                                 |
+----------------------------------------------+
| Dr. Alice Morton                              |
| 26/08/2026 at 09:00                           |
|                                              |
| Short notice list                             |
| Marcus Hill - prefers mornings                |
| Sophia Lane - can attend within 24 hours      |
| Daniel Morris - text first                    |
|                                              |
| [Offer to selected patient] [Hold slot]       |
+----------------------------------------------+
```

## Calm Recovery Actions

Deleting should not be the only destructive action. Offer safer recovery choices:

- Reschedule appointment
- Cancel and release slot
- Keep appointment and add note
- Mark patient unable to attend
- Mark clinician unavailable
- Move patient to short-notice list

## Appointment Safety States

| State | UI tone | Primary action |
|-------|---------|----------------|
| Ready to book | Calm green | Book Appointment |
| Missing detail | Gentle prompt | Complete missing field |
| Short notice | Warm amber | Record reason or choose later |
| Conflict found | Clear rose warning | Choose safe slot |
| Patient not notified | Quiet reminder | Send notice |
| Confirmed | Calm success | No action needed |
| Change in progress | Focused update mode | Save change or cancel |

## Day / Night Comfort Mode

The workspace should support staff working across day shifts, late shifts and night shifts.

Day mode:

- warm off-white surfaces rather than stark white
- clear contrast without clinical harshness
- soft seasonal accent colours for status and action

Night mode:

- dimmed background and panels
- lower contrast glare while preserving readable text
- amber/green/blue status colours tuned for low-light environments
- same layout and controls so staff do not have to relearn the interface

## Implementation Notes

This can be built incrementally:

1. Add safety checks in local React state.
2. Add communication status to appointment records.
3. Add change reason field for update/delete/reschedule.
4. Add short-notice list mock data.
5. Later, persist audit logs and reminder tasks in the backend.
