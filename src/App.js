import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, NavLink, Redirect, Route, Switch, useHistory, useLocation } from "react-router-dom";
import "./App.css";
import "./styles/concern.css";
import ConcernList from "./concern/ConcernList";
import NewConcern from "./concern/NewConcern";
import ClinicianQueue from "./clinician/ClinicianQueue";
import AdminDashboard from "./admin/AdminDashboard";
import JourneyStart from "./JourneyStart";
import { buildPatientScript } from "./concern/patientScript";
import initialAppointments from "./mockups/appointments.json";
import initialAvailability from "./mockups/availability.json";
import initialClinicians from "./mockups/clinicians.json";
import initialPatients from "./mockups/patients.json";
import { formatPatientStoryDate } from "./dateUtils";

const ROUTES = {
  LOGIN: "/login",
  CLINICIAN_DASHBOARD: "/clinician/dashboard",
  PATIENT_HOME: "/patient/home",
  ADMIN_PANEL: "/admin/panel",
  UNAUTHORIZED: "/unauthorized",
  LIVE_BOOKING: "/live-booking",
  PRACTICE_MODE: "/practice-mode",
  PATIENTS: "/patients",
  CLINICIANS: "/clinicians",
  AVAILABILITY: "/availability",
  SETTINGS: "/settings",
  APPOINTMENTS: "/appointments",
  JOURNEY_START: "/journey/start",
  NEW_CONCERN: "/concern/new",
  CONCERNS: "/concerns",
  CLINICIAN_QUEUE: "/clinician-queue",
  ADMINISTRATION: "/administration",
};

const getModeRoutes = (mode) => {
  const base = mode === "practice" ? ROUTES.PRACTICE_MODE : ROUTES.LIVE_BOOKING;

  return {
    base,
    patients: `${base}/patients`,
    clinicians: `${base}/clinicians`,
    admin: `${base}/admin`,
    bookingBoard: `${base}/booking-board`,
    clinicianQueue: `${base}/clinician-queue`,
    settings: `${base}/settings`,
    newConcern: `${base}/concern/new`,
    concerns: `${base}/concerns`,
  };
};

const APPOINTMENT_PATHWAY_STEPS = [
  "Registration",
  "Triage",
  "Booking",
  "Confirmation",
  "Care",
  "Follow-up",
  "Closure",
];

const EMPTY_LIVE_PATHWAY_STATUSES = APPOINTMENT_PATHWAY_STEPS.map(() => "0");

const PATIENT_SORT_STORAGE_KEY = "lumenAppointmentsPatientSort";
const DEFAULT_PATIENT_SORT = {
  by: "registration",
  order: "newest",
};

const LOGIN_STORAGE_KEY = "lumenAppointmentsSession";
const LIVE_DATA_ENDPOINT = "/api/live-booking";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const SESSION_WARNING_MS = 2 * 60 * 1000;
const ROLE_LABELS = {
  clinician: "Clinician",
  patient: "Patient",
  admin: "Admin",
};
const ROLE_TILE_COPY = {
  clinician: {
    title: "Clinician",
    description:
      "Access the clinical queue, handoff pathway, and structured notes that support safe, timely care.",
    detail: "Active demo pathway",
  },
  patient: {
    title: "Patient portal",
    description:
      "View appointment status, reassurance messaging, and your communication journey with the clinic.",
    detail: "Prototype view only",
  },
  admin: {
    title: "Admin portal",
    description:
      "Oversee tasks, communications, and appointment movements across the service to keep the system flowing.",
    detail: "Prototype view only",
  },
};
const DEMO_USERS = [
  {
    userId: "demo-clinician-123",
    name: "Dr Demo Clinician",
    email: "clinician@lumenappointments.local",
    password: "lumen-clinician",
    passcode: "246810",
    role: "clinician",
    landingRoute: ROUTES.CLINICIAN_DASHBOARD,
  },
  {
    userId: "demo-patient-456",
    name: "Pat Demo",
    email: "patient@lumenappointments.local",
    password: "lumen-patient",
    passcode: "135790",
    role: "patient",
    landingRoute: ROUTES.PATIENT_HOME,
  },
  {
    userId: "demo-admin-789",
    name: "Alex Demo Admin",
    email: "admin@lumenappointments.local",
    password: "lumen-admin",
    passcode: "112233",
    role: "admin",
    landingRoute: ROUTES.ADMIN_PANEL,
  },
];
const DEFAULT_DEMO_USER = DEMO_USERS[0];

const APP_SORT_OPTIONS = [
  { value: "nextAppointment", label: "Next Appointment" },
  { value: "registration", label: "Registration Date" },
  { value: "patientName", label: "Patient Name" },
];

const PRACTICE_LEVELS = [
  {
    id: "level-1",
    label: "1 appointment",
    appointmentCount: 1,
    summary: "Master one patient, one clinician and one booking before adding more moving parts.",
  },
  {
    id: "level-2",
    label: "2 appointments",
    appointmentCount: 2,
    summary: "Compare two patients and practise reading the board without losing the first story.",
  },
  {
    id: "level-3",
    label: "3 appointments",
    appointmentCount: 3,
    summary: "Introduce a changed appointment and practise patient communication.",
  },
  {
    id: "level-6",
    label: "6 appointments",
    appointmentCount: 6,
    summary: "Work with a fuller day: booked, changed, cancelled and confirmation tasks.",
  },
  {
    id: "full",
    label: "Full board",
    appointmentCount: null,
    summary: "Run the whole practice board with all mock concerns, slots, appointments and tasks.",
  },
];

const SEASONAL_BANNERS = {
  spring: {
    label: "Spring",
    image: "/lumenAppt-spring-banner.png",
  },
  summer: {
    label: "Summer",
    image: "/lumenAppt-summer-banner.png",
  },
  autumn: {
    label: "Autumn",
    image: "/lumenAppt-autumn-banner.png",
  },
  winter: {
    label: "Winter",
    image: "/lumenAppt-winter-banner.png",
  },
};

const getCurrentSeasonBanner = (date = new Date()) => {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) {
    return SEASONAL_BANNERS.spring;
  }

  if (month >= 5 && month <= 7) {
    return SEASONAL_BANNERS.summer;
  }

  if (month >= 8 && month <= 10) {
    return SEASONAL_BANNERS.autumn;
  }

  return SEASONAL_BANNERS.winter;
};

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const encodeMockJwt = (payload) => {
  const header = { alg: "none", typ: "JWT", demoOnly: true };
  const encodePart = (value) =>
    window.btoa(JSON.stringify(value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  return `${encodePart(header)}.${encodePart(payload)}.demo-signature`;
};

const isSessionExpired = (session) => !session?.expiresAt || Date.now() >= new Date(session.expiresAt).getTime();

const getSessionTimeRemainingMs = (session) =>
  Math.max(0, session?.expiresAt ? new Date(session.expiresAt).getTime() - Date.now() : 0);

const formatCountdown = (milliseconds) => {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const getLandingRouteForRole = (role) =>
  DEMO_USERS.find((user) => user.role === role)?.landingRoute || ROUTES.LIVE_BOOKING;

const canAccessRole = (session, allowedRoles) =>
  Boolean(session?.role && allowedRoles.includes(session.role) && !isSessionExpired(session));

const buildDemoSession = (demoUser) => {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + SESSION_TIMEOUT_MS);
  const mockToken = encodeMockJwt({
    userId: demoUser.userId,
    role: demoUser.role,
    iat: Math.floor(issuedAt.getTime() / 1000),
    exp: Math.floor(expiresAt.getTime() / 1000),
  });

  return {
    email: demoUser.email,
    name: demoUser.name,
    role: demoUser.role,
    userId: demoUser.userId,
    signedInAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    mockToken,
  };
};

const TIME_OPTIONS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
];

const EXTRA_MOCK_PATIENTS = [
  { id: "mock-patient-2", name: "James Carter", dob: "1972-11-08", contact: "07700 900102", notes: "Recent appointment changes caused confusion" },
  { id: "mock-patient-3", name: "Sophia Patel", dob: "1991-06-24", contact: "07700 900103", notes: "Prefers written confirmation" },
  { id: "mock-patient-4", name: "Liam Thompson", dob: "1965-01-17", contact: "07700 900104", notes: "Needs clear reason for visit before attending" },
  { id: "mock-patient-5", name: "Grace Wilson", dob: "1958-09-02", contact: "07700 900105", notes: "Hearing difficulty, prefers SMS follow-up" },
  { id: "mock-patient-6", name: "Noah Ahmed", dob: "2001-12-19", contact: "07700 900106", notes: "Student, limited availability after 15:00" },
  { id: "mock-patient-7", name: "Amelia Green", dob: "1989-04-05", contact: "07700 900107", notes: "Anxiety around unexplained appointment changes" },
  { id: "mock-patient-8", name: "George Evans", dob: "1947-07-30", contact: "07700 900108", notes: "Requires carer to attend" },
  { id: "mock-patient-9", name: "Maya Robinson", dob: "1996-02-14", contact: "07700 900109", notes: "Uses patient portal regularly" },
  { id: "mock-patient-10", name: "Henry Clarke", dob: "1979-10-22", contact: "07700 900110", notes: "Works shifts, needs exact confirmed time" },
  { id: "mock-patient-11", name: "Isla Morgan", dob: "2015-05-11", contact: "07700 900111", notes: "Parent contact required" },
  { id: "mock-patient-12", name: "Arthur Price", dob: "1939-03-18", contact: "07700 900112", notes: "Medication list reviewed by daughter" },
];

const EXTRA_MOCK_CLINICIANS = [
  { id: "mock-clinician-2", name: "Dr Ravi Singh", role: "Clinician", specialty: "General appointment clinic", contact: "07700 910201", registrationId: "2345678" },
  { id: "mock-clinician-3", name: "Dr Emily Rhodes", role: "Clinician", specialty: "Clinical review clinic", contact: "07700 910202", registrationId: "3456789" },
  { id: "mock-clinician-4", name: "Nurse Hannah Lee", role: "Nurse", specialty: "Nurse-led appointments", contact: "07700 910203", registrationId: "CD123456" },
  { id: "mock-clinician-5", name: "Dr Marcus Hale", role: "Clinician", specialty: "General appointment clinic", contact: "07700 910204", registrationId: "4567890" },
  { id: "mock-clinician-6", name: "Priya Nair", role: "Pharmacist", specialty: "Medication support", contact: "07700 910205", registrationId: "EF123456" },
  { id: "mock-clinician-7", name: "Dr Laura Chen", role: "Clinician", specialty: "General appointment clinic", contact: "07700 910206", registrationId: "5678901" },
];

const INITIAL_MOCK_CONCERNS = [
  {
    id: "concern-demo-1",
    patientId: "p1a9c2d3",
    description: "Persistent cough",
    patientMessage: "The request is recorded as Persistent cough. Staff can confirm the recorded reason and explain that the appropriate clinician will review it before any advice or plan is given.",
    confirmedTime: "Not confirmed yet",
    confirmationMethod: "Not confirmed",
    trigger: "phone",
    status: "Awaiting Review",
    triage: {
      urgency: "Not triaged",
      route: "Not assigned",
      timeframe: "Not set",
      redFlagCheck: "Not recorded",
      note: "Awaiting authorised review.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
  {
    id: "concern-demo-2",
    patientId: "mock-patient-2",
    description: "Chest discomfort",
    patientMessage: "The request is recorded as Chest discomfort. Staff can confirm the recorded reason, current appointment time, and that clinical staff will review the concern.",
    confirmedTime: "11:30 AM",
    confirmationMethod: "Phone",
    trigger: "phone",
    status: "Ready for Triage",
    triage: {
      urgency: "Same day",
      route: "Clinical review clinic",
      timeframe: "Today",
      redFlagCheck: "Recorded for clinician check",
      note: "Administrative record flags this for clinician triage; no clinical advice has been added.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
  {
    id: "concern-demo-3",
    patientId: "mock-patient-3",
    description: "Medication query",
    patientMessage: "The request is recorded as Medication query. Staff can confirm this is about medication information and that a suitable staff member will review the record.",
    confirmedTime: "09:30 AM",
    confirmationMethod: "Letter",
    trigger: "email",
    status: "Appointment Required",
    triage: {
      urgency: "Routine",
      route: "Medication support",
      timeframe: "Next available routine slot",
      redFlagCheck: "No red flag note recorded",
      note: "Medication query needs an appropriate reviewer before any medication information is confirmed.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
  {
    id: "concern-demo-4",
    patientId: "mock-patient-4",
    description: "Shortness of breath",
    patientMessage: "The request is recorded as Shortness of breath. Staff can confirm the recorded reason and make sure the concern is seen by clinical staff for review.",
    confirmedTime: "Not confirmed yet",
    confirmationMethod: "Portal",
    trigger: "portal",
    status: "Needs Information",
    triage: {
      urgency: "Not triaged",
      route: "Not assigned",
      timeframe: "Not set",
      redFlagCheck: "More information needed",
      note: "More information is needed before this can be safely routed.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
  {
    id: "concern-demo-5",
    patientId: "mock-patient-5",
    description: "Blood pressure follow-up",
    patientMessage: "The request is recorded as Blood pressure follow-up. Staff can confirm the recorded reason and the current appointment or review status.",
    confirmedTime: "10:30 AM",
    confirmationMethod: "SMS",
    trigger: "sms",
    status: "Triaged",
    triage: {
      urgency: "Routine",
      route: "Nurse-led appointments",
      timeframe: "Within 2 weeks",
      redFlagCheck: "No red flag note recorded",
      note: "Routed for routine appointment handling.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
  {
    id: "concern-demo-6",
    patientId: "mock-patient-6",
    description: "Low mood",
    patientMessage: "The request is recorded as Low mood. Staff can confirm the recorded reason and that the concern is being handled through the care journey.",
    confirmedTime: "15:30 PM",
    confirmationMethod: "Email",
    trigger: "email",
    status: "Treatment",
    triage: {
      urgency: "Soon",
      route: "Clinical review clinic",
      timeframe: "Treatment stage",
      redFlagCheck: "No red flag note recorded",
      note: "Treatment step is active; staff should keep patient-facing wording factual and recorded.",
    },
    matchedSlotId: "availability-demo-8",
    appointmentId: "appt-demo-3",
  },
  {
    id: "concern-demo-7",
    patientId: "mock-patient-7",
    description: "Appointment time confusion",
    patientMessage: "The current recorded time is 11:30 AM. This record exists to confirm the correct time and reduce confusion from earlier changes.",
    confirmedTime: "11:30 AM",
    confirmationMethod: "Phone",
    trigger: "phone",
    status: "Awaiting Review",
    triage: {
      urgency: "Administrative clarification",
      route: "Booking team",
      timeframe: "Before appointment",
      redFlagCheck: "Not applicable",
      note: "Primary need is to confirm the correct recorded appointment time.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
  {
    id: "concern-demo-8",
    patientId: "mock-patient-8",
    description: "Pain in lower back",
    patientMessage: "The request is recorded as Pain in lower back. Staff can confirm the recorded reason and current status without giving clinical advice.",
    confirmedTime: "14:00 PM",
    confirmationMethod: "Letter",
    trigger: "walk-in",
    status: "Ready for Triage",
    triage: {
      urgency: "Routine",
      route: "General appointment clinic",
      timeframe: "Next available routine slot",
      redFlagCheck: "No red flag note recorded",
      note: "Ready for authorised triage to confirm route and appointment need.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
  {
    id: "concern-demo-9",
    patientId: "mock-patient-9",
    description: "Test result query",
    patientMessage: "The request is recorded as Test result query. Staff can confirm this is about test results and that the result discussion needs an appropriate reviewer.",
    confirmedTime: "Not confirmed yet",
    confirmationMethod: "Not confirmed",
    trigger: "portal",
    status: "Appointment Required",
    triage: {
      urgency: "Routine",
      route: "Clinical review clinic",
      timeframe: "Next available routine slot",
      redFlagCheck: "No red flag note recorded",
      note: "Needs an appointment with an appropriate reviewer for recorded test result query.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
  {
    id: "concern-demo-10",
    patientId: "mock-patient-10",
    description: "Medication query",
    patientMessage: "The request is recorded as Medication query. Staff can confirm the recorded reason and that medication details should be checked by an appropriate staff member.",
    confirmedTime: "16:00 PM",
    confirmationMethod: "SMS",
    trigger: "phone",
    status: "Follow-up",
    triage: {
      urgency: "Routine",
      route: "Medication support",
      timeframe: "Follow-up pending",
      redFlagCheck: "No red flag note recorded",
      note: "Follow-up stage is active before final closure.",
    },
    matchedSlotId: "",
    appointmentId: "",
  },
];

const INITIAL_MOCK_AVAILABILITY = [
  ...initialAvailability,
  {
    id: "availability-demo-2",
    clinicianId: "mock-clinician-2",
    date: getTodayIsoDate(),
    startTime: "09:30",
    endTime: "10:00",
    status: "Booked",
  },
  {
    id: "availability-demo-3",
    clinicianId: "mock-clinician-2",
    date: getTodayIsoDate(),
    startTime: "11:00",
    endTime: "11:30",
    status: "Available",
  },
  {
    id: "availability-demo-4",
    clinicianId: "mock-clinician-3",
    date: getTodayIsoDate(),
    startTime: "11:30",
    endTime: "12:00",
    status: "Available",
  },
  {
    id: "availability-demo-5",
    clinicianId: "mock-clinician-4",
    date: getTodayIsoDate(),
    startTime: "10:00",
    endTime: "10:30",
    status: "Available",
  },
  {
    id: "availability-demo-6",
    clinicianId: "mock-clinician-5",
    date: getTodayIsoDate(),
    startTime: "10:30",
    endTime: "11:00",
    status: "Available",
  },
  {
    id: "availability-demo-7",
    clinicianId: "mock-clinician-6",
    date: getTodayIsoDate(),
    startTime: "14:00",
    endTime: "14:30",
    status: "Unavailable",
  },
  {
    id: "availability-demo-8",
    clinicianId: "mock-clinician-3",
    date: getTodayIsoDate(),
    startTime: "15:30",
    endTime: "16:00",
    status: "Booked",
  },
  {
    id: "availability-demo-9",
    clinicianId: "mock-clinician-7",
    date: getTodayIsoDate(),
    startTime: "16:00",
    endTime: "16:30",
    status: "Available",
  },
  {
    id: "availability-demo-10",
    clinicianId: "mock-clinician-5",
    date: getTodayIsoDate(),
    startTime: "16:30",
    endTime: "17:00",
    status: "Available",
  },
];

const INITIAL_MOCK_APPOINTMENTS = [
  ...initialAppointments,
  {
    id: "appt-demo-2",
    patientId: "mock-patient-2",
    clinicianId: "mock-clinician-2",
    date: getTodayIsoDate(),
    time: "09:30",
    reason: "Chest discomfort follow-up",
    patientMessage: "The request is recorded as Chest discomfort. Staff can confirm the recorded reason, current appointment time, and that clinical staff will review the concern.",
    confirmationMethod: "Phone",
    status: "Changed",
    previousTime: "11:00",
  },
  {
    id: "appt-demo-3",
    patientId: "mock-patient-6",
    clinicianId: "mock-clinician-3",
    date: getTodayIsoDate(),
    time: "15:30",
    reason: "Low mood review",
    patientMessage: "The request is recorded as Low mood. Staff can confirm the recorded reason and that the concern is being handled through the care journey.",
    confirmationMethod: "Email",
    status: "Booked",
  },
  {
    id: "appt-demo-4",
    patientId: "mock-patient-7",
    clinicianId: "mock-clinician-5",
    date: getTodayIsoDate(),
    time: "11:00",
    reason: "Appointment time clarification",
    patientMessage: "The appointment was cancelled and the patient needs clear confirmation of the current plan.",
    confirmationMethod: "Phone",
    status: "Cancelled",
  },
];

const EXTRA_PRACTICE_APPOINTMENTS = [
  {
    id: "appt-demo-5",
    patientId: "mock-patient-3",
    clinicianId: "mock-clinician-4",
    date: getTodayIsoDate(),
    time: "13:30",
    reason: "Medication query follow-up",
    patientMessage: "The request is recorded as Medication query. Staff can confirm the recorded reason and appointment status.",
    confirmationMethod: "Portal",
    status: "Booked",
  },
  {
    id: "appt-demo-6",
    patientId: "mock-patient-4",
    clinicianId: "mock-clinician-7",
    date: getTodayIsoDate(),
    time: "16:00",
    reason: "Shortness of breath review",
    patientMessage: "The request is recorded as Shortness of breath. Staff can confirm the recorded reason and route to clinical review.",
    confirmationMethod: "SMS",
    status: "Booked",
    patientCommunicationNeeded: true,
  },
];

const ALL_PRACTICE_APPOINTMENTS = [...INITIAL_MOCK_APPOINTMENTS, ...EXTRA_PRACTICE_APPOINTMENTS];

const getLaterTimeOptions = (time) => {
  const timeIndex = TIME_OPTIONS.indexOf(time);
  return TIME_OPTIONS.slice(timeIndex + 1);
};

const formatUkDate = (isoDate) => {
  if (!isoDate) {
    return "Date not set";
  }

  const [year, month, day] = isoDate.split("-");
  return year && month && day ? `${day}/${month}/${year}` : isoDate;
};

const formatPatientRegisteredDate = (value) => formatPatientStoryDate(value);

const buildInitialConcernNotes = (concern) => [
  {
    id: `${concern.id}-patient-concern-note`,
    type: "Patient concern",
    text: concern.description || "Concern recorded",
    author: "Care Navigation Team",
    visibility: "Internal",
    createdAt: concern.createdAt || new Date().toISOString(),
  },
  {
    id: `${concern.id}-admin-note`,
    type: "Administrative",
    text: concern.triage?.note || concern.patientMessage || "Administrative context recorded.",
    author: "Care Navigation Team",
    visibility: "Internal",
    createdAt: concern.createdAt || new Date().toISOString(),
  },
];

const buildInitialAppointmentNotes = (appointment) => [
  {
    id: `${appointment.id}-appointment-note`,
    type: "Administrative",
    text: appointment.reason || "Appointment record created.",
    author: "Care Navigation Team",
    visibility: "Internal",
    createdAt: appointment.createdAt || new Date().toISOString(),
  },
];

const addRegistrationDates = (patientList) =>
  patientList.map((patient, index) => {
    if (patient.registeredAt) {
      return patient;
    }

    const registeredAt = new Date(Date.UTC(2026, 6, 30 + index)).toISOString().slice(0, 10);
    return { ...patient, registeredAt };
  });

const INITIAL_PATIENTS = addRegistrationDates([...initialPatients, ...EXTRA_MOCK_PATIENTS]);
const getPracticeLevel = (levelId) =>
  PRACTICE_LEVELS.find((level) => level.id === levelId) || PRACTICE_LEVELS[0];

const syncAvailabilityWithAppointments = (availability, appointments) =>
  availability.map((slot) => {
    const isBooked = appointments.some(
      (appointment) =>
        appointment.date === slot.date && appointment.time === getSlotStartTime(slot)
    );

    return isBooked ? { ...slot, status: "Booked" } : slot;
  });

const buildPracticeScenario = (levelId) => {
  const level = getPracticeLevel(levelId);

  if (level.id === "full") {
    return {
      patients: INITIAL_PATIENTS,
      clinicians: [...initialClinicians, ...EXTRA_MOCK_CLINICIANS],
      availability: syncAvailabilityWithAppointments(INITIAL_MOCK_AVAILABILITY, ALL_PRACTICE_APPOINTMENTS),
      appointments: ALL_PRACTICE_APPOINTMENTS,
      concerns: INITIAL_MOCK_CONCERNS,
    };
  }

  const appointments = ALL_PRACTICE_APPOINTMENTS.slice(0, level.appointmentCount);
  const appointmentPatientIds = new Set(appointments.map((appointment) => appointment.patientId));
  const appointmentClinicianIds = new Set(appointments.map((appointment) => appointment.clinicianId));
  const concerns = INITIAL_MOCK_CONCERNS
    .filter((concern) => appointmentPatientIds.has(concern.patientId))
    .slice(0, level.appointmentCount);

  return {
    patients: INITIAL_PATIENTS.filter((patient) => appointmentPatientIds.has(patient.id)),
    clinicians: [...initialClinicians, ...EXTRA_MOCK_CLINICIANS].filter((clinician) =>
      appointmentClinicianIds.has(clinician.id)
    ),
    availability: syncAvailabilityWithAppointments(
      INITIAL_MOCK_AVAILABILITY.filter(
        (slot) =>
          appointmentClinicianIds.has(slot.clinicianId) ||
          appointments.some((appointment) => appointment.date === slot.date && appointment.time === getSlotStartTime(slot))
      ),
      appointments
    ),
    appointments,
    concerns,
  };
};

function App() {
  const history = useHistory();
  const location = useLocation();
  const currentSeasonBanner = getCurrentSeasonBanner();
  const [session, setSession] = useState(() => {
    try {
      const savedSession = window.localStorage.getItem(LOGIN_STORAGE_KEY);
      const parsedSession = savedSession ? JSON.parse(savedSession) : null;

      if (isSessionExpired(parsedSession)) {
        window.localStorage.removeItem(LOGIN_STORAGE_KEY);
        return null;
      }

      return parsedSession;
    } catch (error) {
      return null;
    }
  });
  const [practiceLevelId, setPracticeLevelId] = useState("level-1");
  const initialPracticeScenario = useMemo(() => buildPracticeScenario("level-1"), []);
  const [patients, setPatients] = useState(initialPracticeScenario.patients);
  const [clinicians, setClinicians] = useState(initialPracticeScenario.clinicians);
  const [availability, setAvailability] = useState(initialPracticeScenario.availability);
  const [appointments, setAppointments] = useState(initialPracticeScenario.appointments);
  const [concerns, setConcerns] = useState(initialPracticeScenario.concerns);
  const [livePatients, setLivePatients] = useState([]);
  const [liveClinicians, setLiveClinicians] = useState([]);
  const [liveAvailability, setLiveAvailability] = useState([]);
  const [liveAppointments, setLiveAppointments] = useState([]);
  const [liveConcerns, setLiveConcerns] = useState([]);
  const [liveDataStatus, setLiveDataStatus] = useState("loading");
  const [appSortBy, setAppSortBy] = useState("nextAppointment");
  const [cheatSheetsOpen, setCheatSheetsOpen] = useState(false);
  const [pendingModeSwitch, setPendingModeSwitch] = useState(null);
  const [modeSwitchLoading, setModeSwitchLoading] = useState(null);
  const [sessionTimeRemainingMs, setSessionTimeRemainingMs] = useState(() => getSessionTimeRemainingMs(session));
  const [journeyFocusPatientId, setJourneyFocusPatientId] = useState(null);
  const [activityLog, setActivityLog] = useState([
    {
      id: "practice-log-start",
      at: new Date().toISOString(),
      text: "Practice Level 1 loaded: master one appointment from registration to confirmation.",
    },
  ]);

  const patientLookup = useMemo(
    () => Object.fromEntries(patients.map((patient) => [patient.id, patient])),
    [patients]
  );
  const clinicianLookup = useMemo(
    () => Object.fromEntries(clinicians.map((clinician) => [clinician.id, clinician])),
    [clinicians]
  );
  const concernListItems = useMemo(
    () =>
      concerns.map((concern) => ({
        ...concern,
        patientName: patientLookup[concern.patientId]?.name || concern.patientId,
        patientRegisteredAt: patientLookup[concern.patientId]?.registeredAt,
        notes: concern.notes || buildInitialConcernNotes(concern),
      })),
    [concerns, patientLookup]
  );
  const appointmentListItems = useMemo(
    () =>
      appointments.map((appointment) => ({
        ...appointment,
        patientName: patientLookup[appointment.patientId]?.name || appointment.patientId,
        patientRegisteredAt: patientLookup[appointment.patientId]?.registeredAt,
        notes: appointment.notes || buildInitialAppointmentNotes(appointment),
      })),
    [appointments, patientLookup]
  );
  const livePatientLookup = useMemo(
    () => Object.fromEntries(livePatients.map((patient) => [patient.id, patient])),
    [livePatients]
  );
  const liveClinicianLookup = useMemo(
    () => Object.fromEntries(liveClinicians.map((clinician) => [clinician.id, clinician])),
    [liveClinicians]
  );
  const liveConcernListItems = useMemo(
    () =>
      liveConcerns.map((concern) => ({
        ...concern,
        patientName: livePatientLookup[concern.patientId]?.name || concern.patientId,
        patientRegisteredAt: livePatientLookup[concern.patientId]?.registeredAt,
        notes: concern.notes || buildInitialConcernNotes(concern),
      })),
    [liveConcerns, livePatientLookup]
  );
  const liveAppointmentListItems = useMemo(
    () =>
      liveAppointments.map((appointment) => ({
        ...appointment,
        patientName: livePatientLookup[appointment.patientId]?.name || appointment.patientId,
        patientRegisteredAt: livePatientLookup[appointment.patientId]?.registeredAt,
        notes: appointment.notes || buildInitialAppointmentNotes(appointment),
      })),
    [liveAppointments, livePatientLookup]
  );
  const livePathwayStatuses = useMemo(() => {
    if (liveDataStatus !== "connected") {
      return EMPTY_LIVE_PATHWAY_STATUSES;
    }

    const triageCount = liveConcerns.filter((concern) =>
      ["Awaiting Review", "Needs Information", "Ready for Triage", "Triaged"].includes(concern.status)
    ).length;
    const confirmationCount = liveAppointments.filter(
      (appointment) =>
        appointment.patientCommunicationNeeded || appointment.communication?.confirmationOutstanding
    ).length;
    const careCount = liveConcerns.filter((concern) => concern.status === "Treatment").length;
    const followUpCount = liveConcerns.filter((concern) => concern.status === "Follow-up").length;
    const closureCount = liveConcerns.filter((concern) => concern.status === "Closed").length;

    return [
      String(livePatients.length),
      String(triageCount),
      String(liveAppointments.length),
      String(confirmationCount),
      String(careCount),
      String(followUpCount),
      String(closureCount),
    ];
  }, [liveAppointments, liveConcerns, liveDataStatus, livePatients]);
  const headerRegisteredAt = useMemo(() => {
    const registeredPatients = patients
      .filter((patient) => patient.registeredAt)
      .sort((first, second) => second.registeredAt.localeCompare(first.registeredAt));

    return registeredPatients[0]?.registeredAt;
  }, [patients]);
  const liveHeaderRegisteredAt = useMemo(() => {
    const registeredPatients = livePatients
      .filter((patient) => patient.registeredAt)
      .sort((first, second) => second.registeredAt.localeCompare(first.registeredAt));

    return registeredPatients[0]?.registeredAt;
  }, [livePatients]);
  const activeRoleCheatSheet = getActiveRoleCheatSheet(location.pathname);
  const activeMode = location.pathname.startsWith(ROUTES.PRACTICE_MODE) ? "practice" : "live";
  const activeModeRoutes = getModeRoutes(activeMode);
  const activeRegisteredAt = activeMode === "practice" ? headerRegisteredAt : liveHeaderRegisteredAt;

  const requestModeSwitch = (event, targetMode, targetRoute) => {
    if (targetMode === activeMode) {
      return;
    }

    if (event) {
      event.preventDefault();
    }

    setPendingModeSwitch({
      targetMode,
      targetRoute: targetRoute || getModeRoutes(targetMode).base,
    });
  };

  const stayInCurrentMode = () => {
    setPendingModeSwitch(null);
    setModeSwitchLoading(null);
  };

  const continueModeSwitch = () => {
    if (!pendingModeSwitch) {
      return;
    }

    const switchRequest = pendingModeSwitch;
    setPendingModeSwitch(null);
    setModeSwitchLoading(switchRequest);

    window.setTimeout(() => {
      setModeSwitchLoading(null);
      history.push(switchRequest.targetRoute);
    }, 950);
  };

  useEffect(() => {
    let cancelled = false;

    const loadLiveData = async () => {
      setLiveDataStatus("loading");

      try {
        const response = await fetch(LIVE_DATA_ENDPOINT, {
          headers: { Accept: "application/json" },
        });
        const contentType = response.headers.get("content-type") || "";

        if (!response.ok || !contentType.includes("application/json")) {
          throw new Error("Live data endpoint is not connected.");
        }

        const data = await response.json();

        if (cancelled) {
          return;
        }

        setLivePatients(Array.isArray(data.patients) ? data.patients : []);
        setLiveClinicians(Array.isArray(data.clinicians) ? data.clinicians : []);
        setLiveAvailability(Array.isArray(data.availability) ? data.availability : []);
        setLiveAppointments(Array.isArray(data.appointments) ? data.appointments : []);
        setLiveConcerns(Array.isArray(data.concerns) ? data.concerns : []);
        setLiveDataStatus("connected");
      } catch (error) {
        if (!cancelled) {
          setLivePatients([]);
          setLiveClinicians([]);
          setLiveAvailability([]);
          setLiveAppointments([]);
          setLiveConcerns([]);
          setLiveDataStatus("not-connected");
        }
      }
    };

    loadLiveData();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogin = (credentials) => {
    const normalisedEmail = credentials.email.trim().toLowerCase();
    const demoUser = DEMO_USERS.find((user) => user.email === normalisedEmail);

    if (
      !demoUser ||
      credentials.password !== demoUser.password ||
      credentials.passcode !== demoUser.passcode
    ) {
      return "Use one of the demo identities and passcodes shown on this screen.";
    }

    const nextSession = buildDemoSession(demoUser);

    setSession(nextSession);

    try {
      // Prototype convenience only. Production auth should use an HTTP-only secure cookie.
      window.localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(nextSession));
    } catch (error) {
      // The prototype still works for this browser session when storage is unavailable.
    }

    history.push(demoUser.landingRoute);

    return "";
  };

  const switchDemoRole = (role) => {
    const demoUser = DEMO_USERS.find((user) => user.role === role);

    if (!demoUser) {
      return;
    }

    const nextSession = buildDemoSession(demoUser);
    setSession(nextSession);
    setSessionTimeRemainingMs(getSessionTimeRemainingMs(nextSession));

    try {
      window.localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(nextSession));
    } catch (error) {
      // Role switching still works in memory if storage is unavailable.
    }

    history.push(demoUser.landingRoute);
  };

  const handleLogout = useCallback(() => {
    setSession(null);

    try {
      window.localStorage.removeItem(LOGIN_STORAGE_KEY);
    } catch (error) {
      // Nothing else is needed for the local prototype session.
    }

    history.push(ROUTES.LOGIN);
  }, [history]);

  const extendSession = () => {
    if (!session) {
      return;
    }

    const extendedSession = {
      ...session,
      expiresAt: new Date(Date.now() + SESSION_TIMEOUT_MS).toISOString(),
    };

    setSession(extendedSession);
    setSessionTimeRemainingMs(getSessionTimeRemainingMs(extendedSession));

    try {
      window.localStorage.setItem(LOGIN_STORAGE_KEY, JSON.stringify(extendedSession));
    } catch (error) {
      // The renewed mock session still works in memory if storage is unavailable.
    }
  };

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    setSessionTimeRemainingMs(getSessionTimeRemainingMs(session));

    if (isSessionExpired(session)) {
      handleLogout();
      return undefined;
    }

    const timeoutMs = Math.max(0, new Date(session.expiresAt).getTime() - Date.now());
    const sessionTimer = window.setTimeout(handleLogout, timeoutMs);

    return () => window.clearTimeout(sessionTimer);
  }, [handleLogout, session]);

  useEffect(() => {
    if (!session) {
      setSessionTimeRemainingMs(0);
      return undefined;
    }

    const countdownTimer = window.setInterval(() => {
      setSessionTimeRemainingMs(getSessionTimeRemainingMs(session));
    }, 1000);

    return () => window.clearInterval(countdownTimer);
  }, [session]);

  const updateConcernJourney = (id, changes) => {
    setConcerns((currentConcerns) =>
      currentConcerns.map((concern) =>
        concern.id === id ? { ...concern, ...changes } : concern
      )
    );
    recordPracticeEvent(`Concern ${id} updated.`);
  };

  const updateAppointmentMovement = (id, changes) => {
    setAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, ...changes } : appointment
      )
    );
    recordPracticeEvent(`Appointment ${id} updated.`);
  };

  const recordPracticeEvent = (text) => {
    setActivityLog((currentLog) => [
      { id: makeId("log"), at: new Date().toISOString(), text },
      ...currentLog,
    ].slice(0, 12));
  };

  const loadPracticeLevel = (levelId, reason = "loaded") => {
    const level = getPracticeLevel(levelId);
    const scenario = buildPracticeScenario(level.id);

    setPracticeLevelId(level.id);
    setPatients(scenario.patients);
    setClinicians(scenario.clinicians);
    setAvailability(scenario.availability);
    setAppointments(scenario.appointments);
    setConcerns(scenario.concerns);
    setActivityLog([
      {
        id: makeId("log"),
        at: new Date().toISOString(),
        text: `${level.label} ${reason}: ${level.summary}`,
      },
    ]);
  };

  const resetPracticeBoard = () => {
    setJourneyFocusPatientId(null);
    loadPracticeLevel(practiceLevelId, "reset");
  };

  const changePracticeLevel = (levelId) => {
    setJourneyFocusPatientId(null);
    loadPracticeLevel(levelId, "loaded");
  };

  const startPracticeJourneyForPatient = (patient, reason = "selected") => {
    const existingConcern = concerns.find(
      (concern) => concern.patientId === patient.id && concern.status !== "Closed"
    );

    setJourneyFocusPatientId(patient.id);

    if (existingConcern) {
      setConcerns((currentConcerns) =>
        currentConcerns.map((concern) => ({
          ...concern,
          isSpotlightJourney: concern.id === existingConcern.id,
        }))
      );
      recordPracticeEvent(`${patient.name} selected as the active mock patient journey.`);
      history.push(getModeRoutes("practice").concerns);
      return;
    }

    const concernId = makeId("spotlight-concern");
    const registeredAt = patient.registeredAt || new Date().toISOString();
    const concern = {
      id: concernId,
      patientId: patient.id,
      patientName: patient.name,
      description: patient.notes || "New patient appointment request",
      patientMessage:
        `The request is recorded for ${patient.name}. Staff can confirm the recorded reason and that the care team will follow the next step.`,
      confirmedTime: "Not confirmed yet",
      confirmationMethod: "Not confirmed",
      trigger: "phone",
      status: "Awaiting Review",
      isSpotlightJourney: true,
      patientContactStatus: "Patient communication not yet recorded",
      clinicianStep: "Today's care queue",
      triage: {
        urgency: "Not triaged",
        route: "Not assigned",
        timeframe: "Not set",
        redFlagCheck: "Not recorded",
        note: "New mock patient awaiting authorised review.",
      },
      communication: {
        patientInformed: false,
        by: "",
        channel: "Phone",
        at: "",
        confirmationOutstanding: true,
      },
      matchedSlotId: "",
      appointmentId: "",
      createdAt: registeredAt,
    };

    setConcerns((currentConcerns) => [
      { ...concern, notes: buildInitialConcernNotes(concern) },
      ...currentConcerns.map((item) => ({ ...item, isSpotlightJourney: false })),
    ]);
    recordPracticeEvent(`${patient.name} ${reason} as a mock patient journey. Press Run Next Practice Step to follow the pathway.`);
    history.push(getModeRoutes("practice").concerns);
  };

  const createMockPatientJourney = () => {
    const patient = {
      id: makeId("spotlight-patient"),
      name: "New Mock Patient",
      dob: "1984-04-18",
      contact: "07700 900555",
      notes: "New mock patient created from the guided journey.",
      registeredAt: new Date().toISOString(),
    };

    setPatients((currentPatients) => [patient, ...currentPatients]);
    startPracticeJourneyForPatient(patient, "added");
  };

  const matchConcernJourneyToSlot = (concern) => {
    const today = getTodayIsoDate();
    const matchedSlot = availability
      .filter((slot) => slot.date === today && slot.status === "Available")
      .sort((first, second) => getSlotStartTime(first).localeCompare(getSlotStartTime(second)))
      .find(
        (slot) =>
          !concerns.some((other) => other.id !== concern.id && other.matchedSlotId === slot.id)
      );

    if (!matchedSlot) {
      updateConcernJourney(concern.id, { status: "Needs Information", matchedSlotId: "" });
      return;
    }

    const appointment = {
      id: makeId("appt"),
      patientId: concern.patientId,
      clinicianId: matchedSlot.clinicianId,
      date: matchedSlot.date,
      time: getSlotStartTime(matchedSlot),
      reason: concern.description,
      patientMessage: concern.patientMessage,
      staffScript: concern.staffScript,
      confirmationMethod: "System matched slot",
      patientCommunicationNeeded: true,
      communication: {
        patientInformed: false,
        by: "",
        channel: "System matched slot",
        at: "",
        confirmationOutstanding: true,
      },
      notes: [
        {
          id: makeId("note"),
          type: "Administrative",
          text: `Matched to ${getSlotStartTime(matchedSlot)} slot for ${concern.description}.`,
          author: "Care Navigation Team",
          visibility: "Internal",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setAppointments((currentAppointments) => [...currentAppointments, appointment]);
    setAvailability((currentAvailability) =>
      currentAvailability.map((slot) =>
        slot.id === matchedSlot.id ? { ...slot, status: "Booked" } : slot
      )
    );
    updateConcernJourney(concern.id, {
      status: "Appointment Booked",
      matchedSlotId: matchedSlot.id,
      appointmentId: appointment.id,
    });
  };

  const confirmConcernJourney = (concern) => {
    const matchedSlot = availability.find((slot) => slot.id === concern.matchedSlotId);

    if (!matchedSlot) {
      updateConcernJourney(concern.id, { status: "Appointment Required" });
      return;
    }

    const appointment = {
      id: makeId("appt"),
      patientId: concern.patientId,
      clinicianId: matchedSlot.clinicianId,
      date: matchedSlot.date,
      time: getSlotStartTime(matchedSlot),
      reason: concern.description,
      patientMessage: concern.patientMessage,
      staffScript: concern.staffScript,
      confirmationMethod: "System matched slot",
      patientCommunicationNeeded: true,
      communication: {
        patientInformed: false,
        by: "",
        channel: "System matched slot",
        at: "",
        confirmationOutstanding: true,
      },
      notes: [
        {
          id: makeId("note"),
          type: "Administrative",
          text: `Confirmed matched slot at ${getSlotStartTime(matchedSlot)} for ${concern.description}.`,
          author: "Care Navigation Team",
          visibility: "Internal",
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setAppointments((currentAppointments) => [...currentAppointments, appointment]);
    setAvailability((currentAvailability) =>
      currentAvailability.map((slot) =>
        slot.id === matchedSlot.id ? { ...slot, status: "Booked" } : slot
      )
    );
    updateConcernJourney(concern.id, { status: "Appointment Booked", appointmentId: appointment.id });
  };

  const advanceConcernJourney = (id, action, targetStatus) => {
    const concern = concerns.find((item) => item.id === id);

    if (!concern) {
      return;
    }

    switch (action) {
      case "set-status":
        updateConcernJourney(id, { status: targetStatus });
        break;
      case "triage":
        updateConcernJourney(id, { status: "Ready for Triage" });
        break;
      case "review":
        updateConcernJourney(id, { status: "Triaged" });
        break;
      case "assign":
        updateConcernJourney(id, { status: "Appointment Required" });
        break;
      case "match":
        matchConcernJourneyToSlot(concern);
        break;
      case "accept":
        updateConcernJourney(id, { status: "Appointment Booked" });
        break;
      case "confirm":
        confirmConcernJourney(concern);
        break;
      case "treatment":
        updateConcernJourney(id, { status: "Treatment" });
        break;
      case "follow-up":
        updateConcernJourney(id, { status: "Follow-up" });
        break;
      case "close":
        updateConcernJourney(id, { status: "Closed" });
        break;
      default:
        break;
    }
  };

  const runNextPracticeStep = () => {
    const findJourneyConcern = (predicate) =>
      concerns.find((concern) => concern.patientId === journeyFocusPatientId && predicate(concern)) ||
      concerns.find((concern) => concern.isSpotlightJourney && predicate(concern)) ||
      concerns.find(predicate);
    const getJourneyPatientName = (concern) =>
      patientLookup[concern.patientId]?.name || concern.patientName || concern.patientId;
    const needsInfoConcern = findJourneyConcern((concern) => concern.status === "Needs Information");

    if (needsInfoConcern) {
      updateConcernJourney(needsInfoConcern.id, {
        status: "Ready for Triage",
        clarificationStatus: "Information recorded during practice",
        patientContactStatus: "Clarification communication recorded",
      });
      recordPracticeEvent(`${getJourneyPatientName(needsInfoConcern)} moved from clarification to triage-ready.`);
      return;
    }

    const awaitingReviewConcern = findJourneyConcern((concern) => concern.status === "Awaiting Review");

    if (awaitingReviewConcern) {
      advanceConcernJourney(awaitingReviewConcern.id, "triage");
      recordPracticeEvent(`${getJourneyPatientName(awaitingReviewConcern)} reviewed by admin and marked ready for triage.`);
      return;
    }

    const readyForTriageConcern = findJourneyConcern((concern) => concern.status === "Ready for Triage");

    if (readyForTriageConcern) {
      advanceConcernJourney(readyForTriageConcern.id, "review");
      recordPracticeEvent(`${getJourneyPatientName(readyForTriageConcern)} triage review completed in practice.`);
      return;
    }

    const triagedConcern = findJourneyConcern((concern) => concern.status === "Triaged");

    if (triagedConcern) {
      advanceConcernJourney(triagedConcern.id, "assign");
      recordPracticeEvent(`${getJourneyPatientName(triagedConcern)} marked as needing an appointment.`);
      return;
    }

    const appointmentRequiredConcern = findJourneyConcern((concern) => concern.status === "Appointment Required");

    if (appointmentRequiredConcern) {
      advanceConcernJourney(appointmentRequiredConcern.id, "match");
      recordPracticeEvent(`${getJourneyPatientName(appointmentRequiredConcern)} matched to the next available slot.`);
      return;
    }

    const appointmentNeedingContact =
      appointments.find(
        (appointment) => appointment.patientId === journeyFocusPatientId && appointment.patientCommunicationNeeded
      ) ||
      appointments.find((appointment) => appointment.patientCommunicationNeeded);

    if (appointmentNeedingContact) {
      updateAppointmentMovement(appointmentNeedingContact.id, {
        patientCommunicationNeeded: false,
        adminUpdateNote: "Patient communication recorded during practice",
        communication: {
          ...appointmentNeedingContact.communication,
          patientInformed: true,
          by: "Care Navigation Team",
          channel: appointmentNeedingContact.confirmationMethod || "Phone",
          at: new Date().toISOString(),
          confirmationOutstanding: false,
        },
      });
      recordPracticeEvent(`${patientLookup[appointmentNeedingContact.patientId]?.name || appointmentNeedingContact.patientId} appointment communication recorded.`);
      return;
    }

    const bookedConcern = findJourneyConcern(
      (concern) =>
        concern.status === "Appointment Booked" &&
        concern.patientContactStatus !== "Patient communication recorded"
    );

    if (bookedConcern) {
      updateConcernJourney(bookedConcern.id, {
        patientContactStatus: "Patient communication recorded",
        communication: {
          ...bookedConcern.communication,
          patientInformed: true,
          by: "Care Navigation Team",
          channel: bookedConcern.confirmationMethod || "Phone",
          at: new Date().toISOString(),
          confirmationOutstanding: false,
        },
      });
      recordPracticeEvent(`${getJourneyPatientName(bookedConcern)} patient communication recorded.`);
      return;
    }

    const bookedReadyForTreatment = findJourneyConcern(
      (concern) =>
        concern.status === "Appointment Booked" &&
        concern.patientContactStatus === "Patient communication recorded"
    );

    if (bookedReadyForTreatment) {
      advanceConcernJourney(bookedReadyForTreatment.id, "treatment");
      recordPracticeEvent(`${getJourneyPatientName(bookedReadyForTreatment)} moved into treatment.`);
      return;
    }

    const treatmentConcern = findJourneyConcern((concern) => concern.status === "Treatment");

    if (treatmentConcern) {
      advanceConcernJourney(treatmentConcern.id, "follow-up");
      recordPracticeEvent(`${getJourneyPatientName(treatmentConcern)} moved to follow-up.`);
      return;
    }

    const followUpConcern = findJourneyConcern((concern) => concern.status === "Follow-up");

    if (followUpConcern) {
      advanceConcernJourney(followUpConcern.id, "close");
      recordPracticeEvent(`${getJourneyPatientName(followUpConcern)} journey closed.`);
      if (followUpConcern.patientId === journeyFocusPatientId) {
        setJourneyFocusPatientId(null);
      }
      return;
    }

    recordPracticeEvent("No urgent practice step is waiting. The board is stable.");
  };

  const addLiveConcern = (concern) => {
    setLiveConcerns((currentConcerns) => [
      ...currentConcerns,
      {
        ...concern,
        id: concern.id || makeId("live-concern"),
        patientId: concern.patientId || concern.patientName,
        status: concern.status || "Awaiting Review",
        patientMessage: concern.patientMessage || "Live concern recorded for authorised review.",
        confirmedTime: concern.confirmedTime || "Not confirmed yet",
        confirmationMethod: concern.confirmationMethod || "Not confirmed",
        staffScript: concern.staffScript || buildPatientScript({
          description: concern.description,
          status: concern.status || "Awaiting Review",
          confirmedTime: concern.confirmedTime || "Not confirmed yet",
          confirmationMethod: concern.confirmationMethod || "Not confirmed",
        }),
        triage: concern.triage || {
          urgency: "Not triaged",
          route: "Not assigned",
          timeframe: "Not set",
          redFlagCheck: "Not recorded",
          note: "Awaiting authorised triage.",
        },
        communication: concern.communication || {
          patientInformed: false,
          by: "",
          channel: concern.confirmationMethod || "Not confirmed",
          at: "",
          confirmationOutstanding: true,
        },
        createdAt: concern.createdAt || new Date().toISOString(),
        matchedSlotId: concern.matchedSlotId || "",
        appointmentId: concern.appointmentId || "",
      },
    ]);
  };

  const updateLiveConcern = (id, changes) => {
    setLiveConcerns((currentConcerns) =>
      currentConcerns.map((concern) =>
        concern.id === id ? { ...concern, ...changes } : concern
      )
    );
  };

  const updateLiveAppointment = (id, changes) => {
    setLiveAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === id ? { ...appointment, ...changes } : appointment
      )
    );
  };

  const addModeConcernNote = (mode, id, note) => {
    const sourceConcerns = mode === "practice" ? concerns : liveConcerns;
    const setSourceConcerns = mode === "practice" ? setConcerns : setLiveConcerns;
    const existingConcern = sourceConcerns.find((concern) => concern.id === id);
    const currentNotes = existingConcern?.notes || buildInitialConcernNotes(existingConcern || { id });

    setSourceConcerns((currentConcerns) =>
      currentConcerns.map((concern) =>
        concern.id === id
          ? {
              ...concern,
              notes: [
                {
                  ...note,
                  id: note.id || makeId("note"),
                },
                ...currentNotes,
              ],
            }
          : concern
      )
    );

    if (mode === "practice") {
      recordPracticeEvent(`${note.type} note added to mock concern ${id}.`);
    }
  };

  const addModeAppointmentNote = (mode, id, note) => {
    const sourceAppointments = mode === "practice" ? appointments : liveAppointments;
    const setSourceAppointments = mode === "practice" ? setAppointments : setLiveAppointments;
    const existingAppointment = sourceAppointments.find((appointment) => appointment.id === id);
    const currentNotes = existingAppointment?.notes || buildInitialAppointmentNotes(existingAppointment || { id });

    setSourceAppointments((currentAppointments) =>
      currentAppointments.map((appointment) =>
        appointment.id === id
          ? {
              ...appointment,
              notes: [
                {
                  ...note,
                  id: note.id || makeId("note"),
                },
                ...currentNotes,
              ],
            }
          : appointment
      )
    );

    if (mode === "practice") {
      recordPracticeEvent(`${note.type} note added to mock appointment ${id}.`);
    }
  };

  if (!session) {
    return (
      <LoginSplash
        seasonLabel={currentSeasonBanner.label}
        seasonImage={currentSeasonBanner.image}
        onLogin={handleLogin}
      />
    );
  }

  const sessionRole = session.role;
  const isPatient = sessionRole === "patient";
  const canViewAdmin = canAccessRole(session, ["admin"]);
  const canViewClinical = canAccessRole(session, ["clinician", "admin"]);
  const canViewOperational = canAccessRole(session, ["clinician", "admin"]);
  const showSessionWarning =
    sessionTimeRemainingMs > 0 && sessionTimeRemainingMs <= SESSION_WARNING_MS;

  return (
    <div className={`app-shell app-shell-${activeMode}`}>
      <AppHeader
        registeredAt={activeRegisteredAt}
        seasonLabel={currentSeasonBanner.label}
        seasonImage={currentSeasonBanner.image}
        sortBy={appSortBy}
        onSortChange={setAppSortBy}
        userEmail={session.email}
        userName={session.name}
        userRole={sessionRole}
        demoUsers={DEMO_USERS}
        onSwitchDemoRole={switchDemoRole}
        onLogout={handleLogout}
        mode={activeMode}
      />

      <section className="hero" aria-label={`${currentSeasonBanner.label} care studio`}>
        <img
          src={currentSeasonBanner.image}
          alt={`${currentSeasonBanner.label} Lumen Appointments banner`}
          className="hero-image"
        />
        <div className="hero-content">
          <p className="eyebrow">{currentSeasonBanner.label} care studio</p>
          <p>
            Coordinate patients, clinicians, availability and bookings inside a calm,
            seasonal workspace.
          </p>
        </div>
      </section>

      <nav className="app-nav" aria-label="Primary navigation">
        {canViewOperational && (
          <NavLink
            to={ROUTES.LIVE_BOOKING}
            activeClassName="active"
            className="live-mode-nav-link"
            onClick={(event) => requestModeSwitch(event, "live")}
          >
            <span>LIVE BOOKING <span aria-hidden="true">🔒</span></span>
            <small>Neutral</small>
          </NavLink>
        )}
        {canViewOperational && (
          <NavLink
            to={ROUTES.PRACTICE_MODE}
            activeClassName="active"
            className="practice-mode-nav-link"
            onClick={(event) => requestModeSwitch(event, "practice")}
          >
            <span>PRACTICE MODE <span aria-hidden="true">🔒</span></span>
            <small>Tinted</small>
          </NavLink>
        )}
        {isPatient && (
          <NavLink to={ROUTES.PATIENT_HOME} activeClassName="active">
            Patient Home
          </NavLink>
        )}
        {canViewClinical && (
          <NavLink to={activeModeRoutes.patients} activeClassName="active">
            Patients
          </NavLink>
        )}
        {canViewClinical && (
          <NavLink to={activeModeRoutes.concerns} activeClassName="active">
            Patient Care
          </NavLink>
        )}
        {canViewClinical && (
          <NavLink to={activeModeRoutes.clinicianQueue} activeClassName="active">
            Clinician Queue
          </NavLink>
        )}
        {canViewClinical && (
          <NavLink to={activeModeRoutes.bookingBoard} activeClassName="active">
            Appointments
          </NavLink>
        )}
        {canViewAdmin && (
          <NavLink to={activeModeRoutes.clinicians} activeClassName="active">
            Clinicians
          </NavLink>
        )}
        {canViewAdmin && (
          <NavLink to={activeModeRoutes.admin} activeClassName="active">
            Admin
          </NavLink>
        )}
        <div className="cheat-sheet-nav">
          <button
            type="button"
            className="cheat-sheet-trigger"
            onClick={() => setCheatSheetsOpen((open) => !open)}
            aria-expanded={cheatSheetsOpen}
          >
            Cheat Sheets
          </button>
          {cheatSheetsOpen && (
            <div className="cheat-sheet-menu" role="menu">
              <button type="button" onClick={() => setCheatSheetsOpen(false)}>Patient Care</button>
              <button type="button" onClick={() => setCheatSheetsOpen(false)}>Clinician Queue</button>
              <button type="button" onClick={() => setCheatSheetsOpen(false)}>Administration</button>
              <button type="button" onClick={() => setCheatSheetsOpen(false)}>Practice Mode</button>
              <button type="button" onClick={() => setCheatSheetsOpen(false)}>Appointment Pathway Map</button>
            </div>
          )}
        </div>
        {canViewAdmin && (
          <NavLink to={activeModeRoutes.settings} activeClassName="active">
            Settings
          </NavLink>
        )}
      </nav>

      <ModeStatusBanner mode={activeMode} />
      {showSessionWarning && (
        <SessionTimeoutNotice
          remainingMs={sessionTimeRemainingMs}
          onExtend={extendSession}
          onLogout={handleLogout}
        />
      )}
      {pendingModeSwitch && (
        <ModeSwitchModal
          targetMode={pendingModeSwitch.targetMode}
          onCancel={stayInCurrentMode}
          onContinue={continueModeSwitch}
        />
      )}
      {modeSwitchLoading && (
        <ModeSwitchSpinner targetMode={modeSwitchLoading.targetMode} />
      )}

      <main className="workspace">
        {activeRoleCheatSheet && (
          <div className="role-cheat-sheet-bar">
            <button type="button" className="action-button" onClick={() => setCheatSheetsOpen(true)}>
              {activeRoleCheatSheet}
            </button>
          </div>
        )}
        <Switch>
          <Route exact path="/">
            <Redirect to={getLandingRouteForRole(sessionRole)} />
          </Route>
          <Route exact path={ROUTES.LOGIN}>
            <Redirect to={getLandingRouteForRole(sessionRole)} />
          </Route>
          <Route exact path={ROUTES.CLINICIAN_DASHBOARD}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ClinicianDemoHome session={session} routes={getModeRoutes("live")} />
            </RoleGate>
          </Route>
          <Route exact path={ROUTES.PATIENT_HOME}>
            <RoleGate session={session} allowedRoles={["patient"]}>
              <PatientDemoHome session={session} />
            </RoleGate>
          </Route>
          <Route exact path={ROUTES.ADMIN_PANEL}>
            <RoleGate session={session} allowedRoles={["admin"]}>
              <AdminDemoHome session={session} routes={getModeRoutes("live")} />
            </RoleGate>
          </Route>
          <Route exact path={ROUTES.UNAUTHORIZED}>
            <UnauthorizedPage session={session} />
          </Route>
          <Route exact path={ROUTES.LIVE_BOOKING}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <LiveBookingDashboard
                  patients={livePatients}
                  clinicians={liveClinicians}
                  appointments={liveAppointmentListItems}
                  concerns={liveConcernListItems}
                  dataStatus={liveDataStatus}
                  routes={getModeRoutes("live")}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("live").patients}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <PatientsPage patients={livePatients} setPatients={setLivePatients} mode="live" />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("live").clinicians}>
            <RoleGate session={session} allowedRoles={["admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <CliniciansPage clinicians={liveClinicians} setClinicians={setLiveClinicians} />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("live").admin}>
            <RoleGate session={session} allowedRoles={["admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <AdminDashboard
                  concerns={liveConcernListItems}
                  appointments={liveAppointmentListItems}
                  availability={liveAvailability}
                  patientLookup={livePatientLookup}
                  clinicianLookup={liveClinicianLookup}
                  onAdvanceConcern={() => {}}
                  onUpdateConcern={updateLiveConcern}
                  onUpdateAppointment={updateLiveAppointment}
                  onAddConcernNote={(id, note) => addModeConcernNote("live", id, note)}
                  onAddAppointmentNote={(id, note) => addModeAppointmentNote("live", id, note)}
                  routes={getModeRoutes("live")}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("live").bookingBoard}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <AppointmentsPage
                  appointments={liveAppointments}
                  setAppointments={setLiveAppointments}
                  availability={liveAvailability}
                  patients={livePatients}
                  clinicians={liveClinicians}
                  patientLookup={livePatientLookup}
                  clinicianLookup={liveClinicianLookup}
                  sortBy={appSortBy}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("live").clinicianQueue}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <ClinicianQueue
                  concerns={liveConcernListItems}
                  patientLookup={livePatientLookup}
                  onUpdateClinicianJourney={updateLiveConcern}
                  onAddConcernNote={(id, note) => addModeConcernNote("live", id, note)}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("live").settings}>
            <RoleGate session={session} allowedRoles={["admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <AvailabilityPage
                  mode="live"
                  availability={liveAvailability}
                  setAvailability={setLiveAvailability}
                  clinicians={liveClinicians}
                  clinicianLookup={liveClinicianLookup}
                  journeyStartRoute={getModeRoutes("live").newConcern}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("live").newConcern}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <NewConcern
                  addConcern={addLiveConcern}
                  patients={livePatients}
                  descriptions={[]}
                  returnTo={getModeRoutes("live").concerns}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("live").concerns}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="live" pathwayStatuses={livePathwayStatuses}>
                <ConcernList
                  concerns={liveConcernListItems}
                  onAdvanceConcern={() => {}}
                  onUpdateConcern={updateLiveConcern}
                  onAddConcernNote={(id, note) => addModeConcernNote("live", id, note)}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route exact path={ROUTES.PRACTICE_MODE}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="practice">
                <JourneyStart
                  activityLog={activityLog}
                  practiceLevelId={practiceLevelId}
                  practiceLevels={PRACTICE_LEVELS}
                  seasonLabel={currentSeasonBanner.label}
                onPracticeLevelChange={changePracticeLevel}
                onRunPracticeStep={runNextPracticeStep}
                onResetPracticeBoard={resetPracticeBoard}
                onCreateMockPatientJourney={createMockPatientJourney}
                routes={getModeRoutes("practice")}
                onRequestPracticeExit={(event, targetRoute) =>
                  requestModeSwitch(event, "live", targetRoute)
                  }
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("practice").patients}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="practice">
                <PatientsPage
                  patients={patients}
                  setPatients={setPatients}
                  mode="practice"
                  onStartPatientJourney={startPracticeJourneyForPatient}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("practice").clinicians}>
            <RoleGate session={session} allowedRoles={["admin"]}>
              <ModeWorkspace mode="practice">
                <CliniciansPage clinicians={clinicians} setClinicians={setClinicians} />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("practice").admin}>
            <RoleGate session={session} allowedRoles={["admin"]}>
              <ModeWorkspace mode="practice">
                <AdminDashboard
                  concerns={concernListItems}
                  appointments={appointmentListItems}
                  availability={availability}
                  patientLookup={patientLookup}
                  clinicianLookup={clinicianLookup}
                  onAdvanceConcern={advanceConcernJourney}
                  onUpdateConcern={updateConcernJourney}
                  onUpdateAppointment={updateAppointmentMovement}
                  onAddConcernNote={(id, note) => addModeConcernNote("practice", id, note)}
                  onAddAppointmentNote={(id, note) => addModeAppointmentNote("practice", id, note)}
                  activityLog={activityLog}
                  practiceLevelId={practiceLevelId}
                  practiceLevels={PRACTICE_LEVELS}
                  onPracticeLevelChange={changePracticeLevel}
                  onRunPracticeStep={runNextPracticeStep}
                  onResetPracticeBoard={resetPracticeBoard}
                  routes={getModeRoutes("practice")}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("practice").bookingBoard}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="practice">
                <AppointmentsPage
                  appointments={appointments}
                  setAppointments={setAppointments}
                  availability={availability}
                  patients={patients}
                  clinicians={clinicians}
                  patientLookup={patientLookup}
                  clinicianLookup={clinicianLookup}
                  sortBy={appSortBy}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("practice").clinicianQueue}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="practice">
                <ClinicianQueue
                  concerns={concernListItems}
                  patientLookup={patientLookup}
                  onUpdateClinicianJourney={updateConcernJourney}
                  onAddConcernNote={(id, note) => addModeConcernNote("practice", id, note)}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("practice").settings}>
            <RoleGate session={session} allowedRoles={["admin"]}>
              <ModeWorkspace mode="practice">
                <AvailabilityPage
                  mode="practice"
                  availability={availability}
                  setAvailability={setAvailability}
                  clinicians={clinicians}
                  clinicianLookup={clinicianLookup}
                  journeyStartRoute={getModeRoutes("practice").newConcern}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("practice").newConcern}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="practice">
                <NewConcern
                addConcern={(concern) => {
                  setJourneyFocusPatientId(concern.patientId);
                  setConcerns((currentConcerns) => [
                    {
                      ...concern,
                      id: concern.id || makeId("practice-concern"),
                      isSpotlightJourney: true,
                      notes: concern.notes || buildInitialConcernNotes(concern),
                    },
                    ...currentConcerns.map((item) => ({ ...item, isSpotlightJourney: false })),
                  ]);
                  recordPracticeEvent(`Mock concern recorded for ${concern.patientName || concern.patientId}.`);
                }}
                  patients={patients}
                  descriptions={[]}
                  returnTo={getModeRoutes("practice").concerns}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={getModeRoutes("practice").concerns}>
            <RoleGate session={session} allowedRoles={["clinician", "admin"]}>
              <ModeWorkspace mode="practice">
                <ConcernList
                  concerns={concernListItems}
                  onAdvanceConcern={advanceConcernJourney}
                  onUpdateConcern={updateConcernJourney}
                  onAddConcernNote={(id, note) => addModeConcernNote("practice", id, note)}
                />
              </ModeWorkspace>
            </RoleGate>
          </Route>
          <Route path={ROUTES.PATIENTS}>
            <Redirect to={getModeRoutes("live").patients} />
          </Route>
          <Route path={ROUTES.CLINICIANS}>
            <Redirect to={getModeRoutes("live").clinicians} />
          </Route>
          <Route path={ROUTES.JOURNEY_START}>
            <Redirect to={ROUTES.PRACTICE_MODE} />
          </Route>
          <Route path={ROUTES.NEW_CONCERN}>
            <Redirect to={getModeRoutes("live").newConcern} />
          </Route>
          <Route path={ROUTES.CONCERNS}>
            <Redirect to={getModeRoutes("live").concerns} />
          </Route>
          <Route path={ROUTES.CLINICIAN_QUEUE}>
            <Redirect to={getModeRoutes("live").clinicianQueue} />
          </Route>
          <Route path={ROUTES.ADMINISTRATION}>
            <Redirect to={getModeRoutes("live").admin} />
          </Route>
          <Route path={ROUTES.AVAILABILITY}>
            <Redirect to={getModeRoutes("live").settings} />
          </Route>
          <Route path={ROUTES.SETTINGS}>
            <Redirect to={activeModeRoutes.settings} />
          </Route>
          <Route path={ROUTES.APPOINTMENTS}>
            <Redirect to={getModeRoutes("live").bookingBoard} />
          </Route>
        </Switch>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <strong>Lumen Appointments</strong>
            <span>&copy; 2026 Lumen Appointments</span>
          </div>
          <span className={`footer-mode-badge footer-mode-badge-${activeMode}`}>
            {activeMode === "practice" ? "Practice Mode - mock data" : "Live Booking - real data only"}
          </span>

          <nav className="footer-middle" aria-label="Footer links">
            <a href="#privacy-security">Privacy &amp; Security</a>
            <a href="#terms-of-service">Terms of Service</a>
            <a href="#data-protection">Data Protection</a>
          </nav>

          <a
            className="footer-right"
            href="https://seasonal.studio"
            target="_blank"
            rel="noreferrer"
          >
            seasonal.studio
          </a>
        </div>
      </footer>
      <CheatSheetsDrawer open={cheatSheetsOpen} onClose={() => setCheatSheetsOpen(false)} />
    </div>
  );
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getSlotStartTime(slot) {
  return slot.startTime || slot.time?.split("-")[0] || "";
}

function getMockPatientEmail(patient) {
  if (!patient) {
    return "patient@example.mock";
  }

  const namePart = (patient.name || patient.id || "patient")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");

  return `${namePart || "patient"}@lumen.example.mock`;
}

function getActiveRoleCheatSheet(pathname) {
  if (pathname.endsWith("/concerns") || pathname.endsWith("/concern/new")) {
    return "Patient Care Cheat Sheet";
  }

  if (pathname.endsWith("/clinician-queue")) {
    return "Clinician Cheat Sheet";
  }

  if (pathname.endsWith("/admin")) {
    return "Admin Cheat Sheet";
  }

  return "";
}

function ModeWorkspace({ mode, pathwayStatuses = EMPTY_LIVE_PATHWAY_STATUSES, children }) {
  const [pathwayOpen, setPathwayOpen] = useState(false);

  return (
    <div className={`mode-workspace mode-workspace-${mode} ${pathwayOpen ? "pathway-open" : "pathway-closed"}`}>
      <div className="pathway-reminder">
        <button
          type="button"
          className={`pathway-toggle pathway-toggle-${mode}`}
          onClick={() => setPathwayOpen((open) => !open)}
          aria-expanded={pathwayOpen}
        >
          {pathwayOpen ? "Hide Appointment Pathway" : "Show Appointment Pathway"}
        </button>
      </div>
      {pathwayOpen && (
        <AppointmentPathwayRail
          mode={mode}
          statuses={pathwayStatuses}
          onClose={() => setPathwayOpen(false)}
        />
      )}
      <div className="mode-workspace-main">{children}</div>
    </div>
  );
}

function ModeStatusBanner({ mode }) {
  const isPractice = mode === "practice";

  return (
    <section className="mode-status-banner" aria-label="Current mode">
      <strong>{isPractice ? "PRACTICE MODE - TRAINING ONLY" : "LIVE BOOKING - REAL PATIENTS"}</strong>
    </section>
  );
}

function NhsSpinner({ label = "Loading", compact = false }) {
  return (
    <span className={`nhs-spinner ${compact ? "compact" : ""}`} role="status" aria-live="polite">
      <span className="nhs-spinner-ring" aria-hidden="true">
        <span>NHS</span>
      </span>
      <span>{label}</span>
    </span>
  );
}

function SessionTimeoutNotice({ remainingMs, onExtend, onLogout }) {
  return (
    <section className="session-timeout-notice" aria-label="Session timeout warning">
      <NhsSpinner label="Session timeout approaching" compact />
      <strong>{formatCountdown(remainingMs)} remaining</strong>
      <button type="button" className="action-button session-extend-button" onClick={onExtend}>
        Extend session
      </button>
      <button type="button" className="action-button" onClick={onLogout}>
        Sign out now
      </button>
    </section>
  );
}

function ModeSwitchSpinner({ targetMode }) {
  const isLive = targetMode === "live";

  return (
    <div className="mode-modal-backdrop mode-spinner-backdrop" role="presentation">
      <section className="mode-switch-spinner" role="status" aria-live="polite">
        <NhsSpinner
          label={isLive ? "Switching to Live Booking" : "Switching to Practice Mode"}
        />
        <p>
          {isLive
            ? "Opening the real-data workspace."
            : "Opening the mock training workspace."}
        </p>
      </section>
    </div>
  );
}

function ModeSwitchModal({ targetMode, onCancel, onContinue }) {
  const isLeavingPractice = targetMode === "live";

  return (
    <div className="mode-modal-backdrop" role="presentation">
      <section
        className="mode-switch-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="mode-switch-title"
        aria-describedby="mode-switch-description"
      >
        <p className="mode-modal-kicker">PRACTICE MODE - TRAINING ONLY</p>
        <h2 id="mode-switch-title">
          {isLeavingPractice ? "You are leaving Practice Mode." : "Switch to Practice Mode?"}
        </h2>
        <p id="mode-switch-description">
          {isLeavingPractice
            ? "This action will switch to Live Booking and use real data."
            : "This action will switch the workspace to training-only mock data."}
        </p>
        <div className="mode-modal-actions">
          <button type="button" className="mode-modal-continue" onClick={onContinue}>
            {isLeavingPractice ? "Continue to Live Booking" : "Continue to Practice Mode"}
          </button>
          <button type="button" className="mode-modal-stay" onClick={onCancel} autoFocus>
            {isLeavingPractice ? "Stay in Practice Mode" : "Stay in Live Booking"}
          </button>
        </div>
      </section>
    </div>
  );
}

function AppointmentPathwayRail({ mode, statuses = EMPTY_LIVE_PATHWAY_STATUSES, onClose }) {
  const isPractice = mode === "practice";

  return (
    <aside className={`appointment-pathway-rail ${isPractice ? "practice" : "live"}`} aria-label="Appointment pathway">
      <div className="appointment-pathway-header">
        <h2>Appointment Pathway</h2>
        <button type="button" className="pathway-close" onClick={onClose} aria-label="Close appointment pathway">
          Close
        </button>
      </div>
      <ol>
        {APPOINTMENT_PATHWAY_STEPS.map((step, index) => (
          <li key={step}>
            {isPractice ? (
              <span className="pathway-index">{index + 1}</span>
            ) : (
              <span className="pathway-status-dot" aria-hidden="true" />
            )}
            <strong>{step}</strong>
            <small>{isPractice ? "Practice" : statuses[index] || "0"}</small>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function LiveBookingDashboard({ patients, clinicians, appointments, concerns, dataStatus, routes }) {
  const outstandingConfirmations = appointments.filter(
    (appointment) => appointment.patientCommunicationNeeded || appointment.communication?.confirmationOutstanding
  ).length;
  const triageWaiting = concerns.filter((concern) =>
    ["Awaiting Review", "Ready for Triage", "Needs Information"].includes(concern.status)
  ).length;

  return (
    <section className="mode-panel live-mode-panel">
      <div className="mode-header live-mode-header">
        <div>
          <p className="command-kicker">Live Booking - Real Patients</p>
          <h1>Live Booking - Real Patients</h1>
          <p>Neutral clinic workspace for active booking work. No training controls, mock labels or mock fallback data appear here.</p>
        </div>
        <div className="live-mode-indicator-group">
          <span className="live-data-indicator">This is live data</span>
          <span className="live-data-indicator neutral">No practice controls</span>
        </div>
      </div>

      {dataStatus === "loading" && (
        <div className="live-data-loading">
          <NhsSpinner label="Checking live booking connection" />
          <span>Waiting for {LIVE_DATA_ENDPOINT} to return live records.</span>
        </div>
      )}

      {dataStatus === "not-connected" && (
        <div className="live-data-empty-warning">
          <strong>No live patient data connected</strong>
          <span>
            Live Booking is intentionally empty until {LIVE_DATA_ENDPOINT} returns real records.
            Practice mock data is not used as a fallback.
          </span>
        </div>
      )}

      <div className="mode-stats-grid">
        <ModeStat label="Patients" value={patients.length} detail="Real patient records" />
        <ModeStat label="Clinicians" value={clinicians.length} detail="Active rota staff" />
        <ModeStat label="Triage" value={triageWaiting} detail="Real-time status" />
        <ModeStat label="Confirmations" value={outstandingConfirmations} detail="Outstanding now" />
      </div>

      <section className="live-booking-actions" aria-label="Live booking entry points">
        <Link to={routes.concerns} className="journey-start-card patient-start-card">
          <strong>Patient Care</strong>
          <span>Review real concerns, updates and patient-facing communication.</span>
        </Link>
        <Link to={routes.clinicianQueue} className="journey-start-card clinician-start-card">
          <strong>Clinician Queue</strong>
          <span>See items needing authorised clinical attention.</span>
        </Link>
        <Link to={routes.bookingBoard} className="journey-start-card admin-start-card">
          <strong>Booking Board</strong>
          <span>Book, update and confirm appointments without practice controls.</span>
        </Link>
      </section>
    </section>
  );
}

function ModeStat({ label, value, detail }) {
  return (
    <article className="mode-stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function CheatSheetsDrawer({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="cheat-sheet-backdrop" role="presentation" onClick={onClose}>
      <aside
        className="cheat-sheet-drawer"
        aria-label="Cheat Sheets"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="cheat-sheet-drawer-header">
          <h2>Cheat Sheets</h2>
          <button type="button" className="action-button" onClick={onClose}>
            Close
          </button>
        </div>
        <section>
          <h3>Role Cheat Sheets</h3>
          <CheatSheetBlock
            title="Patient Care"
            items={["What you review", "What you update", "Key workflow steps"]}
          />
          <CheatSheetBlock
            title="Clinician Queue"
            items={["Items requiring attention", "Notes and handoffs", "Clinical-only workflow"]}
          />
          <CheatSheetBlock
            title="Administration"
            items={["Tasks and communications", "Appointment changes", "Coordination steps"]}
          />
        </section>
        <section>
          <h3>Practice Mode Cheat Sheets</h3>
          <CheatSheetBlock
            title="Practice Mode Overview"
            items={["Scenario levels", "Run Next Step", "Reset Board"]}
          />
          <CheatSheetBlock
            title="Appointment Pathway Map"
            items={["Registration -> Triage -> Booking -> Confirmation -> Care -> Follow-up -> Closure"]}
          />
        </section>
      </aside>
    </div>
  );
}

function CheatSheetBlock({ title, items }) {
  return (
    <article className="cheat-sheet-block">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function LoginSplash({ seasonLabel, seasonImage, onLogin }) {
  const [credentials, setCredentials] = useState({
    email: DEFAULT_DEMO_USER.email,
    password: DEFAULT_DEMO_USER.password,
    passcode: DEFAULT_DEMO_USER.passcode,
  });
  const [error, setError] = useState("");

  const updateCredentials = (event) => {
    setCredentials({ ...credentials, [event.target.name]: event.target.value });
    setError("");
  };

  const applyDemoUser = (selectedUser) => {
    setCredentials({
      email: selectedUser.email,
      password: selectedUser.password,
      passcode: selectedUser.passcode,
    });
    setError("");
  };

  const selectDemoUser = (event) => {
    const selectedUser = DEMO_USERS.find((user) => user.email === event.target.value) || DEFAULT_DEMO_USER;
    applyDemoUser(selectedUser);
  };

  const quickLogin = (selectedUser) => {
    const selectedCredentials = {
      email: selectedUser.email,
      password: selectedUser.password,
      passcode: selectedUser.passcode,
    };

    setCredentials(selectedCredentials);
    const loginError = onLogin(selectedCredentials);
    setError(loginError);
  };

  const submitLogin = (event) => {
    event.preventDefault();
    const loginError = onLogin(credentials);
    setError(loginError);
  };

  return (
    <main className="login-splash">
      <img
        src={seasonImage}
        alt={`${seasonLabel} Lumen Appointments splash`}
        className="login-splash-image"
      />
      <div className="login-splash-overlay" />
      <section className="login-panel" aria-label="Lumen Appointments sign in">
        <div className="login-intro">
          <div className="login-brand">
            <div className="lumen-mark" aria-hidden="true">
              <span />
            </div>
            <div className="lumen-wordmark">
              <strong>Lumen</strong>
              <span>Appointments</span>
            </div>
          </div>
          <p className="eyebrow">{seasonLabel} clinical appointment system</p>
          <h1>Choose a calm, role-aware path into care coordination.</h1>
          <p>
            A soft prototype workspace for clinical queues, patient reassurance,
            administrative oversight, route protection, and timed sessions.
          </p>
          <div className="login-safety-strip" aria-label="Prototype safeguards">
            <span>Role-based routing</span>
            <span>Timed sessions</span>
            <span>Protected views</span>
          </div>
        </div>

        <div className="login-demo-cards" aria-label="Mock login shortcuts">
          {DEMO_USERS.map((user) => (
            <article
              className={`login-demo-card ${credentials.email === user.email ? "active" : ""}`}
              key={user.userId}
            >
              <span className="login-demo-card-status">{ROLE_TILE_COPY[user.role].detail}</span>
              <h2>{ROLE_TILE_COPY[user.role].title}</h2>
              <p>{ROLE_TILE_COPY[user.role].description}</p>
              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{user.email}</dd>
                </div>
                <div>
                  <dt>Password</dt>
                  <dd>{user.password}</dd>
                </div>
                <div>
                  <dt>Passcode</dt>
                  <dd>{user.passcode}</dd>
                </div>
              </dl>
              <button type="button" className="action-button" onClick={() => quickLogin(user)}>
                Enter as {ROLE_LABELS[user.role]}
              </button>
            </article>
          ))}
        </div>

        <form className="login-form" onSubmit={submitLogin}>
          <div className="login-form-header">
            <span>Sign in</span>
            <small>Use a role tile to enter directly, or edit demo credentials below.</small>
          </div>
          <label>
            Demo role
            <select value={credentials.email} onChange={selectDemoUser}>
              {DEMO_USERS.map((user) => (
                <option key={user.userId} value={user.email}>
                  {ROLE_LABELS[user.role]} - {user.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Email
            <input
              name="email"
              type="email"
              value={credentials.email}
              onChange={updateCredentials}
              autoComplete="username"
              required
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={credentials.password}
              onChange={updateCredentials}
              autoComplete="current-password"
              required
            />
          </label>
          <label>
            Security passcode
            <input
              name="passcode"
              type="text"
              inputMode="numeric"
              value={credentials.passcode}
              onChange={updateCredentials}
              autoComplete="one-time-code"
              required
            />
          </label>
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn btn-appointment">
            Enter selected role
          </button>
        </form>
        <div className="login-demo-note">
          <strong>Medical device study note</strong>
          <span>
            This is a thoughtful prototype for discussing SaMD concepts, human
            factors, access control, and safe clinical workflow support.
          </span>
          <small>Not a regulated medical device or production clinical system.</small>
        </div>
      </section>
    </main>
  );
}

function RoleGate({ session, allowedRoles, children }) {
  if (!session || isSessionExpired(session)) {
    return <Redirect to={ROUTES.LOGIN} />;
  }

  if (!allowedRoles.includes(session.role)) {
    return <Redirect to={ROUTES.UNAUTHORIZED} />;
  }

  return children;
}

function PatientDemoHome({ session }) {
  return (
    <section className="patient-demo-home">
      <div>
        <p className="eyebrow">Patient portal demo</p>
        <h1>Welcome, {session.name}</h1>
        <p>
          This mock patient role has a separate home area and cannot open clinician
          queues, booking tools or administration screens.
        </p>
      </div>
      <div className="patient-demo-grid">
        <article>
          <strong>Next appointment</strong>
          <span>Demo appointment details would appear here after patient-facing data is connected.</span>
        </article>
        <article>
          <strong>Messages</strong>
          <span>Patient-safe confirmation updates and instructions can be surfaced here.</span>
        </article>
        <article>
          <strong>Access level</strong>
          <span>{ROLE_LABELS[session.role]} role with protected staff routes disabled.</span>
        </article>
      </div>
    </section>
  );
}

function ClinicianDemoHome({ session, routes }) {
  return (
    <section className="role-demo-home">
      <div className="role-demo-intro">
        <p className="eyebrow">Clinician demo</p>
        <h1>Welcome, {session.name}</h1>
        <p>
          This clinician demo shows how care teams coordinate patients, handoffs,
          and structured notes inside a calm workspace.
        </p>
        <p>
          Live booking tools and real patient queues will appear here once
          connected to clinical data sources.
        </p>
      </div>
      <div className="patient-demo-grid">
        <article>
          <strong>Today's care queue</strong>
          <span>Review items that need authorised clinical attention, handoff checks, or structured notes.</span>
        </article>
        <article>
          <strong>Workflow focus</strong>
          <span>Use Patient Care, Clinician Queue, and Appointments to understand how the clinical pathway fits together.</span>
        </article>
        <article>
          <strong>Access level</strong>
          <span>Clinician role with admin-only and patient-only routes disabled.</span>
        </article>
      </div>
      <main className="page-main role-demo-explainer">
        <h3>Today's Care Queue</h3>
        <p>Real patient queues will appear here once connected.</p>

        <h3>Structured Notes</h3>
        <p>Clinician notes and handoff details will surface here.</p>
      </main>
      <div className="role-demo-actions">
        <Link to={routes.clinicianQueue} className="btn btn-appointment">
          Open Clinician Queue
        </Link>
        <Link to={routes.concerns} className="action-button">
          View Patient Care
        </Link>
      </div>
    </section>
  );
}

function AdminDemoHome({ session, routes }) {
  return (
    <section className="role-demo-home">
      <div className="role-demo-intro">
        <p className="eyebrow">Admin demo</p>
        <h1>Welcome, Admin Demo</h1>
        <p>
          This admin demo shows how service coordinators oversee tasks,
          communications, and appointment movements across the clinic.
        </p>
        <p>
          Administrative tools will appear here once connected to live
          operational data.
        </p>
        <p>Admin role with clinician-only and patient-only routes disabled.</p>
      </div>
      <div className="patient-demo-grid">
        <article>
          <strong>Operational oversight</strong>
          <span>Track tasks, communications, rota details, and appointment movements across the service.</span>
        </article>
        <article>
          <strong>Coordination view</strong>
          <span>Use Admin, Clinicians, Settings, and Appointments to understand how service flow is managed.</span>
        </article>
        <article>
          <strong>Access level</strong>
          <span>Admin-only oversight routes are available; clinician-only and patient-only spaces remain protected.</span>
        </article>
      </div>
      <div className="role-demo-actions">
        <Link to={routes.admin} className="btn btn-appointment">
          Admin Tools
        </Link>
        <Link to={routes.bookingBoard} className="action-button">
          View Appointments
        </Link>
      </div>
    </section>
  );
}

function UnauthorizedPage({ session }) {
  return (
    <section className="unauthorized-panel">
      <p className="eyebrow">Access restricted</p>
      <h1>This role cannot view that area</h1>
      <p>
        Signed in as {ROLE_LABELS[session.role]}: {session.email}. Choose an
        appropriate demo identity from the splash screen to test another role.
      </p>
      <Link to={getLandingRouteForRole(session.role)} className="btn btn-appointment">
        Return to my area
      </Link>
    </section>
  );
}

function AppHeader({
  registeredAt,
  seasonLabel,
  seasonImage,
  sortBy,
  onSortChange,
  userEmail,
  userName,
  userRole,
  demoUsers = [],
  onSwitchDemoRole,
  onLogout,
  mode,
}) {
  const activeSortLabel = APP_SORT_OPTIONS.find((option) => option.value === sortBy)?.label || "Next Appointment";
  const isPractice = mode === "practice";

  return (
    <header
      className="maskable-app-header"
      style={{ "--season-banner": `url(${seasonImage})` }}
    >
      <div className="app-brand-block">
        <div className="lumen-mark" aria-hidden="true">
          <span />
        </div>
        <div>
          <div className="lumen-wordmark">
            <strong>Lumen</strong>
            <span>Appointments</span>
          </div>
          <p>Registered: {formatPatientRegisteredDate(registeredAt)}</p>
        </div>
      </div>

      <div className="app-header-actions">
        <span className="header-user-badge">
          <strong>{ROLE_LABELS[userRole] || "Demo"}</strong>
          <span>{userName || userEmail}</span>
        </span>
        <label className="demo-role-switcher">
          <span>Demo role</span>
          <select
            value={userRole}
            onChange={(event) => onSwitchDemoRole?.(event.target.value)}
            aria-label="Switch demo role"
          >
            {demoUsers.map((user) => (
              <option value={user.role} key={user.userId}>
                {ROLE_LABELS[user.role]}
              </option>
            ))}
          </select>
        </label>
        <span className={`header-mode-badge header-mode-badge-${mode}`}>
          {isPractice ? "Practice Mode - mock data" : "Live Booking - real data"}
        </span>
        <label className="app-sort-control">
          <span aria-hidden="true">↕</span>
          <span className="app-sort-label">Sort:</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            aria-label={`Sort appointments: ${activeSortLabel}`}
          >
            {APP_SORT_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="app-sort-icon-control">
          <span aria-hidden="true">↕</span>
          <span className="screen-reader-only">Sort appointments</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            aria-label={`Sort appointments: ${activeSortLabel}`}
          >
            {APP_SORT_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <img
          src="/logos/nhs-mock-logo.svg"
          alt="Mock NHS logo"
          className="nhs-logo"
        />
        <button type="button" className="header-sign-out" onClick={onLogout}>
          Sign out
        </button>
      </div>

      <span className="season-chip">{userEmail ? `${seasonLabel} - Signed in` : seasonLabel}</span>
    </header>
  );
}

function PatientsPage({ patients, setPatients, mode = "live", onStartPatientJourney }) {
  const isPractice = mode === "practice";
  const [form, setForm] = useState({ name: "", dob: "", contact: "", notes: "" });
  const [editingId, setEditingId] = useState(null);
  const [patientSort, setPatientSort] = useState(() => {
    try {
      const savedSort = window.localStorage.getItem(PATIENT_SORT_STORAGE_KEY);
      return savedSort ? { ...DEFAULT_PATIENT_SORT, ...JSON.parse(savedSort) } : DEFAULT_PATIENT_SORT;
    } catch (error) {
      return DEFAULT_PATIENT_SORT;
    }
  });

  const sortedPatients = useMemo(() => {
    const sorted = patients.map((patient, index) => ({ patient, index }));

    if (patientSort.by === "name") {
      sorted.sort((first, second) =>
        first.patient.name.localeCompare(second.patient.name, undefined, { sensitivity: "base" })
      );
    } else if (patientSort.by === "dob") {
      sorted.sort((first, second) => (first.patient.dob || "").localeCompare(second.patient.dob || ""));
    } else {
      sorted.sort((first, second) => {
        const dateSort = (first.patient.registeredAt || "").localeCompare(second.patient.registeredAt || "");
        return dateSort || first.index - second.index;
      });
    }

    if (patientSort.order === "newest") {
      sorted.reverse();
    }

    return sorted.map(({ patient }) => patient);
  }, [patients, patientSort]);

  useEffect(() => {
    try {
      window.localStorage.setItem(PATIENT_SORT_STORAGE_KEY, JSON.stringify(patientSort));
    } catch (error) {
      // Keep sorting usable even when local storage is unavailable.
    }
  }, [patientSort]);

  const togglePatientSortOrder = () => {
    const currentScrollY = window.scrollY;

    setPatientSort((currentSort) => (
      {
        ...currentSort,
        order: currentSort.order === "newest" ? "oldest" : "newest",
      }
    ));

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY });
    });
  };

  const updatePatientSortBy = (event) => {
    const currentScrollY = window.scrollY;
    const { value } = event.target;

    setPatientSort((currentSort) => (
      {
        ...currentSort,
        by: value,
      }
    ));

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: currentScrollY });
    });
  };

  const isNewestFirst = patientSort.order === "newest";
  const sortOrderCopy = {
    registration: {
      label: isNewestFirst ? "Sort patients by newest first" : "Sort patients by oldest first",
      text: isNewestFirst ? "Recent first" : "Earliest first",
    },
    name: {
      label: isNewestFirst ? "Sort patients by name Z to A" : "Sort patients by name A to Z",
      text: isNewestFirst ? "Z to A" : "A to Z",
    },
    dob: {
      label: isNewestFirst
        ? "Sort patients by latest date of birth first"
        : "Sort patients by earliest date of birth first",
      text: isNewestFirst ? "Latest DOB" : "Earliest DOB",
    },
  };
  const activeSortCopy = sortOrderCopy[patientSort.by] || sortOrderCopy.registration;
  const sortToggleIcon = isNewestFirst ? "↑" : "↓";

  const sortListClassName = [
    "patient-record-list",
    `patient-record-list-${patientSort.by}`,
    `patient-record-list-${patientSort.order}`,
  ].join(" ");

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const resetPatientForm = () => {
    setForm({ name: "", dob: "", contact: "", notes: "" });
    setEditingId(null);
  };

  const savePatient = (event) => {
    event.preventDefault();
    if (editingId) {
      setPatients(
        patients.map((patient) =>
          patient.id === editingId ? { ...patient, ...form, id: editingId } : patient
        )
      );
    } else {
      const newPatient = { ...form, id: makeId("patient"), registeredAt: new Date().toISOString() };
      setPatients([...patients, newPatient]);
      onStartPatientJourney?.(newPatient, "added");
    }
    resetPatientForm();
  };

  const updatePatient = (patient) => {
    setForm({
      name: patient.name,
      dob: patient.dob,
      contact: patient.contact,
      notes: patient.notes || "",
    });
    setEditingId(patient.id);
  };

  const deletePatient = (id) => {
    setPatients(patients.filter((patient) => patient.id !== id));
    if (editingId === id) {
      resetPatientForm();
    }
  };

  return (
    <section className="page-grid">
      <Panel
        title={editingId ? "Update Mock Patient" : isPractice ? "Register Mock Patient Journey" : "Register Patient"}
        subtitle={
          isPractice
            ? "Add a mock patient here to start their practice care journey. Then use Run Next Practice Step to follow them through the pathway."
            : "Capture the minimum details needed for scheduling."
        }
      >
        <form onSubmit={savePatient} className="form-grid">
          <input name="name" value={form.name} onChange={updateForm} placeholder="Full name" required />
          <input name="dob" type="date" value={form.dob} onChange={updateForm} required />
          <input name="contact" value={form.contact} onChange={updateForm} placeholder="Contact number" required />
          <textarea name="notes" value={form.notes} onChange={updateForm} placeholder="Care notes" rows="4" />
          <div className="form-actions">
            <button type="submit" className="btn btn-patient">
              {editingId ? "Save Patient" : isPractice ? "Add Patient & Start Journey" : "Add Patient"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-quiet" onClick={resetPatientForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel
        title="Patient List"
        subtitle={`${patients.length} active records`}
        actions={
          <div className="sort-controls">
            <label className="screen-reader-only" htmlFor="patient-sort-by">
              Sort patients by
            </label>
            <select
              id="patient-sort-by"
              className="sort-select"
              value={patientSort.by}
              onChange={updatePatientSortBy}
              aria-label="Sort patients by"
            >
              <option value="registration">Registration date</option>
              <option value="name">Patient name</option>
              <option value="dob">Date of birth</option>
            </select>
            <button
              type="button"
              className="sort-toggle"
              aria-label={activeSortCopy.label}
              aria-pressed={isNewestFirst}
              onClick={togglePatientSortOrder}
            >
              <span aria-hidden="true">{sortToggleIcon}</span>
              {activeSortCopy.text}
            </button>
          </div>
        }
      >
        <RecordList
          className={sortListClassName}
          items={sortedPatients}
          renderItem={(patient) => (
            <>
              <strong>{patient.name}</strong>
              <span className="registration-date">
                Registered {formatPatientRegisteredDate(patient.registeredAt)}
              </span>
              <span>DOB {formatUkDate(patient.dob)}</span>
              <span>{patient.contact}</span>
              {patient.notes && <small>{patient.notes}</small>}
              <div className="record-actions">
                <button type="button" className="action-button" onClick={() => updatePatient(patient)}>
                  Update
                </button>
                {onStartPatientJourney && (
                  <button type="button" className="action-button" onClick={() => onStartPatientJourney(patient, "selected")}>
                    Start mock journey
                  </button>
                )}
                <button type="button" className="action-button danger" onClick={() => deletePatient(patient.id)}>
                  Delete
                </button>
              </div>
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function CliniciansPage({ clinicians, setClinicians }) {
  const [form, setForm] = useState({
    name: "",
    role: "",
    specialty: "",
    contact: "",
    registrationId: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError("");
  };

  const isValidRegistration = (id) => {
    if (!id) return true;
    return /^\d{7}$/.test(id) || /^[A-Za-z]{2}\d{6}$/.test(id) || /^[A-Za-z]{2}\d{5}$/.test(id);
  };

  const resetClinicianForm = () => {
    setForm({ name: "", role: "", specialty: "", contact: "", registrationId: "" });
    setEditingId(null);
    setError("");
  };

  const saveClinician = (event) => {
    event.preventDefault();
    if (!isValidRegistration(form.registrationId)) {
      setError("Use GMC 7 digits, NMC AA######, or HCPC AA#####.");
      return;
    }
    if (editingId) {
      setClinicians(
        clinicians.map((clinician) =>
          clinician.id === editingId ? { ...form, id: editingId } : clinician
        )
      );
    } else {
      setClinicians([...clinicians, { ...form, id: makeId("clinician") }]);
    }
    resetClinicianForm();
  };

  const editClinician = (clinician) => {
    setForm({
      name: clinician.name,
      role: clinician.role,
      specialty: clinician.specialty,
      contact: clinician.contact,
      registrationId: clinician.registrationId || "",
    });
    setEditingId(clinician.id);
    setError("");
  };

  const deleteClinician = (id) => {
    setClinicians(clinicians.filter((clinician) => clinician.id !== id));
    if (editingId === id) {
      resetClinicianForm();
    }
  };

  return (
    <section className="page-grid">
      <Panel
        title={editingId ? "Update Clinician" : "Add Clinician"}
        subtitle="Build the rota with verified clinical staff."
      >
        <form onSubmit={saveClinician} className="form-grid">
          <input name="name" value={form.name} onChange={updateForm} placeholder="Clinician name" required />
          <input name="role" value={form.role} onChange={updateForm} placeholder="Role" required />
          <input name="specialty" value={form.specialty} onChange={updateForm} placeholder="Specialty" required />
          <input name="contact" value={form.contact} onChange={updateForm} placeholder="Contact number" required />
          <input
            name="registrationId"
            value={form.registrationId}
            onChange={updateForm}
            placeholder="GMC / NMC / HCPC"
          />
          {error && <p className="error-box">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-clinician">
              {editingId ? "Save Clinician" : "Add Clinician"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-quiet" onClick={resetClinicianForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel title="Clinical Team" subtitle={`${clinicians.length} clinicians`}>
        <RecordList
          items={clinicians}
          renderItem={(clinician) => (
            <>
              <strong>{clinician.name}</strong>
              <span>{clinician.role} - {clinician.specialty}</span>
              <span>{clinician.contact}</span>
              {clinician.registrationId && <small>Registration {clinician.registrationId}</small>}
              <div className="record-actions">
                <button type="button" className="action-button" onClick={() => editClinician(clinician)}>
                  Update
                </button>
                <button type="button" className="action-button danger" onClick={() => deleteClinician(clinician.id)}>
                  Delete
                </button>
              </div>
            </>
          )}
        />
      </Panel>
    </section>
  );
}

function AvailabilityPage({
  availability,
  setAvailability,
  clinicians,
  clinicianLookup,
  mode = "live",
  journeyStartRoute = ROUTES.JOURNEY_START,
}) {
  const isPractice = mode === "practice";
  const [form, setForm] = useState({
    clinicianId: clinicians[0]?.id || "",
    date: "",
    startTime: "09:00",
    endTime: "09:30",
    status: "Available",
  });
  const [editingId, setEditingId] = useState(null);

  const updateForm = (event) => {
    const { name, value } = event.target;

    if (name === "startTime") {
      const nextEndOptions = getLaterTimeOptions(value);
      const endTime = nextEndOptions.includes(form.endTime)
        ? form.endTime
        : nextEndOptions[0] || value;

      setForm({ ...form, startTime: value, endTime });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const resetAvailabilityForm = () => {
    setForm({
      clinicianId: clinicians[0]?.id || "",
      date: "",
      startTime: "09:00",
      endTime: "09:30",
      status: "Available",
    });
    setEditingId(null);
  };

  const saveSlot = (event) => {
    event.preventDefault();
    if (editingId) {
      setAvailability(
        availability.map((slot) =>
          slot.id === editingId ? { ...form, id: editingId } : slot
        )
      );
    } else {
      setAvailability([...availability, { ...form, id: makeId("slot") }]);
    }
    resetAvailabilityForm();
  };

  const updateSlot = (slot) => {
    const [startTime = "", endTime = ""] = slot.time ? slot.time.split("-") : [];

    setForm({
      clinicianId: slot.clinicianId,
      date: slot.date,
      startTime: slot.startTime || startTime,
      endTime: slot.endTime || endTime,
      status: slot.status || "Available",
    });
    setEditingId(slot.id);
  };

  const deleteSlot = (id) => {
    setAvailability(availability.filter((slot) => slot.id !== id));
    if (editingId === id) {
      resetAvailabilityForm();
    }
  };

  return (
    <>
      <div className="availability-command-bar">
        <div>
          <p className="command-kicker">{isPractice ? "Practice Mode settings" : "Live Booking settings"}</p>
          <h1>{isPractice ? "Mock Availability" : "Availability"}</h1>
          <p>
            {isPractice
              ? "Publish mock clinician slots and practise availability changes without touching real records."
              : "Publish real clinician slots for live booking workflows."}
          </p>
        </div>
        <Link to={journeyStartRoute} className="btn btn-concern command-button">
          {isPractice ? "Begin Mock Care Journey" : "Begin Care Journey"}
        </Link>
      </div>

      <section className="page-grid">
        <Panel
          title={editingId ? "Update Availability" : "Open Availability"}
          subtitle={isPractice ? "Publish mock clinician slots for practice booking." : "Publish clinician slots for booking."}
        >
          <form onSubmit={saveSlot} className="form-grid">
            <select name="clinicianId" value={form.clinicianId} onChange={updateForm} required>
              {clinicians.map((clinician) => (
                <option key={clinician.id} value={clinician.id}>
                  {clinician.name} - {clinician.role}
                </option>
              ))}
            </select>
            <input name="date" type="date" value={form.date} onChange={updateForm} required />
            <div className="split-row">
              <select name="startTime" value={form.startTime} onChange={updateForm} required>
                {TIME_OPTIONS.slice(0, -1).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <select name="endTime" value={form.endTime} onChange={updateForm} required>
                {getLaterTimeOptions(form.startTime).map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <select name="status" value={form.status} onChange={updateForm}>
              <option>Available</option>
              <option>Booked</option>
              <option>Unavailable</option>
            </select>
            <div className="form-actions">
              <button type="submit" className="btn btn-availability">
                {editingId ? "Save Availability" : "Add Availability"}
              </button>
              {editingId && (
                <button type="button" className="btn btn-quiet" onClick={resetAvailabilityForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </Panel>

        <Panel
          title={isPractice ? "Mock Availability Board" : "Availability Board"}
          subtitle={`${availability.length} ${isPractice ? "mock " : ""}slots`}
        >
          <RecordList
            items={availability}
            renderItem={(slot) => (
              <>
                <strong>{clinicianLookup[slot.clinicianId]?.name || slot.clinicianId}</strong>
                <span>{formatUkDate(slot.date)}</span>
                <span>{slot.time || `${slot.startTime} - ${slot.endTime}`}</span>
                <small className={`status status-${slot.status.toLowerCase()}`}>{slot.status}</small>
                <div className="record-actions">
                  <button type="button" className="action-button" onClick={() => updateSlot(slot)}>
                    Update
                  </button>
                  <button type="button" className="action-button danger" onClick={() => deleteSlot(slot.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}
          />
        </Panel>
      </section>
    </>
  );
}

function AppointmentsPage({ appointments, setAppointments, availability, patients, clinicians, patientLookup, clinicianLookup, sortBy }) {
  const [form, setForm] = useState({
    patientId: patients[0]?.id || "",
    clinicianId: clinicians[0]?.id || "",
    date: "",
    time: "09:00",
    reason: "",
  });
  const [editingId, setEditingId] = useState(null);
  const clinicianAvailability = useMemo(
    () =>
      availability
        .filter((slot) => slot.clinicianId === form.clinicianId)
        .filter((slot) => !form.date || slot.date === form.date)
        .sort((first, second) =>
          `${first.date || ""} ${getSlotStartTime(first)}`.localeCompare(
            `${second.date || ""} ${getSlotStartTime(second)}`
          )
        ),
    [availability, form.clinicianId, form.date]
  );
  const sortedAppointments = useMemo(() => {
    const sorted = [...appointments];

    if (sortBy === "registration") {
      sorted.sort((first, second) =>
        (patientLookup[first.patientId]?.registeredAt || "").localeCompare(
          patientLookup[second.patientId]?.registeredAt || ""
        )
      );
    } else if (sortBy === "patientName") {
      sorted.sort((first, second) =>
        (patientLookup[first.patientId]?.name || first.patientId || "").localeCompare(
          patientLookup[second.patientId]?.name || second.patientId || "",
          undefined,
          { sensitivity: "base" }
        )
      );
    } else {
      sorted.sort((first, second) =>
        `${first.date || ""} ${first.time || ""}`.localeCompare(`${second.date || ""} ${second.time || ""}`)
      );
    }

    return sorted;
  }, [appointments, patientLookup, sortBy]);

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const selectAvailabilitySlot = (slot) => {
    if ((slot.status || "").toLowerCase() !== "available") {
      return;
    }

    setForm({
      ...form,
      clinicianId: slot.clinicianId,
      date: slot.date,
      time: getSlotStartTime(slot) || form.time,
    });
  };

  const resetAppointmentForm = () => {
    setForm({
      patientId: patients[0]?.id || "",
      clinicianId: clinicians[0]?.id || "",
      date: "",
      time: "09:00",
      reason: "",
    });
    setEditingId(null);
  };

  const saveAppointment = (event) => {
    event.preventDefault();
    if (editingId) {
      setAppointments(
        appointments.map((appointment) =>
          appointment.id === editingId ? { ...appointment, ...form, id: editingId } : appointment
        )
      );
    } else {
      setAppointments([...appointments, { ...form, id: makeId("appt"), createdAt: new Date().toISOString() }]);
    }
    resetAppointmentForm();
  };

  const updateAppointmentContact = (appointmentId, channel) => {
    const contacted = channel !== "Not confirmed";

    setAppointments(
      appointments.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              confirmationMethod: channel,
              patientCommunicationNeeded: !contacted,
              communication: {
                ...appointment.communication,
                patientInformed: contacted,
                channel,
                at: contacted ? new Date().toISOString() : "",
                by: contacted ? "Care Navigation Team" : "",
                confirmationOutstanding: !contacted,
              },
            }
          : appointment
      )
    );
  };

  const editAppointment = (appointment) => {
    setForm({
      patientId: appointment.patientId,
      clinicianId: appointment.clinicianId,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
    });
    setEditingId(appointment.id);
  };

  const deleteAppointment = (id) => {
    setAppointments(appointments.filter((appointment) => appointment.id !== id));
    if (editingId === id) {
      resetAppointmentForm();
    }
  };

  return (
    <section className="page-grid appointments-grid">
      <Panel
        title={editingId ? "Update Appointment" : "Book Appointment"}
        subtitle="Match a patient with the right clinician and time."
      >
        <form onSubmit={saveAppointment} className="form-grid">
          <select name="patientId" value={form.patientId} onChange={updateForm} required>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>{patient.name}</option>
            ))}
          </select>
          <select name="clinicianId" value={form.clinicianId} onChange={updateForm} required>
            {clinicians.map((clinician) => (
              <option key={clinician.id} value={clinician.id}>
                {clinician.name} - {clinician.specialty}
              </option>
            ))}
          </select>
          <div className="split-row">
            <input name="date" type="date" value={form.date} onChange={updateForm} required />
            <select name="time" value={form.time} onChange={updateForm} required>
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <textarea name="reason" value={form.reason} onChange={updateForm} placeholder="Reason for appointment" rows="4" />
          <div className="form-actions">
            <button type="submit" className="btn btn-appointment">
              {editingId ? "Save Appointment" : "Book Appointment"}
            </button>
            {editingId && (
              <button type="button" className="btn btn-quiet" onClick={resetAppointmentForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </Panel>

      <Panel
        title="Clinician Availability"
        subtitle={
          form.date
            ? `${clinicianLookup[form.clinicianId]?.name || "Selected clinician"} on ${formatUkDate(form.date)}`
            : `${clinicianLookup[form.clinicianId]?.name || "Selected clinician"} across all visible dates`
        }
      >
        <div className="availability-preview">
          {clinicianAvailability.length ? (
            clinicianAvailability.map((slot) => {
              const status = slot.status || "Available";
              const isAvailable = status.toLowerCase() === "available";

              return (
                <button
                  type="button"
                  className={`availability-slot ${isAvailable ? "selectable" : ""}`}
                  key={slot.id}
                  onClick={() => selectAvailabilitySlot(slot)}
                  disabled={!isAvailable}
                >
                  <strong>{formatUkDate(slot.date)}</strong>
                  <span>{slot.time || `${slot.startTime} - ${slot.endTime}`}</span>
                  <small className={`status status-${status.toLowerCase()}`}>{status}</small>
                </button>
              );
            })
          ) : (
            <p className="empty-state">No slots match this clinician and date.</p>
          )}
        </div>
      </Panel>

      <Panel title="Appointment Schedule" subtitle={`${appointments.length} appointments`}>
        <RecordList
          items={sortedAppointments}
          renderItem={(appointment) => {
            const patient = patientLookup[appointment.patientId];
            const patientContacted = Boolean(appointment.communication?.patientInformed) && !appointment.patientCommunicationNeeded;
            const contactChannel = patientContacted ? appointment.communication?.channel || appointment.confirmationMethod : "Not confirmed";

            return (
              <>
              <strong>{patient?.name || appointment.patientId}</strong>
              <dl className="appointment-detail-meta">
                <div>
                  <dt>Registered</dt>
                  <dd>{formatPatientRegisteredDate(appointment.patientRegisteredAt)}</dd>
                </div>
                <div>
                  <dt>Appointment created</dt>
                  <dd>{formatPatientRegisteredDate(appointment.createdAt || appointment.date)}</dd>
                </div>
                <div>
                  <dt>Clinician assigned</dt>
                  <dd>{clinicianLookup[appointment.clinicianId]?.name || appointment.clinicianId}</dd>
                </div>
              </dl>
              <span>{formatUkDate(appointment.date)} at {appointment.time}</span>
              <small>{appointment.reason}</small>
              <div className="patient-contact-panel" aria-label={`Patient contact status for ${patient?.name || appointment.patientId}`}>
                <div>
                  <strong>Patient communication</strong>
                  <span className={`status ${patientContacted ? "status-contacted" : "status-not-confirmed"}`}>
                    {patientContacted ? `Contacted via ${contactChannel}` : "Confirmation not recorded"}
                  </span>
                </div>
                <dl>
                  <div>
                    <dt>Telephone</dt>
                    <dd>{patient?.contact || "No telephone recorded"}</dd>
                  </div>
                  <div>
                    <dt>Email</dt>
                    <dd>{patient?.email || getMockPatientEmail(patient)}</dd>
                  </div>
                </dl>
                <div className="contact-toggle-group" aria-label="Toggle patient confirmation contact method">
                  <button
                    type="button"
                    className={`contact-toggle ${contactChannel === "Email" ? "active" : ""}`}
                    onClick={() => updateAppointmentContact(appointment.id, "Email")}
                    aria-pressed={contactChannel === "Email"}
                  >
                    Email
                  </button>
                  <button
                    type="button"
                    className={`contact-toggle ${contactChannel === "Telephone" ? "active" : ""}`}
                    onClick={() => updateAppointmentContact(appointment.id, "Telephone")}
                    aria-pressed={contactChannel === "Telephone"}
                  >
                    Telephone
                  </button>
                  <button
                    type="button"
                    className={`contact-toggle ${!patientContacted ? "active warning" : ""}`}
                    onClick={() => updateAppointmentContact(appointment.id, "Not confirmed")}
                    aria-pressed={!patientContacted}
                  >
                    Not confirmed
                  </button>
                </div>
              </div>
              <div className="record-actions">
                <button type="button" className="action-button" onClick={() => editAppointment(appointment)}>
                  Update
                </button>
                <button type="button" className="action-button danger" onClick={() => deleteAppointment(appointment.id)}>
                  Delete
                </button>
              </div>
            </>
            );
          }}
        />
      </Panel>
    </section>
  );
}

function Panel({ title, subtitle, actions, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {actions && <div className="panel-actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

function RecordList({ items, renderItem, className = "" }) {
  if (!items.length) {
    return <p className="empty-state">No records yet.</p>;
  }

  return (
    <div className={`record-list ${className}`.trim()}>
      {items.map((item) => (
        <article className="record-card" key={item.id}>
          {renderItem(item)}
        </article>
      ))}
    </div>
  );
}

export default App;
