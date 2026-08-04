# Database Schema (Mock)

## clinicians
id TEXT PRIMARY KEY
name TEXT
role TEXT
specialty TEXT
contact TEXT
registrationId TEXT NULL

## patients
id TEXT PRIMARY KEY
name TEXT
dob DATE
contact TEXT
notes TEXT

## availability
id TEXT PRIMARY KEY
clinicianId TEXT REFERENCES clinicians(id)
date DATE
time TEXT
status TEXT

## appointments
id TEXT PRIMARY KEY
patientId TEXT REFERENCES patients(id)
clinicianId TEXT REFERENCES clinicians(id)
date DATE
time TEXT
reason TEXT

## contacts
id TEXT PRIMARY KEY
name TEXT
relationship TEXT
phone TEXT
notes TEXT
