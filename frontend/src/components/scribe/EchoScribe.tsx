import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Mic, Pause, Play, RotateCcw, Download, Filter, Trash2, Copy, Check, ChevronDown, Keyboard, ShieldCheck, CornerDownLeft } from "lucide-react";
import { SCRIPT, applyVoiceCommand, buildFhirBundle, type Claim, type Entity, type Section, type Turn } from "@/lib/encounter";

const DOMAIN: Record<string, { label: string; cls: string }> = {
  HPI: { label: "HPI", cls: "text-hpi border-hpi/40" },
  OBJ_EXAM: { label: "EXAM", cls: "text-obj border-obj/40" },
  PLAN: { label: "PLAN", cls: "text-plan border-plan/40" },
  CHITCHAT: { label: "SOCIAL", cls: "text-muted-foreground border-border" },
};
const SECTIONS: { key: Section; title: string }[] = [
  { key: "S", title: "Subjective" }, { key: "O", title: "Objective" }, { key: "A", title: "Assessment" }, { key: "P", title: "Plan" },
];
const DEFAULT_CMD = "Echo, change left knee to right knee in exam and add 500mg naproxen to plan";
const NBARS = 120;
const SHORTCUTS: [string, string][] = [["Space", "Record / pause"], ["F", "Toggle social filter"], ["/", "Focus voice command"], ["E", "Export FHIR R4"], ["C", "Copy note"], ["⇧ Del", "Stop & delete transcript"], ["Esc", "Clear selection"], ["?", "Shortcuts"]];

const Kbd = ({ children }: { children: React.ReactNode }) => (
  <kbd className="inline-grid min-w-[18px] place-items-center rounded-[3px] border border-b-2 bg-card px-1 font-mono text-[10px] font-medium leading-4 text-muted-foreground">{children}</kbd>
);

function Code({ e, onClick, active }: { e: Entity; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={(ev) => { ev.stopPropagation(); onClick(); }} title={e.display}
      className={`inline-flex h-[18px] items-center gap-1 rounded-[3px] border px-1 font-mono text-[10.5px] leading-none transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground hover:border-primary/60"}`}>
      <span className={active ? "opacity-80" : "text-muted-foreground"}>{e.system === "SNOMED-CT" ? "SCT" : e.system === "ICD-10" ? "ICD" : "RX"}</span>{e.code}
    </button>
  );
}

const Btn = ({ children, variant = "default", className = "", ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "primary" | "danger" | "ghost" }) => {
  const v = { default: "border bg-card hover:bg-accent text-foreground", primary: "border border-primary bg-primary text-primary-foreground hover:bg-primary/90", danger: "border border-destructive/40 bg-card text-destructive hover:bg-destructive/5", ghost: "text-muted-foreground hover:bg-accent hover:text-foreground" }[variant];
  return <button {...p} className={`inline-flex h-7 items-center gap-1.5 rounded-[4px] px-2.5 text-[12.5px] font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 ${v} ${className}`}>{children}</button>;
};

export function EchoScribe() {
  const [idx, setIdx] = useState(0);
  const [recording, setRecording] = useState(false);
  const [consent, setConsent] = useState<null | { at: string }>(null);
  const [askConsent, setAskConsent] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [ack, setAck] = useState({ physician: false, patient: false });
  const [claims, setClaims] = useState<Claim[]>([]);
  const [hideChat, setHideChat] = useState(false);
  const [focusTurn, setFocusTurn] = useState<string | null>(null);
  const [focusClaim, setFocusClaim] = useState<string | null>(null);
  const [entity, setEntity] = useState<Entity | null>(null);
  const [cmd, setCmd] = useState(DEFAULT_CMD);
  const [log, setLog] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);
  const [help, setHelp] = useState(false);
  const [bars, setBars] = useState<number[]>(Array(NBARS).fill(0.04));
  const [db, setDb] = useState(-60);
  const [elapsed, setElapsed] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const cmdRef = useRef<HTMLInputElement>(null);

  const turns: Turn[] = useMemo(() => SCRIPT.slice(0, idx).map((s) => s.turn), [idx]);
  const ended = idx >= SCRIPT.length;

  useEffect(() => {
    if (!recording) return;
    if (ended) { setRecording(false); return; }
    const t = setTimeout(() => {
      const step = SCRIPT[idx]!;
      setIdx((i) => i + 1);
      setClaims((c) => [...c, ...step.claims.map((cl, k) => ({ ...cl, id: `${step.turn.id}-${k}` }))]);
    }, 1900);
    return () => clearTimeout(t);
  }, [recording, idx, ended]);

  useEffect(() => {
    if (!recording) { setBars((b) => b.map(() => 0.04)); setDb(-60); return; }
    let phase = 0;
    const t = setInterval(() => {
      phase += 0.35;
      const env = 0.45 + 0.4 * Math.abs(Math.sin(phase * 0.6)) + Math.random() * 0.15;
      setBars((b) => [...b.slice(1), Math.min(1, env * (0.3 + Math.random() * 0.7))]);
      setDb(Math.round(-42 + env * 30 + Math.random() * 4));
    }, 70);
    const c = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { clearInterval(t); clearInterval(c); };
  }, [recording]);

  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" }); }, [idx]);

  const toggleRec = useCallback(() => {
    if (ended) return;
    if (recording) setRecording(false); else if (consent) setRecording(true); else setAskConsent(true);
  }, [ended, recording, consent]);
  const jumpToTurn = (id: string) => { setFocusTurn(id); setFocusClaim(null); document.getElementById(`turn-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); };
  const reset = () => { setRecording(false); setIdx(0); setClaims([]); setLog([]); setFocusTurn(null); setFocusClaim(null); setElapsed(0); };
  const discard = () => { reset(); setConsent(null); setAck({ physician: false, patient: false }); setConfirmDiscard(false); };
  const runCmd = () => { const r = applyVoiceCommand(cmd, claims); setClaims(r.claims); setLog((l) => [...r.log, ...l]); };
  const saveEdit = (id: string, text: string) => {
    setClaims((cs) => cs.map((c) => c.id === id && c.text !== text ? { ...c, original: c.original ?? c.text, text, edited: "manual" } : c));
    setEditing(null);
  };
  const noteText = (s?: Section) => SECTIONS.filter((x) => !s || x.key === s).map((x) => `${x.title.toUpperCase()}\n${claims.filter((c) => c.section === x.key).map((c) => `- ${c.text}`).join("\n")}`).join("\n\n");
  const copy = (s?: Section) => { void navigator.clipboard?.writeText(noteText(s)); setCopied(true); setTimeout(() => setCopied(false), 1400); };
  const exportFhir = useCallback(() => {
    if (!claims.length) return;
    const blob = new Blob([JSON.stringify(buildFhirBundle(claims, turns), null, 2)], { type: "application/fhir+json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "echoscribe-encounter-bundle.json"; a.click();
  }, [claims, turns]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") { if (e.key === "Escape") (e.target as HTMLElement).blur(); return; }
      if (askConsent || confirmDiscard) { if (e.key === "Escape") { setAskConsent(false); setConfirmDiscard(false); } return; }
      if (e.key === " ") { e.preventDefault(); toggleRec(); }
      else if (e.key === "f" || e.key === "F") setHideChat((x) => !x);
      else if (e.key === "/") { e.preventDefault(); cmdRef.current?.focus(); }
      else if (e.key === "e" || e.key === "E") exportFhir();
      else if (e.key === "c" || e.key === "C") claims.length && copy();
      else if (e.key === "?") setHelp((x) => !x);
      else if (e.key === "Delete" && e.shiftKey && idx) { setRecording(false); setConfirmDiscard(true); }
      else if (e.key === "Escape") { setFocusTurn(null); setFocusClaim(null); setEntity(null); setHelp(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const citedBy = (turnId: string) => claims.filter((c) => c.sources.includes(turnId)).length;
  const matchesEntity = (es: Entity[]) => !!entity && es.some((e) => e.code === entity.code);

  // E/M (2021 MDM) — simple heuristic on documented elements
  const em = useMemo(() => {
    const problems = claims.some((c) => c.section === "A") ? 2 : 0; // chronic illness w/ progression
    const data = claims.filter((c) => c.section === "P" && /x-ray|lab|imaging/i.test(c.text)).length;
    const rx = claims.some((c) => c.entities.some((e) => e.system === "RxNorm") && c.section === "P");
    const elements = [problems >= 2, data >= 1 || claims.some((c) => c.section === "O"), rx].filter(Boolean).length;
    const level = elements >= 2 ? 4 : elements === 1 ? 3 : claims.length ? 2 : 0;
    return { level, code: level ? `9921${level}` : "—", items: [["Problems", problems >= 2 ? "Moderate" : problems ? "Low" : "—"], ["Data", data ? "Limited" : "—"], ["Risk", rx ? "Moderate (Rx mgmt)" : claims.length ? "Low" : "—"]] as const };
  }, [claims]);

  const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const edits = claims.filter((c) => c.edited).length;

  return (
    <div className="flex h-screen flex-col bg-background text-[13px] text-foreground">
      {/* App bar */}
      <header className="flex h-11 items-center gap-3 border-b bg-primary px-4 text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="grid h-5 w-5 place-items-center rounded-[3px] bg-primary-foreground font-mono text-[11px] font-bold text-primary">E</div>
          <Link to="/" className="text-[13.5px] font-semibold tracking-tight">EchoScribe</Link>
          <span className="ml-1 rounded-[3px] border border-primary-foreground/25 px-1.5 font-mono text-[10px] opacity-80">AMBIENT</span>
        </div>
        <nav className="ml-6 hidden items-center gap-4 text-[12.5px] md:flex"><Link to="/" className="opacity-80 hover:opacity-100">Schedule</Link><Link to="/patients" className="opacity-80 hover:opacity-100">Patients</Link><span className="underline decoration-2 underline-offset-[14px]">Encounter</span></nav>
        <div className="ml-auto flex items-center gap-3 text-[12px]">
          <button onClick={() => setHelp(true)} className="flex items-center gap-1.5 opacity-80 hover:opacity-100"><Keyboard className="h-3.5 w-3.5" />Shortcuts</button>
          <span className="h-4 w-px bg-primary-foreground/25" />
          <span className="opacity-90">Priya Shah, MD</span>
        </div>
      </header>

      {/* Patient banner */}
      <div className="flex flex-wrap items-stretch border-b bg-card">
        <div className="flex items-center gap-3 border-r px-4 py-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary font-semibold text-secondary-foreground">MA</div>
          <div>
            <div className="text-[14px] font-semibold leading-tight">Alvarez, Miguel</div>
            <div className="text-[11.5px] text-muted-foreground">58 y · Male · English</div>
          </div>
        </div>
        {[["MRN", "004-219-771"], ["DOB", "03/14/1968"], ["Encounter", "Office Visit · Est. Pt"], ["Location", "Ortho Clinic 3B"], ["Provider NPI", "1487 6629 03"], ["Allergies", "NKDA"], ["Payer", "Aetna PPO"]].map(([k, v]) => (
          <div key={k} className="flex flex-col justify-center border-r px-4 py-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{k}</span>
            <span className={`font-mono text-[12px] ${k === "Allergies" ? "font-semibold text-plan" : ""}`}>{v}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2 px-4">
          <Btn variant="danger" onClick={() => { setRecording(false); setConfirmDiscard(true); }} disabled={!idx && !recording}><Trash2 className="h-3.5 w-3.5" />Stop &amp; delete</Btn>
          <Btn onClick={reset} disabled={!idx}><RotateCcw className="h-3.5 w-3.5" />Reset</Btn>
          <Btn variant="primary" onClick={exportFhir} disabled={!claims.length}><Download className="h-3.5 w-3.5" />Export FHIR R4</Btn>
        </div>
      </div>

      {/* Recording strip w/ full-width visualizer */}
      <div role="status" aria-live="polite" className={`flex h-14 items-center gap-4 border-b px-4 ${recording ? "bg-destructive/[0.04]" : "bg-card"}`}>
        <button onClick={toggleRec} disabled={ended} aria-label={recording ? "Pause recording" : "Start recording"}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-colors disabled:opacity-40 ${recording ? "border-destructive bg-destructive text-destructive-foreground" : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"}`}>
          {recording ? <Pause className="h-4 w-4" /> : idx ? <Play className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </button>
        <div className="w-36 shrink-0">
          <div className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${recording ? "text-destructive" : "text-muted-foreground"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${recording ? "animate-pulse bg-destructive" : "bg-muted-foreground/50"}`} />
            {recording ? "Recording" : ended ? "Ended" : idx ? "Paused" : "Not recording"}
          </div>
          <div className="font-mono text-[15px] font-medium tabular-nums">{mmss(elapsed)}</div>
        </div>
        <div className="relative flex h-10 min-w-0 flex-1 items-center gap-px">
          <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border" />
          {bars.map((h, i) => (
            <span key={i} className={`relative flex-1 rounded-[1px] ${recording ? (h > 0.85 ? "bg-destructive" : "bg-physician/70") : "bg-border"}`} style={{ height: `${Math.max(2, h * 40)}px` }} />
          ))}
        </div>
        <div className="flex w-40 shrink-0 items-center gap-2">
          <div className="flex h-8 w-2 flex-col-reverse overflow-hidden rounded-[1px] bg-muted">
            <div className={`transition-[height] duration-75 ${db > -15 ? "bg-destructive" : "bg-plan"}`} style={{ height: `${((db + 60) / 60) * 100}%` }} />
          </div>
          <div className="leading-tight">
            <div className="font-mono text-[14px] tabular-nums">{db <= -60 ? "−∞" : db} <span className="text-[10px] text-muted-foreground">dBFS</span></div>
            <div className="text-[10.5px] text-muted-foreground">Mic · Array 2ch</div>
          </div>
        </div>
        <div className="hidden w-48 shrink-0 border-l pl-4 text-[11px] leading-tight xl:block">
          <div className="flex items-center gap-1 font-medium"><ShieldCheck className={`h-3.5 w-3.5 ${consent ? "text-plan" : "text-muted-foreground"}`} />{consent ? "Consent on file" : "Consent required"}</div>
          <div className="font-mono text-muted-foreground">{consent ? `Verbal · ${consent.at}` : "Press Space to begin"}</div>
        </div>
      </div>

      <main className="grid flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Transcript */}
        <section className="flex flex-col overflow-hidden border-r bg-card">
          <div className="flex h-9 items-center gap-4 border-b px-4 text-[11.5px]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">Transcript</span>
            <span className="font-mono text-muted-foreground">{idx}/{SCRIPT.length} turns</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-[3px] bg-physician" />Physician</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><span className="h-2 w-[3px] bg-patient" />Patient</span>
            <Btn variant="ghost" onClick={() => setHideChat((h) => !h)} className={`ml-auto h-6 ${hideChat ? "text-primary" : ""}`}><Filter className="h-3 w-3" />{hideChat ? "Social hidden" : "Hide social"}<Kbd>F</Kbd></Btn>
          </div>
          <div ref={feedRef} className="flex-1 overflow-y-auto">
            {!turns.length && (
              <div className="grid h-full place-items-center text-center">
                <div><Mic className="mx-auto h-5 w-5 text-muted-foreground" /><p className="mt-2 text-muted-foreground">No audio captured. Press <Kbd>Space</Kbd> to obtain consent and begin.</p></div>
              </div>
            )}
            <table className="w-full border-collapse">
              <tbody>
                {turns.map((t) => {
                  if (hideChat && t.domain === "CHITCHAT") return null;
                  const doc = t.speaker === "physician";
                  const hl = focusTurn === t.id || (focusClaim && claims.find((c) => c.id === focusClaim)?.sources.includes(t.id)) || matchesEntity(t.entities);
                  const n = citedBy(t.id);
                  return (
                    <tr key={t.id} id={`turn-${t.id}`} onClick={() => { setFocusTurn(t.id); setFocusClaim(null); }}
                      className={`cursor-pointer border-b align-top transition-colors ${hl ? "bg-primary/[0.06]" : "hover:bg-muted/60"} ${t.domain === "CHITCHAT" ? "text-muted-foreground" : ""}`}>
                      <td className={`w-[74px] border-l-[3px] bg-muted/40 py-2.5 pl-3 pr-2 font-mono text-[11px] leading-5 text-muted-foreground ${doc ? "border-l-physician" : "border-l-patient"}`}>
                        <div className="tabular-nums">{t.t}</div><div className="opacity-70">{t.id}</div>
                      </td>
                      <td className="py-2.5 pl-3 pr-4">
                        <div className="mb-0.5 flex items-center gap-2 text-[11px]">
                          <span className={`font-semibold uppercase tracking-[0.06em] ${doc ? "text-physician" : "text-patient"}`}>{doc ? "Dr. Shah" : "Patient"}</span>
                          <span className={`rounded-[3px] border px-1 font-mono text-[9.5px] leading-[15px] ${DOMAIN[t.domain]!.cls}`}>{DOMAIN[t.domain]!.label}</span>
                          {n > 0 && <span className="ml-auto font-mono text-[10px] text-muted-foreground">→ {n} claim{n > 1 ? "s" : ""}</span>}
                        </div>
                        <p className="text-[13.5px] leading-[1.55]">{t.text}</p>
                        {t.entities.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{t.entities.map((e) => <Code key={e.code} e={e} active={entity?.code === e.code} onClick={() => setEntity(entity?.code === e.code ? null : e)} />)}</div>}
                      </td>
                    </tr>
                  );
                })}
                {recording && <tr><td className="w-[74px] bg-muted/40" /><td className="px-3 py-2 font-mono text-[11px] text-muted-foreground"><span className="animate-pulse">▍ transcribing…</span></td></tr>}
              </tbody>
            </table>
          </div>
          {entity && (
            <div className="flex items-center gap-3 border-t bg-muted/50 px-4 py-2">
              <span className="font-mono text-[11px] text-muted-foreground">{entity.system}</span>
              <span className="font-mono text-[12px] font-semibold">{entity.code}</span>
              <span className="truncate">{entity.display}</span>
              <button onClick={() => setEntity(null)} className="ml-auto text-[11px] text-muted-foreground hover:text-foreground">Clear <Kbd>Esc</Kbd></button>
            </div>
          )}
        </section>

        {/* Note */}
        <section className="flex flex-col overflow-hidden">
          <div className="flex h-9 items-center gap-3 border-b bg-card px-4 text-[11.5px]">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">Progress Note</span>
            <span className="rounded-[3px] bg-edit/15 px-1.5 font-mono text-[10px] font-medium text-edit">DRAFT</span>
            <span className="text-muted-foreground">{claims.length} claims · {edits} edited</span>
            <div className="ml-auto flex items-center gap-1">
              <Btn variant="ghost" className="h-6" onClick={() => copy()} disabled={!claims.length}>{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}Copy<Kbd>C</Kbd></Btn>
              <Btn variant="ghost" className="h-6" onClick={() => setCollapsed(Object.values(collapsed).some(Boolean) ? {} : { S: true, O: true, A: true, P: true })}>{Object.values(collapsed).some(Boolean) ? "Expand all" : "Collapse all"}</Btn>
            </div>
          </div>

          {/* E/M indicator */}
          <div className="flex items-center gap-4 border-b bg-card px-4 py-2">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">E/M Level · MDM</div>
              <div className="flex items-baseline gap-2"><span className="font-mono text-[18px] font-semibold tabular-nums">{em.code}</span><span className="text-[11px] text-muted-foreground">{em.level ? `Est. patient, level ${em.level}` : "Insufficient documentation"}</span></div>
            </div>
            <div className="flex gap-[3px]">{[2, 3, 4, 5].map((l) => <span key={l} className={`h-5 w-4 rounded-[2px] ${em.level >= l ? (l === 4 ? "bg-plan" : "bg-plan/60") : "bg-muted"}`} title={`9921${l}`} />)}</div>
            <dl className="ml-auto grid grid-cols-3 gap-x-5 text-[11px]">
              {em.items.map(([k, v]) => <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium">{v}</dd></div>)}
            </dl>
          </div>

          <div className="flex-1 overflow-y-auto">
            {SECTIONS.map((s) => {
              const items = claims.filter((c) => c.section === s.key);
              const isC = collapsed[s.key];
              return (
                <div key={s.key} className="border-b bg-card">
                  <div className="group flex h-8 items-center gap-2 bg-muted/50 px-4">
                    <button onClick={() => setCollapsed((c) => ({ ...c, [s.key]: !c[s.key] }))} className="flex items-center gap-2">
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${isC ? "-rotate-90" : ""}`} />
                      <span className="font-mono text-[11px] font-semibold text-primary">{s.key}</span>
                      <span className="text-[12px] font-semibold uppercase tracking-[0.06em]">{s.title}</span>
                    </button>
                    <span className="font-mono text-[10.5px] text-muted-foreground">{items.length}</span>
                    <button onClick={() => copy(s.key)} disabled={!items.length} className="ml-auto text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 disabled:hidden" aria-label={`Copy ${s.title}`}><Copy className="h-3.5 w-3.5" /></button>
                  </div>
                  {!isC && (
                    <ul className="py-1">
                      {!items.length && <li className="px-4 py-2 pl-[42px] text-[12px] text-muted-foreground">{recording ? "Listening…" : "No content yet."}</li>}
                      {items.map((c) => {
                        const hl = focusClaim === c.id || (focusTurn && c.sources.includes(focusTurn)) || matchesEntity(c.entities);
                        return (
                          <li key={c.id} onMouseEnter={() => setFocusClaim(c.id)} onMouseLeave={() => setFocusClaim(null)}
                            className={`relative border-l-2 py-1.5 pl-[40px] pr-4 transition-colors ${hl ? "border-l-primary bg-primary/[0.05]" : c.edited ? "border-l-edit bg-edit/[0.05]" : "border-l-transparent"}`}>
                            {editing === c.id ? (
                              <div>
                                <textarea autoFocus defaultValue={c.text} onBlur={(e) => saveEdit(c.id, e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); saveEdit(c.id, e.currentTarget.value); } if (e.key === "Escape") setEditing(null); }}
                                  className="w-full resize-none rounded-[3px] border border-primary bg-background px-2 py-1 text-[13.5px] outline-none ring-2 ring-primary/15" rows={2} />
                                <div className="mt-0.5 flex gap-3 text-[10.5px] text-muted-foreground"><span><Kbd>↵</Kbd> save</span><span><Kbd>Esc</Kbd> cancel</span></div>
                              </div>
                            ) : (
                              <div onClick={() => setEditing(c.id)} className="cursor-text text-[13.5px] leading-[1.55]">
                                {c.original && <del className="mr-1.5 bg-destructive/[0.07] text-destructive/80 decoration-destructive/60">{c.original}</del>}
                                <span className={c.edited ? "bg-plan/[0.12] underline decoration-plan/40 underline-offset-2" : ""}>{c.text}</span>
                              </div>
                            )}
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              {c.sources.map((src) => <button key={src} onClick={() => jumpToTurn(src)} className="h-[18px] rounded-[3px] border border-primary/25 px-1 font-mono text-[10.5px] leading-none text-primary hover:bg-primary hover:text-primary-foreground">{src}</button>)}
                              {c.entities.map((e) => <Code key={e.code} e={e} active={entity?.code === e.code} onClick={() => setEntity(entity?.code === e.code ? null : e)} />)}
                              {!c.sources.length && <span className="font-mono text-[10px] text-muted-foreground">no source</span>}
                              {c.edited && <span className="ml-auto font-mono text-[10px] uppercase text-edit">{c.edited === "voice" ? "voice edit" : "manual edit"}</span>}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          <div className="border-t bg-card px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">VOICE</span>
              <div className="flex h-8 flex-1 items-center rounded-[4px] border bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
                <input ref={cmdRef} value={cmd} onChange={(e) => setCmd(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runCmd()} className="h-full flex-1 bg-transparent px-2.5 text-[13px] outline-none" aria-label="Voice command (simulated)" />
                <span className="pr-2"><Kbd>/</Kbd></span>
              </div>
              <Btn variant="primary" className="h-8" onClick={runCmd} disabled={!claims.length}><CornerDownLeft className="h-3.5 w-3.5" />Apply</Btn>
            </div>
            {log.length > 0 && <ul className="mt-1.5 max-h-14 overflow-y-auto pl-12 font-mono text-[11px] text-muted-foreground">{log.map((l, i) => <li key={i}>› {l}</li>)}</ul>}
          </div>
        </section>
      </main>

      {/* Status bar */}
      <footer className="flex h-6 items-center gap-4 border-t bg-muted/60 px-4 font-mono text-[10.5px] text-muted-foreground">
        <span>ENC-2026-1013-0042</span><span>FHIR R4 · Epic / Cerner</span><span>Session local · not persisted</span>
        <span className="ml-auto flex items-center gap-2"><Kbd>Space</Kbd>record <Kbd>?</Kbd>shortcuts</span>
      </footer>

      {help && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4" onClick={() => setHelp(false)}>
          <div className="w-full max-w-xs rounded-[6px] border bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b px-4 py-2.5 text-[12px] font-semibold uppercase tracking-[0.06em]">Keyboard shortcuts</div>
            <ul className="p-2">{SHORTCUTS.map(([k, d]) => <li key={k} className="flex items-center justify-between px-2 py-1.5"><span>{d}</span><Kbd>{k}</Kbd></li>)}</ul>
          </div>
        </div>
      )}

      {askConsent && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="consent-title" className="w-full max-w-md rounded-[6px] border bg-card shadow-xl">
            <div className="border-b px-5 py-3"><h2 id="consent-title" className="flex items-center gap-2 text-[14px] font-semibold"><ShieldCheck className="h-4 w-4 text-primary" />Ambient recording consent</h2></div>
            <div className="px-5 py-4">
              <p className="text-muted-foreground">Inform the patient that EchoScribe will record and transcribe this visit to draft the clinical note. The patient may decline or stop at any time; the transcript can be deleted.</p>
              <label className="mt-4 flex items-start gap-2.5"><input type="checkbox" className="mt-0.5 accent-primary" checked={ack.physician} onChange={(e) => setAck((a) => ({ ...a, physician: e.target.checked }))} />I have explained the recording to the patient.</label>
              <label className="mt-2 flex items-start gap-2.5"><input type="checkbox" className="mt-0.5 accent-primary" checked={ack.patient} onChange={(e) => setAck((a) => ({ ...a, patient: e.target.checked }))} />The patient verbally agreed to be recorded.</label>
            </div>
            <div className="flex justify-end gap-2 border-t bg-muted/40 px-5 py-3">
              <Btn onClick={() => setAskConsent(false)}>Patient declined</Btn>
              <Btn variant="primary" disabled={!ack.physician || !ack.patient} onClick={() => { setConsent({ at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }); setAskConsent(false); setRecording(true); }}><Mic className="h-3.5 w-3.5" />Start recording</Btn>
            </div>
          </div>
        </div>
      )}

      {confirmDiscard && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 p-4">
          <div role="alertdialog" aria-modal="true" className="w-full max-w-sm rounded-[6px] border bg-card shadow-xl">
            <div className="border-b px-5 py-3"><h2 className="text-[14px] font-semibold">Delete this visit's transcript?</h2></div>
            <p className="px-5 py-4 text-muted-foreground">Recording has stopped. This permanently removes the transcript, the drafted note and the consent record for this visit.</p>
            <div className="flex justify-end gap-2 border-t bg-muted/40 px-5 py-3">
              <Btn onClick={() => setConfirmDiscard(false)}>Keep</Btn>
              <Btn variant="primary" className="border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={discard}><Trash2 className="h-3.5 w-3.5" />Delete transcript</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
