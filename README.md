# 🩺 EchoScribe: Ambient Clinical AI Scribe & Clinician EHR Portal

> **Next-Generation Ambient Clinical Intelligence**: Transforming doctor-patient conversations into structured, audit-ready, FHIR-compliant Electronic Health Record (EHR) documentation in real-time.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-myecho--scriber.lovable.app-2ea44f?style=for-the-badge&logo=googlechrome&logoColor=white)](https://myecho-scriber.lovable.app)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?logo=react)](https://react.dev/)
[![FHIR R4](https://img.shields.io/badge/Standard-HL7%20FHIR%20R4-E36209)](https://hl7.org/fhir/R4/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---


---

## 🌐 Live Interactive Demo

Test the live clinician portal, ambient dual-stream diarization, live SOAP generation, and FHIR export:
👉 **[https://myecho-scriber.lovable.app](https://myecho-scriber.lovable.app)**

*Experience the schedule queue, patient directory, clinical charts, and live ambient documentation directly in your browser without local installation.*

---

## 🏗️ System Architecture & Data Flow

EchoScribe uses a dual-stream ambient processing pipeline that ingests unscripted conversational audio, diarizes speakers, extracts standardized clinical entities, and synthesizes structured SOAP notes with provenance citations.

```
                   ┌──────────────────────────────────────────┐
                   │    Ambient Room Audio (Clinician/Patient) │
                   └────────────────────┬─────────────────────┘
                                        │
                                        ▼
                   ┌──────────────────────────────────────────┐
                   │    Silero VAD (Voice Activity Detection) │
                   │       Noise Gate & Speech Chunking       │
                   └────────────────────┬─────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        ┌─────────────────────────┐             ┌─────────────────────────┐
        │   OpenAI Whisper v3     │             │     PyAnnote.audio      │
        │   Acoustic Speech-to-   │             │   Speaker Diarization   │
        │   Text Transcription    │             │   (Physician vs Patient)│
        └───────────┬─────────────┘             └───────────┬─────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
                   ┌──────────────────────────────────────────┐
                   │  Transcript Aligner & Domain Segmenter   │
                   │   Tags: HPI, OBJ_EXAM, PLAN, CHITCHAT    │
                   └────────────────────┬─────────────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
        ┌─────────────────────────┐             ┌─────────────────────────┐
        │  BioNLP Entity Linker   │             │  Synthesis LLM Engine   │
        │  • scispaCy / MedCAT    │             │  • Claude 3.5 Sonnet /  │
        │  • SNOMED-CT (Symptoms) │             │    Llama 3.3 / GPT-4o   │
        │  • RxNorm (Medications) │             │  • Provenance Citation  │
        │  • ICD-10 (Diagnoses)   │             │  • Few-Shot SOAP Struct │
        └───────────┬─────────────┘             └───────────┬─────────────┘
                    │                                       │
                    └───────────────────┬───────────────────┘
                                        │
                                        ▼
    ┌───────────────────────────────────────────────────────────────────────────┐
    │                       EchoScribe Clinician Portal                         │
    │  ┌──────────────────────┬───────────────────────┬──────────────────────┐  │
    │  │ Diarized Live Stream │ Traceable SOAP Draft  │ Real-time Telemetry  │  │
    │  │ • Speaker badges     │ • S: HPI & history    │ • Decibel audio bar  │  │
    │  │ • Domain chips       │ • O: Exam findings    │ • E/M 99214 MDM calc │  │
    │  │ • Utterance citation │ • A: Diagnoses & codes│ • Voice modifier     │  │
    │  │ • Inline BioNLP tags │ • P: Prescriptions/PT │ • Patient chart link │  │
    │  └──────────────────────┴───────────────────────┴──────────────────────┘  │
    └─────────────────────────────────────┬─────────────────────────────────────┘
                                          │
                                          ▼
                   ┌──────────────────────────────────────────┐
                   │           EHR Export & Hand-off          │
                   │  • HL7 FHIR R4 Bundle (Composition,      │
                   │    Condition, MedicationRequest)         │
                   │  • EHR REST & Copy-to-Clipboard Flow     │
                   └──────────────────────────────────────────┘
```

---

## 🧠 AI & BioNLP Stack

### 1. Acoustic & Speech Ingestion
* **Whisper (`whisper-large-v3` / OpenAI API)**: High-accuracy ambient speech-to-text resilient to conversational crosstalk, clinical jargon, and room acoustic noise.
* **PyAnnote Audio (`pyannote.audio`)**: Neural speaker diarization classifying audio tracks into distinct speaker embeddings (`Physician` vs. `Patient`).
* **Silero VAD (Voice Activity Detection)**: Real-time silence removal, chunking ambient streams into processed speech bursts.

### 2. Biomedical NLP & Entity Normalization
* **scispaCy (`en_core_sci_md`) & MedCAT**: Biomedical Named Entity Recognition (NER) isolating clinical findings, body sites, and drug mentions.
* **Ontology Mapping**:
  * **SNOMED-CT**: Symptoms and procedures (e.g., *"knee pain"* → `30989003`).
  * **RxNorm**: Medication normalization (e.g., *"ibuprofen"* → Concept `5640`).
  * **ICD-10-CM**: Working diagnoses (e.g., *"osteoarthritis, left knee"* → `M17.12`).

### 3. Clinical Synthesis & Structuring LLM
* **Models**: Claude 3.5 Sonnet / Llama-3.3-70B / GPT-4o.
* **Prompt Engineering (`prompts/soap_structuring.yaml`)**:
  * Filters non-clinical chitchat.
  * Formats unstructured dialogue into canonical **S.O.A.P.** sections.
  * Enforces **traceable provenance** by attaching turn IDs (`["T3", "T4"]`) to every clinical claim.
* **Voice Modifier Agent**: Clinician voice commands (*"Echo, change left knee to right"*) dynamically rewrite claims and refresh mapped coding.

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
source venv/bin/activate  # On Windows: venv\Scriptsctivate
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
