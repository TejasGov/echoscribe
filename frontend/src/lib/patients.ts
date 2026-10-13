export interface Patient {
  id: string; name: string; initials: string; age: number; sex: "Male" | "Female"; dob: string; mrn: string;
  payer: string; allergies: string; reason: string; time: string; status: "Checked in" | "Roomed" | "Scheduled" | "Completed" | "In visit";
  problems: { code: string; display: string }[]; meds: string[];
  vitals: { bp: string; hr: number; temp: string; spo2: number; bmi: number };
  visits: { date: string; type: string; provider: string; cpt: string }[];
}

export const PATIENTS: Patient[] = [
  { id: "alvarez", name: "Alvarez, Miguel", initials: "MA", age: 58, sex: "Male", dob: "03/14/1968", mrn: "004-219-771", payer: "Aetna PPO", allergies: "NKDA", reason: "Left knee pain, 3 wks", time: "08:30", status: "In visit",
    problems: [{ code: "I10", display: "Essential hypertension" }, { code: "E78.5", display: "Hyperlipidemia, unspecified" }],
    meds: ["Lisinopril 10 mg PO daily", "Atorvastatin 20 mg PO nightly", "Ibuprofen 200 mg PO PRN"],
    vitals: { bp: "138/84", hr: 76, temp: "98.4 °F", spo2: 98, bmi: 28.1 },
    visits: [{ date: "06/02/2026", type: "Annual wellness", provider: "P. Shah, MD", cpt: "99397" }, { date: "11/18/2025", type: "Office visit", provider: "P. Shah, MD", cpt: "99213" }] },
  { id: "okafor", name: "Okafor, Adaeze", initials: "AO", age: 42, sex: "Female", dob: "09/02/1984", mrn: "004-118-302", payer: "BCBS HMO", allergies: "Penicillin", reason: "Migraine follow-up", time: "09:00", status: "Roomed",
    problems: [{ code: "G43.909", display: "Migraine, unspecified" }], meds: ["Sumatriptan 50 mg PO PRN", "Propranolol 40 mg PO BID"],
    vitals: { bp: "118/72", hr: 64, temp: "98.1 °F", spo2: 99, bmi: 23.4 },
    visits: [{ date: "07/21/2026", type: "Office visit", provider: "P. Shah, MD", cpt: "99214" }] },
  { id: "lindqvist", name: "Lindqvist, Erik", initials: "EL", age: 71, sex: "Male", dob: "01/27/1955", mrn: "003-877-145", payer: "Medicare A/B", allergies: "Sulfa", reason: "T2DM, A1c review", time: "09:30", status: "Checked in",
    problems: [{ code: "E11.9", display: "Type 2 diabetes mellitus" }, { code: "N18.3", display: "CKD stage 3" }], meds: ["Metformin 500 mg PO BID", "Empagliflozin 10 mg PO daily"],
    vitals: { bp: "132/80", hr: 70, temp: "97.9 °F", spo2: 97, bmi: 30.6 },
    visits: [{ date: "07/08/2026", type: "Office visit", provider: "P. Shah, MD", cpt: "99214" }] },
  { id: "nguyen", name: "Nguyen, Linh", initials: "LN", age: 29, sex: "Female", dob: "05/11/1997", mrn: "005-002-918", payer: "United Choice", allergies: "NKDA", reason: "New patient, establish care", time: "10:15", status: "Scheduled",
    problems: [], meds: [], vitals: { bp: "—", hr: 0, temp: "—", spo2: 0, bmi: 0 }, visits: [] },
  { id: "brooks", name: "Brooks, Harold", initials: "HB", age: 64, sex: "Male", dob: "12/30/1961", mrn: "002-540-667", payer: "Cigna PPO", allergies: "Latex", reason: "Post-op check, R shoulder", time: "07:45", status: "Completed",
    problems: [{ code: "M75.101", display: "Rotator cuff tear, right" }], meds: ["Acetaminophen 500 mg PO q6h PRN"],
    vitals: { bp: "126/78", hr: 68, temp: "98.0 °F", spo2: 98, bmi: 26.2 },
    visits: [{ date: "10/13/2026", type: "Post-op", provider: "P. Shah, MD", cpt: "99024" }] },
];

export const getPatient = (id: string) => PATIENTS.find((p) => p.id === id);
