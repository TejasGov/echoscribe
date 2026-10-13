# EchoScribe 🩺🎙️

Ambient clinical AI scribe designed for high-fidelity clinical documentation, real-time speaker diarization, and automated SOAP note generation with ICD-10/SNOMED-CT entity linking.

## 🚀 Key Architectural Pillars

1. **Dual-Stream Ambient Intake**:
   - WebRTC / WebSocket 16kHz audio stream.
   - VAD-based chunking with speaker diarization (Physician vs. Patient discrimination).
   - Domain tagging for HPI, Physical Exam, and Chit-chat filtering.

2. **BioNLP & Entity Normalization**:
   - Named Entity Recognition (NER) and Entity Linking (NEL) mapping colloquial dialogue to UMLS CUIs, ICD-10-CM, SNOMED-CT, and RxNorm.
   - Provenance tracking with bidirectional source transcript citations.

3. **Clinician-in-the-Loop Feedback**:
   - In-line diffing, interactive terminology chips, and natural language voice modifier commands.

4. **FHIR R4 Interoperability**:
   - Ready-to-export JSON bundles for EHR integration (Epic, Cerner, AthenaHealth).

## 🛠️ Quick Start


