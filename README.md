# Lumen Appointment Planner

[![CodeQL](https://github.com/SOliv1/lumen-appointments/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/SOliv1/lumen-appointments/actions/workflows/codeql-analysis.yml)

This model View Live Demo [Here](https://serene-care-synchronicity.onrender.com/)



 This should be treated as a **showcase and training prototype**. Its job is to help a healthcare administrator understand:

- what the system is trying to solve
- how the patient, clinician and admin journeys connect
- where confusion is reduced
- how appointment changes, clarification and communication are handled
- what their role would feel like in practice

For showing a professional healthcare administrator, the mock mode is useful because they can press buttons, see the board move, reset it, and safely explore without damaging real records.

If this became a real working model, it would not remain exactly like this.

Two separate modes:

**Prototype / Training Mode**
Uses mock patients, mock clinicians, mock appointments, reset button, activity examples.  
Good for demos, staff onboarding, testing workflows, and explaining the system.

**Live / Operational Mode**
Uses real authenticated users, real patient records, real appointment data, proper audit logs, permissions, data protection, and no casual reset button.

In a live platform, the **mock model gets switched off** or moved behind a clear training/demo environment. The clean operational platform would have:

- secure login
- role-based access
- real database
- audit trail
- no fake patients
- no mock reset
- no demo auto-step button
- safe error handling
- clear permissions for admin, clinicians and managers
- integration with real appointment/communication systems where appropriate

 Mock prototype for demonstration, but create a clean live mode for real use.**

The prototype is your “show and learn” environment.  
The live version is the professional working platform.

> "We are not building software.
> We are building confidence, clarity and continuity for people at moments when they most need reassurance."
>
[Live Preview](https://serene-care-synchronicity.onrender.com)

Creating a calmer, smarter and more compassionate healthcare journey by connecting patients, clinicians and healthcare services through intelligent coordination and communication.”

A calm, structured care-coordination workspace where staff, patients, clinicians and schedules stay synced.

## Local Development

Install dependencies:

```bash
npm install
```

Run the frontend development server:

```bash
npm start
```

Build for production:

```bash
npm run build
```

Run the backend/static production server:

```bash
npm run backend
```

## Render

Current frontend static site settings:

- Build command: `npm ci && npm run build`
- Publish directory: `build`
- Rewrite rule: `/*` to `/index.html`

The included `render.yaml` records the same static site setup for future Render blueprints.

When the backend is deployed as a Render Web Service, use:

- Build command: `npm ci && npm run build`
- Start command: `npm run backend`
