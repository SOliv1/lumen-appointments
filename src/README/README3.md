# MAINTAINENCE SCHEDULES

B. Once real data is connected, maintenance becomes essential
When /api/live-booking begins returning real records, you will need:

Routine maintenance every 4–6 weeks
To ensure:
API endpoints stay healthy

Booking logic remains correct

Clinician queues update properly

Patient concerns flow through the pathway

Confirmation logic stays accurate

No mock data leaks into live mode

Structural maintenance every 3–6 months

To ensure:

UI clarity remains strong

Role separation stays crisp

Seasonal tinting and accessibility remain correct

Performance stays smooth under load

Database queries remain efficient

No stale logic accumulates in the booking pipeline

Critical maintenance immediately
If any of the following occur:

Live Booking shows mock data

Practice Mode leaks into Live Booking

Appointment Pathway steps misalign

Clinician Queue shows incorrect items

Patients appear duplicated

Confirmation logic fails

API returns malformed records

1. Summary — Clear and Declarative
Is the system error‑proof right now?
Yes — because it is empty and refuses to use mock data.
This is safe, stable, and low‑risk.

How long before maintenance is needed?

In its current empty state: months

Once real data is connected:

Routine updates: every 4–6 weeks

Structural updates: every 3–6 months

Immediate updates: if any live/practice leakage occurs
