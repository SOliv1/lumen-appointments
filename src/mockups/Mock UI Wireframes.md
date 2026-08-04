# Serene-Care-Sync UI Wireframes (ASCII)

## Shared Layout
+----------------------------------------------------------+
| Seasonal care studio                                     |
| serene-care-sync                                         |
| Calm seasonal workspace hero                             |
+----------------------------------------------------------+
| Patients | Clinicians | Availability | Appointments      |
+----------------------------------------------------------+

## Patients Page
+----------------------------+  +--------------------------+
| Register / Update Patient  |  | Patient List             |
+----------------------------+  +--------------------------+
| [Full name input]          |  | Olivia Bennett           |
| [DOB picker]               |  | DOB 12/03/1984           |
| [Contact input]            |  | 07792 441223             |
| [Care notes textarea]      |  | Asthma, seasonal triggers|
| [Add/Save Patient] [Cancel]|  | [Update] [Delete]        |
+----------------------------+  +--------------------------+

## Clinicians Page
+----------------------------+  +--------------------------+
| Add / Update Clinician     |  | Clinical Team            |
+----------------------------+  +--------------------------+
| [Clinician name input]     |  | Dr. Alice Morton         |
| [Role input]               |  | GP - Family Medicine     |
| [Specialty input]          |  | 07792 441223             |
| [Contact input]            |  | Registration 1234567     |
| [GMC/NMC/HCPC optional]    |  | [Update] [Delete]        |
| [Add/Save Clinician]       |  +--------------------------+
| [Cancel] when updating     |
+----------------------------+

## Availability Page
+----------------------------+  +--------------------------+
| Open / Update Availability |  | Availability Board       |
+----------------------------+  +--------------------------+
| [Clinician dropdown]       |  | Dr. Alice Morton         |
| [Date picker]              |  | 05/08/2026               |
| [Start time dropdown]      |  | 09:00 - 09:30            |
| [End time dropdown]        |  | Status: Available       |
| [Status dropdown]          |  | [Update] [Delete]        |
| [Add/Save Availability]    |  |                          |
| [Cancel] when updating     |  +--------------------------+
+----------------------------+

## Appointments Page
+----------------------------+  +----------------------------+
| Book / Update Appointment  |  | Appointment Safety Panel   |
+----------------------------+  +----------------------------+
| [Patient dropdown]         |  | Readiness checklist        |
| [Clinician dropdown]       |  | [ok] Patient contact       |
| [Date picker]              |  | [ok] Clinician available   |
| [Time dropdown]            |  | [!] Notice period          |
| [Reason textarea]          |  | [ok] No double-booking     |
| [Book/Save Appointment]    |  | [ok] Reason recorded       |
| [Cancel] when updating     |  |                            |
+----------------------------+  | Notice status              |
                                | Short notice warning       |
                                | Suggested later dates      |
                                |                            |
                                | Communication status       |
                                | [Not notified]             |
                                | [Queued] [Sent] [Confirmed]|
                                +----------------------------+

+----------------------------+  +----------------------------+
| Appointment Schedule       |  | Short Notice List          |
+----------------------------+  +----------------------------+
| Olivia Bennett             |  | Patients able to attend    |
| Dr. Alice Morton           |  | quickly if a slot opens    |
| 05/08/2026 at 09:00        |  |                            |
| Medication review          |  | Marcus Hill                |
| Status: Patient notified   |  | Sophia Lane                |
| [Update] [Delete]          |  | Daniel Morris              |
| [Reschedule] [Release slot]|  | [Offer released slot]      |
+----------------------------+  +----------------------------+

## Appointment Change / Recovery State
+----------------------------------------------------------+
| Appointment change reason                                |
+----------------------------------------------------------+
| [Patient requested change dropdown]                      |
| [Clinician unavailable dropdown]                         |
| [Admin correction dropdown]                              |
| [Urgent clinical change dropdown]                        |
| [Other + note textarea]                                  |
|                                                          |
| Calm recovery actions:                                   |
| [Cancel and release slot] [Reschedule] [Keep + add note] |
+----------------------------------------------------------+
