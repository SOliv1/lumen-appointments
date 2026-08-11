import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Redirect, Route, Switch } from "react-router-dom";
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
  PATIENTS: "/patients",
  CLINICIANS: "/clinicians",
  AVAILABILITY: "/availability",
  APPOINTMENTS: "/appointments",
  JOURNEY_START: "/journey/start",
  NEW_CONCERN: "/concern/new",
  CONCERNS: "/concerns",
  CLINICIAN_QUEUE: "/clinician-queue",
  ADMINISTRATION: "/administration",
};

const PATIENT_SORT_STORAGE_KEY = "lumenAppointmentsPatientSort";
const DEFAULT_PATIENT_SORT = {
  by: "registration",
  order: "newest",
};

const APP_SORT_OPTIONS = [
  { value: "nextAppointment", label: "Next Appointment" },
  { value: "registration", label: "Registration Date" },
  { value: "patientName", label: "Patient Name" },
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

const MOCK_CONCERN_DESCRIPTIONS = [
  "Persistent cough",
  "Chest discomfort",
  "Medication query",
  "Low mood",
  "Shortness of breath",
  "Pain in lower back",
  "Blood pressure follow-up",
  "Diabetes review",
  "Child fever advice",
  "Appointment time confusion",
  "Test result query",
  "Repeat prescription request",
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

function App() {
  const currentSeasonBanner = getCurrentSeasonBanner();
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [clinicians, setClinicians] = useState([...initialClinicians, ...EXTRA_MOCK_CLINICIANS]);
  const [availability, setAvailability] = useState(INITIAL_MOCK_AVAILABILITY);
  const [appointments, setAppointments] = useState(INITIAL_MOCK_APPOINTMENTS);
  const [concerns, setConcerns] = useState(INITIAL_MOCK_CONCERNS);
  const [appSortBy, setAppSortBy] = useState("nextAppointment");
  const [activityLog, setActivityLog] = useState([
    {
      id: "practice-log-start",
      at: new Date().toISOString(),
      text: "Practice board loaded with mock patients, clinicians, slots, appointments and concerns.",
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
  const headerRegisteredAt = useMemo(() => {
    const registeredPatients = patients
      .filter((patient) => patient.registeredAt)
      .sort((first, second) => second.registeredAt.localeCompare(first.registeredAt));

    return registeredPatients[0]?.registeredAt;
  }, [patients]);

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

  const addConcernNote = (id, note) => {
    const existingConcern = concerns.find((concern) => concern.id === id);
    const currentNotes = existingConcern?.notes || buildInitialConcernNotes(existingConcern || { id });

    updateConcernJourney(id, {
      notes: [
        {
          ...note,
          id: note.id || makeId("note"),
        },
        ...currentNotes,
      ],
    });
    recordPracticeEvent(`${note.type} note added to concern ${id}.`);
  };

  const addAppointmentNote = (id, note) => {
    const existingAppointment = appointments.find((appointment) => appointment.id === id);
    const currentNotes = existingAppointment?.notes || buildInitialAppointmentNotes(existingAppointment || { id });

    updateAppointmentMovement(id, {
      notes: [
        {
          ...note,
          id: note.id || makeId("note"),
        },
        ...currentNotes,
      ],
    });
    recordPracticeEvent(`${note.type} note added to appointment ${id}.`);
  };

  const recordPracticeEvent = (text) => {
    setActivityLog((currentLog) => [
      { id: makeId("log"), at: new Date().toISOString(), text },
      ...currentLog,
    ].slice(0, 12));
  };

  const resetPracticeBoard = () => {
    setPatients(INITIAL_PATIENTS);
    setClinicians([...initialClinicians, ...EXTRA_MOCK_CLINICIANS]);
    setAvailability(INITIAL_MOCK_AVAILABILITY);
    setAppointments(INITIAL_MOCK_APPOINTMENTS);
    setConcerns(INITIAL_MOCK_CONCERNS);
    setActivityLog([
      {
        id: makeId("log"),
        at: new Date().toISOString(),
        text: "Practice board reset to the original mock scenario.",
      },
    ]);
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
    const needsInfoConcern = concerns.find((concern) => concern.status === "Needs Information");

    if (needsInfoConcern) {
      updateConcernJourney(needsInfoConcern.id, {
        status: "Ready for Triage",
        clarificationStatus: "Information recorded during practice",
        patientContactStatus: "Clarification communication recorded",
      });
      recordPracticeEvent(`${patientLookup[needsInfoConcern.patientId]?.name || needsInfoConcern.patientId} moved from clarification to triage-ready.`);
      return;
    }

    const awaitingReviewConcern = concerns.find((concern) => concern.status === "Awaiting Review");

    if (awaitingReviewConcern) {
      advanceConcernJourney(awaitingReviewConcern.id, "triage");
      recordPracticeEvent(`${patientLookup[awaitingReviewConcern.patientId]?.name || awaitingReviewConcern.patientId} reviewed by admin and marked ready for triage.`);
      return;
    }

    const readyForTriageConcern = concerns.find((concern) => concern.status === "Ready for Triage");

    if (readyForTriageConcern) {
      advanceConcernJourney(readyForTriageConcern.id, "review");
      recordPracticeEvent(`${patientLookup[readyForTriageConcern.patientId]?.name || readyForTriageConcern.patientId} triage review completed in practice.`);
      return;
    }

    const appointmentRequiredConcern = concerns.find((concern) => concern.status === "Appointment Required");

    if (appointmentRequiredConcern) {
      advanceConcernJourney(appointmentRequiredConcern.id, "match");
      recordPracticeEvent(`${patientLookup[appointmentRequiredConcern.patientId]?.name || appointmentRequiredConcern.patientId} matched to the next available slot.`);
      return;
    }

    const appointmentNeedingContact = appointments.find((appointment) => appointment.patientCommunicationNeeded);

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

    const bookedConcern = concerns.find(
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
      recordPracticeEvent(`${patientLookup[bookedConcern.patientId]?.name || bookedConcern.patientId} patient communication recorded.`);
      return;
    }

    recordPracticeEvent("No urgent practice step is waiting. The board is stable.");
  };

  const addConcern = (concern) => {
    setConcerns((currentConcerns) => [
      ...currentConcerns,
      {
        ...concern,
        id: concern.id || makeId("concern"),
        patientId: concern.patientId || concern.patientName,
        status: concern.status || "Awaiting Review",
        patientMessage: concern.patientMessage || "Staff should record a plain-language explanation before offering an appointment.",
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
        clinicianStep: concern.clinicianStep || "Today's care queue",
        clinicianContact: concern.clinicianContact || {
          method: "Internal care queue",
          sentTo: concern.triage?.route || "Unassigned clinician/team",
          responseChannel: "Today's Care Queue",
          notifiedBy: "Care Navigation Team",
          clarificationContact: "Care Navigation Team",
          escalationRoute: "Return to admin for clarification before clinical action",
          queryStatus: "No clarification requested",
        },
        clinicalNote: concern.clinicalNote || "",
        communication: concern.communication || {
          patientInformed: false,
          by: "",
          channel: concern.confirmationMethod || "Not confirmed",
          at: "",
          confirmationOutstanding: true,
        },
        notes: concern.notes || [
          {
            id: makeId("note"),
            type: "Patient concern",
            text: concern.description || "Concern recorded.",
            author: "Care Navigation Team",
            visibility: "Internal",
            createdAt: new Date().toISOString(),
          },
          {
            id: makeId("note"),
            type: "Communication",
            text: concern.patientMessage || "Patient-facing factual note drafted.",
            author: "Care Navigation Team",
            visibility: "Patient-facing",
            createdAt: new Date().toISOString(),
          },
        ],
        createdAt: concern.createdAt || new Date().toISOString(),
        matchedSlotId: concern.matchedSlotId || "",
        appointmentId: concern.appointmentId || "",
      },
    ]);
  };

  return (
    <div className="app-shell">
      <AppHeader
        registeredAt={headerRegisteredAt}
        seasonLabel={currentSeasonBanner.label}
        seasonImage={currentSeasonBanner.image}
        sortBy={appSortBy}
        onSortChange={setAppSortBy}
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
        <NavLink to={ROUTES.JOURNEY_START} activeClassName="active">
          Begin Care Journey
        </NavLink>
        <NavLink to={ROUTES.PATIENTS} activeClassName="active">
          Patients
        </NavLink>
        <NavLink to={ROUTES.CLINICIANS} activeClassName="active">
          Clinicians
        </NavLink>
        <NavLink to={ROUTES.CLINICIAN_QUEUE} activeClassName="active">
          Today's Care Queue
        </NavLink>
        <NavLink to={ROUTES.ADMINISTRATION} activeClassName="active">
          Administration
        </NavLink>
        <NavLink to={ROUTES.AVAILABILITY} activeClassName="active">
          Availability
        </NavLink>
        <NavLink to={ROUTES.APPOINTMENTS} activeClassName="active">
          Appointments
        </NavLink>
      </nav>

      <main className="workspace">
        <Switch>
          <Route exact path="/">
            <Redirect to={ROUTES.JOURNEY_START} />
          </Route>
          <Route path={ROUTES.PATIENTS}>
            <PatientsPage patients={patients} setPatients={setPatients} />
          </Route>
          <Route path={ROUTES.CLINICIANS}>
            <CliniciansPage clinicians={clinicians} setClinicians={setClinicians} />
          </Route>
          <Route path={ROUTES.JOURNEY_START}>
            <JourneyStart
              activityLog={activityLog}
              onRunPracticeStep={runNextPracticeStep}
              onResetPracticeBoard={resetPracticeBoard}
            />
          </Route>
          <Route path={ROUTES.NEW_CONCERN}>
            <NewConcern
              addConcern={addConcern}
              patients={patients}
              descriptions={MOCK_CONCERN_DESCRIPTIONS}
            />
          </Route>
          <Route path={ROUTES.CONCERNS}>
            <ConcernList
              concerns={concernListItems}
              onAdvanceConcern={advanceConcernJourney}
              onUpdateConcern={updateConcernJourney}
              onAddConcernNote={addConcernNote}
            />
          </Route>
          <Route path={ROUTES.CLINICIAN_QUEUE}>
            <ClinicianQueue
              concerns={concernListItems}
              patientLookup={patientLookup}
              onUpdateClinicianJourney={updateConcernJourney}
              onAddConcernNote={addConcernNote}
            />
          </Route>
          <Route path={ROUTES.ADMINISTRATION}>
            <AdminDashboard
              concerns={concernListItems}
              appointments={appointmentListItems}
              availability={availability}
              patientLookup={patientLookup}
              clinicianLookup={clinicianLookup}
              onAdvanceConcern={advanceConcernJourney}
              onUpdateConcern={updateConcernJourney}
              onUpdateAppointment={updateAppointmentMovement}
              onAddConcernNote={addConcernNote}
              onAddAppointmentNote={addAppointmentNote}
              activityLog={activityLog}
              onRunPracticeStep={runNextPracticeStep}
              onResetPracticeBoard={resetPracticeBoard}
            />
          </Route>
          <Route path={ROUTES.AVAILABILITY}>
            <AvailabilityPage
              availability={availability}
              setAvailability={setAvailability}
              clinicians={clinicians}
              clinicianLookup={clinicianLookup}
            />
          </Route>
          <Route path={ROUTES.APPOINTMENTS}>
            <AppointmentsPage
              appointments={appointments}
              setAppointments={setAppointments}
              patients={patients}
              clinicians={clinicians}
              patientLookup={patientLookup}
              clinicianLookup={clinicianLookup}
              sortBy={appSortBy}
            />
          </Route>
        </Switch>
      </main>

      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-left">
            <strong>Lumen Appointments</strong>
            <span>&copy; 2026 Lumen Appointments</span>
          </div>

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
    </div>
  );
}

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function getSlotStartTime(slot) {
  return slot.startTime || slot.time?.split("-")[0] || "";
}

function AppHeader({ registeredAt, seasonLabel, seasonImage, sortBy, onSortChange }) {
  const activeSortLabel = APP_SORT_OPTIONS.find((option) => option.value === sortBy)?.label || "Next Appointment";

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
      </div>

      <span className="season-chip">{seasonLabel}</span>
    </header>
  );
}

function PatientsPage({ patients, setPatients }) {
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
      setPatients([...patients, { ...form, id: makeId("patient"), registeredAt: getTodayIsoDate() }]);
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
        title={editingId ? "Update Patient" : "Register Patient"}
        subtitle="Capture the minimum details needed for scheduling."
      >
        <form onSubmit={savePatient} className="form-grid">
          <input name="name" value={form.name} onChange={updateForm} placeholder="Full name" required />
          <input name="dob" type="date" value={form.dob} onChange={updateForm} required />
          <input name="contact" value={form.contact} onChange={updateForm} placeholder="Contact number" required />
          <textarea name="notes" value={form.notes} onChange={updateForm} placeholder="Care notes" rows="4" />
          <div className="form-actions">
            <button type="submit" className="btn btn-patient">
              {editingId ? "Save Patient" : "Add Patient"}
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

function AvailabilityPage({ availability, setAvailability, clinicians, clinicianLookup }) {
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
          <p className="command-kicker">Appointment journey</p>
          <h1>Availability</h1>
        </div>
        <Link to={ROUTES.JOURNEY_START} className="btn btn-concern command-button">
          Begin Care Journey
        </Link>
      </div>

      <section className="page-grid">
        <Panel
          title={editingId ? "Update Availability" : "Open Availability"}
          subtitle="Publish clinician slots for booking."
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

        <Panel title="Availability Board" subtitle={`${availability.length} slots`}>
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

function AppointmentsPage({ appointments, setAppointments, patients, clinicians, patientLookup, clinicianLookup, sortBy }) {
  const [form, setForm] = useState({
    patientId: patients[0]?.id || "",
    clinicianId: clinicians[0]?.id || "",
    date: "",
    time: "09:00",
    reason: "",
  });
  const [editingId, setEditingId] = useState(null);
  const sortedAppointments = useMemo(() => {
    const sorted = [...appointments];

    if (sortBy === "registration") {
      sorted.sort((first, second) =>
        (first.patientRegisteredAt || "").localeCompare(second.patientRegisteredAt || "")
      );
    } else if (sortBy === "patientName") {
      sorted.sort((first, second) =>
        (first.patientName || "").localeCompare(second.patientName || "", undefined, { sensitivity: "base" })
      );
    } else {
      sorted.sort((first, second) =>
        `${first.date || ""} ${first.time || ""}`.localeCompare(`${second.date || ""} ${second.time || ""}`)
      );
    }

    return sorted;
  }, [appointments, sortBy]);

  const updateForm = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
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
    <section className="page-grid">
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

      <Panel title="Appointment Schedule" subtitle={`${appointments.length} appointments`}>
        <RecordList
          items={sortedAppointments}
          renderItem={(appointment) => (
            <>
              <strong>{patientLookup[appointment.patientId]?.name || appointment.patientId}</strong>
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
              <div className="record-actions">
                <button type="button" className="action-button" onClick={() => editAppointment(appointment)}>
                  Update
                </button>
                <button type="button" className="action-button danger" onClick={() => deleteAppointment(appointment.id)}>
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
