import React from "react";

const LiveSplash: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[420px,1fr] lg:items-start">
          <div className="space-y-8">
            <header className="space-y-3">
              <p className="text-sm font-medium tracking-[0.2em] uppercase text-slate-400">
                Lumen Appointments
              </p>
              <h1 className="text-2xl font-semibold text-slate-50 sm:text-3xl">
                Seasonal Clinical Appointment System Summer
              </h1>
              <p className="text-sm font-medium text-slate-200 sm:text-base">
                Enter your role path into coordination.
              </p>
              <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                A soft prototype workspace for clinical queues, patient
                reassurance, administrative oversight, route protection, and
                timed sessions.
              </p>
            </header>

            <div className="space-y-4">
              <section className="group rounded-3xl border border-white/15 bg-white/5 px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.65)] backdrop-blur-xl transition hover:border-emerald-300/60 hover:bg-emerald-950/40 sm:px-7 sm:py-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                      Active demo pathway
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-50 sm:text-lg">
                      Clinician
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-emerald-500/40 bg-emerald-900/50 px-3 py-1 text-xs font-medium text-emerald-200">
                    Clinical queue
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-200 sm:text-sm">
                  Access the clinical queue, handoff pathway, and structured
                  notes that support safe, timely care.
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-300 sm:text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">Email</span>
                    <span className="break-all font-mono text-[0.7rem] sm:text-xs">
                      clinician@lumenappointments.local
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">
                      Password
                    </span>
                    <span className="font-mono text-[0.7rem] sm:text-xs">
                      lumen-clinician
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">
                      Passcode
                    </span>
                    <span className="font-mono text-[0.7rem] sm:text-xs">
                      246810
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/login")}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500/90 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition group-hover:bg-emerald-300 group-hover:shadow-[0_0_0_1px_rgba(15,23,42,0.9)]"
                >
                  Enter as Clinician
                </button>
              </section>

              <section className="group rounded-3xl border border-white/15 bg-white/5 px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.65)] backdrop-blur-xl transition hover:border-sky-300/60 hover:bg-sky-950/40 sm:px-7 sm:py-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
                      Prototype view only
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-50 sm:text-lg">
                      Patient portal
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-sky-500/40 bg-sky-900/50 px-3 py-1 text-xs font-medium text-sky-200">
                    Reassurance
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-200 sm:text-sm">
                  View appointment status, reassurance messaging, and your
                  communication journey with the clinic.
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-300 sm:text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">Email</span>
                    <span className="break-all font-mono text-[0.7rem] sm:text-xs">
                      patient@lumenappointments.local
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">
                      Password
                    </span>
                    <span className="font-mono text-[0.7rem] sm:text-xs">
                      lumen-patient
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">
                      Passcode
                    </span>
                    <span className="font-mono text-[0.7rem] sm:text-xs">
                      135790
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/patient/home")}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-sky-500/90 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition group-hover:bg-sky-300 group-hover:shadow-[0_0_0_1px_rgba(15,23,42,0.9)]"
                >
                  Enter as Patient
                </button>
              </section>

              <section className="group rounded-3xl border border-white/15 bg-white/5 px-6 py-5 shadow-[0_18px_40px_rgba(15,23,42,0.65)] backdrop-blur-xl transition hover:border-amber-300/60 hover:bg-amber-950/40 sm:px-7 sm:py-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                      Prototype view only
                    </p>
                    <h2 className="mt-1 text-base font-semibold text-slate-50 sm:text-lg">
                      Admin portal
                    </h2>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-amber-500/40 bg-amber-900/50 px-3 py-1 text-xs font-medium text-amber-200">
                    Oversight
                  </span>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-200 sm:text-sm">
                  Oversee tasks, communications, and appointment movements
                  across the service to keep the system flowing.
                </p>

                <div className="mt-4 space-y-2 text-xs text-slate-300 sm:text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">Email</span>
                    <span className="break-all font-mono text-[0.7rem] sm:text-xs">
                      admin@lumenappointments.local
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">
                      Password
                    </span>
                    <span className="font-mono text-[0.7rem] sm:text-xs">
                      lumen-admin
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-200">
                      Passcode
                    </span>
                    <span className="font-mono text-[0.7rem] sm:text-xs">
                      112233
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/admin/panel")}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-amber-500/90 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-sm transition group-hover:bg-amber-300 group-hover:shadow-[0_0_0_1px_rgba(15,23,42,0.9)]"
                >
                  Enter as Admin
                </button>
              </section>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="h-full w-full rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-900/40 via-sky-900/40 to-amber-900/40 opacity-80" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveSplash;
