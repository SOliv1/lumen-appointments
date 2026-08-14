# Lumen Appointments — Mock Data Library
A complete set of fictional, safe mock data for UI design, testing, and documentation.

---

# 1. Clinician IDs (Internal + Real Registration)

## Internal System IDs (UUID)
- c8f3a9d2-4b1e-4a7b-9f2a-1d9e3b4c7f11
- f2a7c1d9-8b3e-4f22-9a44-0c1e5d7b2a90
- 9b4e1c22-3f7a-4d9e-8c11-7a2f3d9c4e55
- 1d7e3b4c-9f11-4a7b-8b3e-2f2a9c1d8e44
- 7a2f3d9c-4e55-8c11-3f7a-1d7e3b4c9f22

## Real Registration IDs (Optional)
### GMC (Doctors)
- 1234567
- 4829173

### NMC (Nurses & Midwives)
- AB123456
- NM482917

### HCPC (Allied Health)
- OT12345
- PR30918

---

# 2. Mock Patients

| Patient ID (UUID) | Name | DOB | Contact | Notes |
|-------------------|------|-----|---------|-------|
| p1a9c2d3 | Olivia Bennett | 1984-03-12 | 07792 441223 | Asthma, seasonal triggers |
| p2f7e8a1 | Marcus Hill | 1991-11-02 | 07811 992344 | Recovering from knee surgery |
| p3d4b1e9 | Emily Carter | 1976-07-29 | 07988 221144 | Diabetes Type II |
| p4c8a7f2 | Daniel Morris | 2000-01-18 | 07544 882991 | Anxiety, prefers morning appts |
| p5e9d2c7 | Sophia Lane | 1969-05-05 | 07701 553882 | Hypertension |

---

# 3. Mock Availability Slots

| Slot ID (UUID) | Clinician | Date | Time | Status |
|----------------|-----------|------|------|--------|
| a1f2c3d4 | Dr. Alice Morton | 2026-08-05 | 09:00–09:30 | Available |
| a2d3e4f5 | Sarah Hill (Nurse) | 2026-08-05 | 10:00–10:30 | Available |
| a3b4c5d6 | Jamie Patel (OT) | 2026-08-06 | 14:00–14:30 | Booked |
| a4c5d6e7 | Emma Clarke (Midwife) | 2026-08-07 | 11:00–11:30 | Available |
| a5e6f7g8 | Daniel Ross (Paramedic) | 2026-08-07 | 15:00–15:30 | Unavailable |

---

# 4. Mock Appointments

| Appointment ID | Patient | Clinician | Date | Time | Reason |
|----------------|---------|-----------|------|------|--------|
| appt-001 | Olivia Bennett | Dr. Alice Morton | 2026-08-05 | 09:00 | Medication review |
| appt-002 | Marcus Hill | Jamie Patel (OT) | 2026-08-06 | 14:00 | Mobility follow-up |
| appt-003 | Emily Carter | Sarah Hill (Nurse) | 2026-08-05 | 10:00 | Blood pressure check |
| appt-004 | Sophia Lane | Emma Clarke (Midwife) | 2026-08-07 | 11:00 | Wellness consultation |
| appt-005 | Daniel Morris | Daniel Ross (Paramedic) | 2026-08-07 | 15:00 | Anxiety support |

---

# 5. Mock Contacts

| Contact ID | Name | Relationship | Phone | Notes |
|------------|------|--------------|--------|-------|
| c1a2b3 | Laura Bennett | Daughter | 07792 441224 | Emergency contact |
| c2b3c4 | James Hill | Brother | 07811 992345 | Lives nearby |
| c3c4d5 | Helen Carter | Partner | 07988 221145 | Keyholder |
| c4d5e6 | Michael Lane | Husband | 07701 553883 | Primary support |
| c5e6f7 | Anna Morris | Mother | 07544 882992 | Prefers text messages |

---

# 6. Seasonal Colour Palettes (Lumen Appointments)

## Core Seasonal Palette
- **Lavender Mist** — `#C9C3E6` (Patients)
- **Rose Quartz** — `#E7C4C4` (Contacts)
- **Scrub Teal** — `#3A7F8F` (Clinicians)
- **Dusk Gold** — `#D9B878` (Availability)
- **Soft Green** — `#7FAF8F` (Appointments)

## Accent Palette
- **Cloud Grey** — `#F2F2F2`
- **Slate Calm** — `#4A5568`
- **Midnight Navy** — `#2F4A7A`
- **Seasonal Sky** — `#AFC7E6`

## UI States
- **Success** — `#7FAF8F`
- **Warning** — `#D9B878`
- **Error (Soft)** — `#C97A7A`
- **Disabled** — `#D3D3D3`

---

# End of Mock Data Library
