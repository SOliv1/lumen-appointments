# Lumen Appointment Planner

A calm, role‑based prototype exploring how clinical appointment workflows can be organised for **patients**, **clinicians**, and **admin staff** inside a clear, uncluttered digital space.

---

## 1. Why this project exists

I began this project out of curiosity about how clinical appointment systems are structured.

I wanted to understand:

- **How different roles interact** with the same system
- **How safety boundaries are designed** in digital health
- **How human‑factors shape interfaces** for patients and staff
- **How workflows are modelled** for appointments and queues
- **How clarity and restraint reduce cognitive load**
- **How prototypes relate to regulated medical software**

Someone I know is beginning a Masters in Medical Devices.
I wanted to follow her learning journey and explore the architecture behind the kinds of systems she might encounter, without claiming to build or use a regulated medical device myself.

This project is a way to study **SaMD‑adjacent architecture**:
software that is **not** a medical device, but shares structural patterns with regulated clinical tools (role‑based access, safety‑critical UX, workflow modelling, and protected routes).

---

## 2. What this system is (and is not)

- **Is not** a medical device
- **Does not** diagnose, treat, or make clinical decisions
- **Is** a prototype appointment and workflow system
- **Shows** how patients, clinicians, and admin staff might each have their own digital “home area”
- **Demonstrates** role‑based access, protected routing, and session timeout
- **Explores** human‑factors and safety‑critical UX in a calm, atmospheric interface

### SaMD vs SaMD‑adjacent

- **SaMD** = *Software as a Medical Device*
  Software intended for medical purposes (diagnosis, monitoring, treatment) and requiring regulatory approval.

- **SaMD‑adjacent** (this project):
  - Uses role‑based access
  - Models clinical workflows
  - Applies safety‑critical UX
  - Separates patient, clinician, and admin responsibilities
  - Demonstrates human‑factors principles
  - Mirrors the architecture of regulated medical software
  - Does **not** perform medical functions

---

## 3. Seasonal design

The system uses a **seasonal background tint** that changes gently throughout the year:

- **Spring** - soft greens and warm neutrals
- **Summer** - brighter, airy tones
- **Autumn** - muted golds and deeper warmth
- **Winter** - cool blues and calm greys

This seasonal shift is subtle and atmospheric.
It supports emotional clarity, reduces visual fatigue, and gives each role a sense of calm continuity.

---

## 4. Roles and pages

The system has three main roles, each with its own page and access level.

### Patient

- **Page:** `Patient Home`
- **Sees:**
  - Next appointment (placeholder)
  - Messages and reassurance (placeholder)
  - Patient‑safe information only
- **Cannot open:**
  - Clinician queues
  - Booking tools
  - Admin screens
- **Access note:**
  - *Patient role with staff‑only routes disabled.*

### Clinician

- **Page:** `Clinician Dashboard`
- **Sees:**
  - Today’s care queue (placeholder)
  - Structured notes (placeholder)
  - Handoff pathway (conceptual)
- **Cannot open:**
  - Admin‑only screens
  - Patient‑only screens
- **Access note:**
  - *Clinician role with admin‑only and patient‑only routes disabled.*

### Admin

- **Page:** `Admin Panel`
- **Sees:**
  - Outstanding tasks (placeholder)
  - Communications (placeholder)
  - Appointment movements (placeholder)
- **Cannot open:**
  - Clinician‑only screens
  - Patient‑only screens
- **Access note:**
  - *Admin role with clinician‑only and patient‑only routes disabled.*

Each page explains:

- what the role normally does
- what the demo currently shows
- what will appear once connected
- which routes are disabled

This prevents confusion and makes the emptiness intentional, not accidental.

---

## 5. Practice mode and demo behaviour

The `/practice-mode` and demo routes are intentionally limited:

- All three roles can sign in
- Each role lands in its own protected area
- Many sections are placeholders with explanatory text
- No role can access another role’s tools
- No broken buttons or hidden errors, only clearly disabled routes

This makes the prototype safe to explore and suitable as a teaching example.

---

## 6. How this can be used by students

Although this project is not a medical device, it can help students:

- **Map the patient journey**
- **Trace clinician workflows** (queues, notes, handoffs)
- **Analyse admin oversight** (tasks, communications, movements)
- **Evaluate role separation** and access control
- **Discuss safety‑critical UX** and human‑factors
- **Consider what would be needed** for a system like this to become regulated (validation, documentation, risk management, etc.)

It is a gentle, approachable way to see how digital health tools are structured.

---

## 7. Technical notes (high level)

- Frontend: React
- Layout: mobile‑first, calm gradients, neutral ink
- Routing: role‑based pages (Patient, Clinician, Admin)
- Session: timed practice mode (conceptual)
- State: demo‑only, no real patient data

This is intentionally simple and prototype‑focused.

---

## 8. What this project taught me

Building this system helped me understand:

- how patients, clinicians, and admin staff need different digital spaces
- how safety boundaries and disabled routes prevent confusion
- how calm, uncluttered UX can itself be a safety feature
- how clinical workflows can be modelled without performing medical functions
- how SaMD‑adjacent architecture looks and feels in practice

It showed me that thoughtful, serene digital design can support care, reduce friction, and help others develop an eye for workflow, safety, and human‑factors, even before anything becomes a regulated medical device.

---
