export type Speaker = "physician" | "patient";
export type Domain = "HPI" | "OBJ_EXAM" | "PLAN" | "CHITCHAT";
export type CodeSystem = "ICD-10" | "SNOMED-CT" | "RxNorm";
export interface Entity { system: CodeSystem; code: string; display: string }
export interface Turn { id: string; speaker: Speaker; text: string; domain: Domain; entities: Entity[]; t: string }
export type Section = "S" | "O" | "A" | "P";
export interface Claim { id: string; section: Section; text: string; original?: string; sources: string[]; entities: Entity[]; edited?: "manual" | "voice" }

export const SYSTEM_URI: Record<CodeSystem, string> = {
  "ICD-10": "http://hl7.org/fhir/sid/icd-10-cm",
  "SNOMED-CT": "http://snomed.info/sct",
  RxNorm: "http://www.nlm.nih.gov/research/umls/rxnorm",
};

const knee = { system: "SNOMED-CT", code: "30989003", display: "Knee pain" } as const;
const oa = { system: "ICD-10", code: "M17.12", display: "Unilateral primary osteoarthritis, left knee" } as const;
const ibu = { system: "RxNorm", code: "5640", display: "Ibuprofen" } as const;
const effusion = { system: "SNOMED-CT", code: "202381003", display: "Effusion of joint of knee" } as const;
const crep = { system: "SNOMED-CT", code: "53160003", display: "Crepitus of joint" } as const;
const xray = { system: "SNOMED-CT", code: "74016001", display: "X-ray of knee" } as const;
const pt = { system: "SNOMED-CT", code: "91251008", display: "Physical therapy procedure" } as const;

export const SCRIPT: { turn: Turn; claims: Omit<Claim, "id">[] }[] = [
  { turn: { id: "T1", t: "00:02", speaker: "physician", domain: "CHITCHAT", entities: [], text: "Morning, Mr. Alvarez. How was the drive in? Traffic was awful today." }, claims: [] },
  { turn: { id: "T2", t: "00:07", speaker: "patient", domain: "CHITCHAT", entities: [], text: "Not too bad, I left early. The Mariners lost again though." }, claims: [] },
  { turn: { id: "T3", t: "00:15", speaker: "patient", domain: "HPI", entities: [knee], text: "So my left knee has been aching for about three weeks, worse when I take the stairs." },
    claims: [{ section: "S", text: "58M presents with 3 weeks of left knee pain, aggravated by stair climbing.", sources: ["T3"], entities: [knee] }] },
  { turn: { id: "T4", t: "00:26", speaker: "patient", domain: "HPI", entities: [ibu], text: "It's stiff in the morning for maybe twenty minutes. I've been taking ibuprofen, it helps a little." },
    claims: [{ section: "S", text: "Morning stiffness ~20 minutes. Partial relief with OTC ibuprofen.", sources: ["T4"], entities: [ibu] }] },
  { turn: { id: "T5", t: "00:38", speaker: "patient", domain: "HPI", entities: [], text: "No injury that I remember. No fever, it doesn't lock or give way." },
    claims: [{ section: "S", text: "Denies trauma, fever, locking, or instability.", sources: ["T5"], entities: [] }] },
  { turn: { id: "T6", t: "00:51", speaker: "physician", domain: "OBJ_EXAM", entities: [effusion], text: "Looking at the left knee, there's a small effusion, no warmth or erythema." },
    claims: [{ section: "O", text: "Left knee: small effusion; no warmth or erythema.", sources: ["T6"], entities: [effusion] }] },
  { turn: { id: "T7", t: "01:04", speaker: "physician", domain: "OBJ_EXAM", entities: [crep], text: "Range of motion zero to one-ten, crepitus on flexion, ligaments stable, McMurray negative." },
    claims: [{ section: "O", text: "ROM 0–110°, crepitus with flexion. Ligaments stable; McMurray negative.", sources: ["T7"], entities: [crep] }] },
  { turn: { id: "T8", t: "01:18", speaker: "physician", domain: "PLAN", entities: [oa], text: "This looks most consistent with osteoarthritis of the left knee." },
    claims: [{ section: "A", text: "Primary osteoarthritis, left knee, likely.", sources: ["T8", "T4", "T7"], entities: [oa] }] },
  { turn: { id: "T9", t: "01:29", speaker: "patient", domain: "CHITCHAT", entities: [], text: "Ah, getting old I guess." }, claims: [] },
  { turn: { id: "T10", t: "01:34", speaker: "physician", domain: "PLAN", entities: [xray, pt], text: "Let's get standing x-rays of the knee and start physical therapy twice a week." },
    claims: [
      { section: "P", text: "Weight-bearing X-ray, left knee.", sources: ["T10"], entities: [xray] },
      { section: "P", text: "Refer to physical therapy, 2x/week.", sources: ["T10"], entities: [pt] },
    ] },
  { turn: { id: "T11", t: "01:46", speaker: "physician", domain: "PLAN", entities: [], text: "Follow up with me in six weeks, sooner if it swells or gets hot." },
    claims: [{ section: "P", text: "Follow up in 6 weeks; return sooner for swelling or warmth.", sources: ["T11"], entities: [] }] },
];

export const RXNORM_LOOKUP: Record<string, Entity> = {
  naproxen: { system: "RxNorm", code: "198013", display: "Naproxen 500 MG Oral Tablet" },
  ibuprofen: { system: "RxNorm", code: "197806", display: "Ibuprofen 600 MG Oral Tablet" },
  acetaminophen: { system: "RxNorm", code: "198440", display: "Acetaminophen 500 MG Oral Tablet" },
  meloxicam: { system: "RxNorm", code: "311486", display: "Meloxicam 15 MG Oral Tablet" },
};

const SECTION_KEY: Record<string, Section> = { subjective: "S", hpi: "S", exam: "O", objective: "O", assessment: "A", plan: "P" };

export function applyVoiceCommand(cmd: string, claims: Claim[]): { claims: Claim[]; log: string[] } {
  let next = claims.map((c) => ({ ...c }));
  const log: string[] = [];
  const body = cmd.replace(/^\s*echo[,:]?\s*/i, "");
  for (const part of body.split(/\s+and\s+(?=add|change|replace|remove)/i)) {
    const ch = part.match(/(?:change|replace)\s+(.+?)\s+(?:to|with)\s+(.+?)(?:\s+in\s+(?:the\s+)?(\w+))?\.?$/i);
    const add = part.match(/add\s+(.+?)\s+to\s+(?:the\s+)?(\w+)\.?$/i);
    if (ch) {
      const from = ch[1] ?? "", to = ch[2] ?? "", sec = ch[3];
      const target = sec ? SECTION_KEY[sec.toLowerCase()] : undefined;
      const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      let n = 0;
      next = next.map((c) => {
        if ((target && c.section !== target) || !re.test(c.text)) return c;
        n++;
        return { ...c, original: c.original ?? c.text, text: c.text.replace(new RegExp(re.source, "gi"), to), edited: "voice" };
      });
      // also fix laterality in shorthand ("Left knee" vs "left knee") handled by case-insensitive regex
      log.push(n ? `Changed "${from}" → "${to}" in ${n} ${target ?? "note"} claim(s)` : `No match for "${from}"`);
    } else if (add) {
      const what = add[1] ?? "", sec = add[2] ?? "plan";
      const section = SECTION_KEY[sec.toLowerCase()] ?? "P";
      const drug = Object.keys(RXNORM_LOOKUP).find((k) => what.toLowerCase().includes(k));
      const text = drug ? `Start ${what.trim()} PO BID with food, PRN pain.` : what.trim().replace(/^./, (s) => s.toUpperCase()) + ".";
      next.push({ id: `V${Date.now()}${Math.random().toString(36).slice(2, 5)}`, section, text, sources: [], entities: drug ? [RXNORM_LOOKUP[drug]!] : [], edited: "voice" });
      log.push(`Added to ${section}: ${text}`);
    } else log.push(`Couldn't parse: "${part}"`);
  }
  return { claims: next, log };
}

export function buildFhirBundle(claims: Claim[], turns: Turn[]) {
  const now = new Date().toISOString();
  const pid = "patient-alvarez", eid = "encounter-1";
  const coding = (e: Entity) => ({ system: SYSTEM_URI[e.system], code: e.code, display: e.display });
  const sec = (s: Section, title: string, loinc: string) => ({
    title, code: { coding: [{ system: "http://loinc.org", code: loinc }] },
    text: { status: "generated", div: `<div xmlns="http://www.w3.org/1999/xhtml">${claims.filter((c) => c.section === s).map((c) => `<p>${c.text}</p>`).join("")}</div>` },
  });
  const conditions = claims.flatMap((c) => c.section === "A" ? c.entities.filter((e) => e.system === "ICD-10") : []).map((e, i) => ({
    fullUrl: `urn:uuid:condition-${i}`,
    resource: { resourceType: "Condition", clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: "active" }] }, code: { coding: [coding(e)], text: e.display }, subject: { reference: `Patient/${pid}` }, encounter: { reference: `Encounter/${eid}` }, recordedDate: now },
  }));
  const meds = claims.flatMap((c) => c.section === "P" ? c.entities.filter((e) => e.system === "RxNorm") : []).map((e, i) => ({
    fullUrl: `urn:uuid:medreq-${i}`,
    resource: { resourceType: "MedicationRequest", status: "draft", intent: "order", medicationCodeableConcept: { coding: [coding(e)], text: e.display }, subject: { reference: `Patient/${pid}` }, encounter: { reference: `Encounter/${eid}` }, authoredOn: now },
  }));
  const provenance = claims.filter((c) => c.sources.length).map((c, i) => ({
    fullUrl: `urn:uuid:provenance-${i}`,
    resource: { resourceType: "Provenance", target: [{ reference: "urn:uuid:composition" }], recorded: now, agent: [{ who: { display: "EchoScribe ambient AI" } }],
      entity: c.sources.map((s) => ({ role: "source", what: { display: `${s}: ${turns.find((t) => t.id === s)?.text ?? ""}` } })),
      extension: [{ url: "urn:echoscribe:claim", valueString: c.text }] },
  }));
  return {
    resourceType: "Bundle", type: "document", timestamp: now,
    entry: [
      { fullUrl: "urn:uuid:composition", resource: { resourceType: "Composition", status: "preliminary", type: { coding: [{ system: "http://loinc.org", code: "11506-3", display: "Progress note" }] }, subject: { reference: `Patient/${pid}` }, encounter: { reference: `Encounter/${eid}` }, date: now, author: [{ display: "Dr. Priya Shah, MD" }], title: "Ambient SOAP note",
        section: [sec("S", "Subjective", "61150-9"), sec("O", "Objective", "61149-1"), sec("A", "Assessment", "51848-0"), sec("P", "Plan", "18776-5")] } },
      { fullUrl: `urn:uuid:${pid}`, resource: { resourceType: "Patient", id: pid, name: [{ family: "Alvarez", given: ["Miguel"] }], gender: "male" } },
      { fullUrl: `urn:uuid:${eid}`, resource: { resourceType: "Encounter", id: eid, status: "in-progress", class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: "AMB" }, subject: { reference: `Patient/${pid}` } } },
      ...conditions, ...meds, ...provenance,
    ],
  };
}
