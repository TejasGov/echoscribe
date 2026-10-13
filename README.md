# 🩺 EchoScribe: Ambient Clinical AI Scribe & Real-Time SOAP Engine

> **Next-Generation Ambient Clinical Intelligence**: Transforming chaotic doctor-patient conversations into structured, audit-ready, FHIR-compliant Electronic Health Record (EHR) documentation in real-time.

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?logo=react)](https://react.dev/)
[![FHIR R4](https://img.shields.io/badge/Standard-HL7%20FHIR%20R4-E36209)](https://hl7.org/fhir/R4/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 💡 The Problem: The Clinical Documentation Crisis
- **Physician Burnout**: Clinicians spend upwards of **2 hours on EHR documentation for every 1 hour of direct patient care** ("pajama time").
- **Cognitive Detachment**: Typing on computers breaks empathetic eye contact between doctors and vulnerable patients.
- **Lost Revenue & Coding Inaccuracies**: Up to **15% of clinical billings are delayed or down-coded** due to omitted details or missing ICD-10 specificity.

---

## ⚡ The Solution: EchoScribe Ambient Intelligence
**EchoScribe** operates silently in the clinic room. Using ambient room microphones, it captures non-dictated, conversational speech, strips away chit-chat, extracts clinical entities, maps them to formal medical ontologies (ICD-10-CM, SNOMED-CT, RxNorm), and builds a real-time, verifiable SOAP note with exact audio-timestamp provenance.

---

## 🏗️ System Architecture & Dual-Stream Dataflow



---

## 🧬 BioNLP & Ontological Normalization Layer

Raw dialogue regularly hides clinical diagnoses beneath colloquial idioms. EchoScribe routes transcribed entities through an ontological normalization layer:

| Conversational Utterance | Detected Entity Type | Mapped CUI | Target Medical Ontology |
|---|---|---|---|
| *"Sugar issue"* | Disorder |  | **ICD-10-CM E11.9** (Type 2 diabetes) / **SNOMED-CT 44054006** |
| *"Water pill"* | Medication |  | **RxNorm 4603** (Furosemide 40mg) |
| *"High BP"* | Finding |  | **ICD-10-CM I10** (Essential hypertension) |
| *"Puffed up ankles"* | Symptom |  | **SNOMED-CT 267038008** (Edema of lower extremity) |

---

## 💻 Tech Stack Breakdown

### Frontend (Clinical Dashboard)
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **Audio Viz**: Canvas Web Audio API Analyzer for real-time waveform inspection
- **Icons**: Lucide React

### Backend & Audio Streaming
- **Engine**: Python 3.11 + FastAPI
- **WebSockets**: Asynchronous bidirectional audio & live transcript streaming
- **Schema Validation**: Pydantic v2 with strict JSON-Schema generation
- **Containerization**: Docker & Docker Compose

### AI & Speech Infrastructure
- **VAD**: Silero Voice Activity Detector
- **ASR**: Whisper v3 Turbo / Deepgram Nova-2 Medical
- **Diarization**: PyAnnote Audio 3.1 (ECAPA-TDNN embeddings)
- **Medical Ontologies**: UMLS REST API, scispaCy, MedCAT
- **Orchestration**: LangGraph / Structured LLM Pipelines (Claude 3.5 Sonnet / GPT-4o)

---

## 🎯 Hackathon Highlights & Competitive Moat

1. **Zero Extrapolation / Anti-Hallucination Guardrails**:
   EchoScribe rejects common LLM pitfalls. If a doctor never verbalized an abdominal palpation, the Objective section omits it—avoiding fraudulent medical billing liability.
2. **Clickable Provenance Citations (, )**:
   Every claim in the SOAP draft anchors directly to a transcript turn and audio timestamp. Clinicians can audit findings in under 2 seconds.
3. **Voice Modifier Engine**:
   Physicians can issue fast hands-free corrections: *"Echo, change left knee to right knee in exam and add 500mg naproxen to plan"*.
4. **Instant FHIR R4 Export**:
   One-click generation of validated HL7 FHIR , , and  payloads ready for EHR integration.

---

## 🚀 Quickstart Guide

### Prerequisites
- Docker & Docker Compose installed
- Python 3.11+
- Node.js 20+

### 1. Backend Setup


### 2. Docker Compose

API Swagger documentation is live at .

---

## 📄 License & Compliance
Distributed under the MIT License. Designed strictly adhering to HIPAA privacy controls and HL7 FHIR Interoperability standards.
