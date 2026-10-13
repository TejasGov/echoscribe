from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class TranscriptTurn(BaseModel):
    index: int
    speaker: Literal["physician", "patient", "unknown"]
    speaker_name: Optional[str] = None
    timestamp_start: float
    timestamp_end: float
    text: str
    domain_tag: Optional[str] = Field(None, description="HPI, OBJ_EXAM, PLAN, MED_HX, SMALLTALK")

class MedicalEntity(BaseModel):
    mention: str
    standard_name: str
    ontology: Literal["ICD-10", "SNOMED-CT", "RxNorm", "LOINC"]
    code: str
    confidence: float
    source_turn_index: int

class HPIItem(BaseModel):
    fact: str
    source_transcript_indices: List[int]

class PhysicalExamItem(BaseModel):
    system: str
    finding: str
    source_transcript_indices: List[int]

class AssessmentItem(BaseModel):
    clinical_impression: str
    status: Literal["new", "stable", "worsening", "improving", "resolved"]
    differential_or_confirmed: Literal["confirmed", "suspected"]
    source_transcript_indices: List[int]
    linked_codes: List[MedicalEntity] = []

class PlanItem(BaseModel):
    category: Literal["medication", "imaging", "lab", "referral", "patient_education"]
    action_item: str
    details: Optional[str] = None
    source_transcript_indices: List[int]

class SoapNote(BaseModel):
    chief_complaint: str
    history_of_present_illness: List[HPIItem]
    review_of_systems: dict[str, List[str]] = Field(default_factory=dict)
    physical_exam: List[PhysicalExamItem]
    assessment: List[AssessmentItem]
    plan: List[PlanItem]
    raw_citations_map: dict[str, List[int]] = Field(default_factory=dict)
