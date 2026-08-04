import React, { useState } from "react";
import { Switch, Route, Redirect, NavLink } from "react-router-dom";
import "./App.css";
import Patients from "./components/Patients/Patients";
import Clinicians from "./components/Clinicians/Clinicians";
import Availability from "./components/Availability/Availability";

import { AppointmentsPage } from "./containers/appointmentsPage/AppointmentsPage";
import { ContactsPage } from "./containers/contactsPage/ContactsPage";

function App() {
  const [appointments, setAppointments] = useState([]);
  const [contacts, setContacts] = useState([]);

  const ROUTES = {
    CONTACTS: "/contacts",
    APPOINTMENTS: "/appointments",
    PATIENTS: "/patients",
    CLINICIANS: "/clinicians",
    AVAILABILITY: "/availability",
  };

  const addAppointment = (title, contact, date, time) => {
    setAppointments([
      ...appointments,
      {
        title: title,
        contact: contact,
        date: date,
        time: time,
      },
    ]);
  };

  const addContact = (name, phone, email) => {
    setContacts([
      ...contacts,
      {
        name: name,
        phone: phone,
        email: email,
      },
    ]);
  };

  return (
    <>
    <img
      src="/serenecare-banner.png"
      alt="SereneCare Sync Banner"
      className="serenecare-banner"
      />

    <nav>
      <NavLink to={ROUTES.CONTACTS} activeClassName="active">
        Contacts
      </NavLink>

      <NavLink to={ROUTES.APPOINTMENTS} activeClassName="active">
        Appointments
      </NavLink>

      <NavLink to={ROUTES.PATIENTS} activeClassName="active">
        Patients
      </NavLink>

      <NavLink to={ROUTES.CLINICIANS} activeClassName="active">
        Clinicians
      </NavLink>

      <NavLink to={ROUTES.AVAILABILITY} activeClassName="active">
        Availability
      </NavLink>
    </nav>

      <main>
        <Switch>
          <Route exact path="/">
            <Redirect to={ROUTES.CONTACTS} />
          </Route>
          <Route path={ROUTES.CONTACTS}>
            <ContactsPage contacts={contacts} addContact={addContact} />
          </Route>
          <Route path={ROUTES.APPOINTMENTS}>
            <AppointmentsPage
              appointments={appointments}
              addAppointment={addAppointment}
              contacts={contacts}
            />
          </Route>
          <Route path={ROUTES.PATIENTS}>
            <Patients />
          </Route>
          <Route path={ROUTES.CLINICIANS}>
            <Clinicians />
          </Route>
          <Route path={ROUTES.AVAILABILITY}>
            <Availability />
          </Route>

        </Switch>
      </main>
    </>
  );
}

export default App;
