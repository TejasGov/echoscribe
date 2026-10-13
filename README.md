# 🩺 EchoScribe: Ambient Clinical AI Scribe & Clinician EHR Portal

> **Next-Generation Ambient Clinical Intelligence**: Transforming doctor-patient conversations into structured, audit-ready, FHIR-compliant Electronic Health Record (EHR) documentation in real-time.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev/)
[![FHIR R4](https://img.shields.io/badge/Standard-HL7%20FHIR%20R4-E36209)](https://hl7.org/fhir/R4/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📁 Repository Structure

```
echoscribe/
├── api/                             # FastAPI Backend & Streaming Engine
│   ├── main.py                      # WebSocket stream & REST health endpoints
│   ├── schemas.py                   # Pydantic v2 schemas for SOAP, audio & telemetry
│   └── ...
├── prompts/                         # Production Clinical Prompts
│   └── soap_structuring.yaml        # SOAP transformation prompt with few-shot guidance
├── frontend/                        # Enterprise Clinician Portal & Ambient Scribe UI
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/AppHeader.tsx # Enterprise clinical top navigation bar
│   │   │   └── scribe/EchoScribe.tsx# Ambient scribe, waveform, SOAP editor, E/M coding
│   │   ├── pages/
│   │   │   ├── SchedulePage.tsx     # Today's clinic schedule & encounter launcher
│   │   │   ├── PatientsPage.tsx     # Searchable patient directory & panel overview
│   │   │   ├── PatientChartPage.tsx # Patient chart: vitals, meds, problem list, past visits
│   │   │   └── EncounterPage.tsx    # Live ambient clinical documentation encounter
│   │   ├── lib/
│   │   │   ├── encounter.ts         # Transcript script, FHIR R4 generator & voice modifier
│   │   │   └── patients.ts          # Clinical patient records & demographics
│   │   ├── App.tsx                  # Client routing (/ , /patients, /encounter)
│   │   └── styles.css               # Clinical slate/navy styling & typography
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml               # Multi-container orchestration (api + frontend)
├── requirements.txt                 # Backend Python dependencies
└── README.md
```

---

## 🏥 Clinician Portal Features

1. **Today's Schedule (`/`)**:
   - Clinic dashboard with real-time appointment queue, visit reasons, and status badges.
   - Quick KPI telemetry: scheduled encounters, completed visits, pending sign-offs, average note generation time.
   - One-click encounter launcher ("Start visit" / "Resume").

2. **Patient Directory (`/patients`)**:
   - Searchable directory filtering by patient name and MRN.
   - Direct status view, DOB, payer identification, and highlighted allergy warnings.

3. **Patient Chart (`/patients/:patientId`)**:
   - Comprehensive chart layout displaying demographic banner, latest vitals (BP, HR, Temp, SpO₂, BMI), active medication list, ICD-10 coded problem list, and past visit history with CPT codes.
   - Direct shortcut to initiate an ambient documentation visit for the selected patient.

4. **Ambient Scribe Encounter (`/encounter`)**:
   - Pre-recording consent checkpoint requiring clinician and patient verbal verification.
   - Audio telemetry bar with live decibel readout and real-time waveform visualization.
   - Diarized transcript feed with timestamps, speaker labels (Dr. Shah vs Patient), and clinical domain categorization (`HPI`, `EXAM`, `PLAN`, `SOCIAL`).
   - Bidirectional transcript-to-SOAP claim citations with visual provenance highlight.
   - Real-time E/M 99214 Medical Decision Making complexity estimator.
   - Hands-free voice modifier engine (*"Echo, change left knee to right knee..."*).
   - HL7 FHIR R4 document bundle exporter (Composition, Condition, MedicationRequest, Provenance).

---

## 🚀 Quickstart Guide

### Option 1: Docker Compose (Full Stack)

```bash
docker-compose up --build
```
- Frontend portal will be available at: `http://localhost:3000`
- FastAPI backend documentation: `http://localhost:8000/docs`

### Option 2: Local Development

#### 1. Backend (FastAPI)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn api.main:app --reload --port 8000
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the clinician portal.

---

## 🔒 Clinical Ethics & Safety
- **Anti-Hallucination Guardrails**: Unverified claims not present in the ambient transcript are strictly excluded from objective documentation.
- **Traceable Provenance**: Every generated line of the SOAP note links directly to its source utterance timestamp.
- **Safe Correction Loops**: Clinicians retain 100% edit authority via direct manual edit or voice-driven modifiers.
- **Immediate Data Deletion**: Dedicated "Stop & delete" option to purge audio transcripts and active session cache upon request.

---

## 📜 License & Compliance
Distributed under the MIT License. Designed strictly adhering to HIPAA privacy controls and HL7 FHIR Interoperability standards.
