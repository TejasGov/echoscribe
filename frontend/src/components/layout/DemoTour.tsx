import { useCallback, useEffect, useState } from "react";
import { PlayCircle, X, ChevronUp, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react";

type Step = { target: string; title: string; body: string };

const STEPS: Step[] = [
  { target: "nav", title: "Portal navigation", body: "Move between today's schedule, the patient directory and the live encounter scribe." },
  { target: "stats", title: "Daily totals", body: "Scheduled visits, completed encounters, notes waiting for signature and average note time." },
  { target: "schedule", title: "Today's schedule", body: "Every patient on today's list with MRN, reason for visit and live status. Click a name to open the chart." },
  { target: "start-visit", title: "Start an ambient visit", body: "Opens the scribe. Consent is captured first, then the conversation drafts a SOAP note in real time." },
];

const BOOT_KEY = "echoscribe.tour.seen";
const PIN_KEY = "echoscribe.tour.pinDismissed";

type Rect = { top: number; left: number; width: number; height: number };

function useTargetRect(target: string | null) {
  const [rect, setRect] = useState<Rect | null>(null);
  useEffect(() => {
    if (!target) { setRect(null); return undefined; }
    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    if (!el) { setRect(null); return undefined; }
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    const update = () => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top - 6, left: r.left - 6, width: r.width + 12, height: r.height + 12 });
    };
    update();
    const t = setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [target]);
  return rect;
}

export function DemoTour() {
  const [step, setStep] = useState<number | null>(null);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const rect = useTargetRect(step === null ? null : (STEPS[step]?.target ?? null));

  useEffect(() => {
    setPinVisible(localStorage.getItem(PIN_KEY) !== "1");
    if (sessionStorage.getItem(BOOT_KEY)) return undefined;
    const t = setTimeout(() => setStep(0), 600);
    return () => clearTimeout(t);
  }, []);

  const end = useCallback(() => {
    sessionStorage.setItem(BOOT_KEY, "1");
    setStep(null);
  }, []);

  useEffect(() => {
    if (step === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") end();
      if (e.key === "ArrowRight") setStep((s) => (s !== null && s < STEPS.length - 1 ? s + 1 : s));
      if (e.key === "ArrowLeft") setStep((s) => (s ? s - 1 : s));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, end]);

  const dismissPin = () => {
    localStorage.setItem(PIN_KEY, "1");
    setPinVisible(false);
  };

  const cur = step === null ? null : (STEPS[step] ?? null);
  const cardTop = rect ? (rect.top + rect.height + 200 > window.innerHeight ? Math.max(12, rect.top - 190) : rect.top + rect.height + 12) : 0;
  const cardLeft = rect ? Math.min(Math.max(12, rect.left), window.innerWidth - 352) : 0;

  return (
    <>
      {cur && (
        <div className="fixed inset-0 z-[100]" onClick={end}>
          {rect ? (
            <div
              key={step}
              className="tour-zoom pointer-events-none absolute rounded-[6px] ring-2 ring-primary transition-all duration-300 ease-out"
              style={{ ...rect, boxShadow: "0 0 0 9999px color-mix(in oklch, var(--foreground) 55%, transparent)" }}
            />
          ) : (
            <div className="absolute inset-0 bg-foreground/55" />
          )}
          <div
            key={`c${step}`}
            onClick={(e) => e.stopPropagation()}
            className="tour-pop absolute w-[340px] rounded-[4px] border bg-card p-4 shadow-card"
            style={rect ? { top: cardTop, left: cardLeft } : { top: "40%", left: "50%", transform: "translate(-50%,-50%)" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-muted-foreground">Walkthrough · {step! + 1}/{STEPS.length}</span>
              <button onClick={end} aria-label="Close walkthrough" className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="mt-1.5 text-[14px] font-semibold">{cur.title}</div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{cur.body}</p>
            <div className="mt-3 flex items-center gap-1.5">
              {STEPS.map((_, i) => <span key={i} className={`h-1 w-4 rounded-full ${i === step ? "bg-primary" : "bg-border"}`} />)}
              <div className="ml-auto flex gap-1.5">
                {step! > 0 && <button onClick={() => setStep(step! - 1)} className="inline-flex h-7 items-center gap-1 rounded-[4px] border px-2 text-[12px] hover:bg-muted"><ArrowLeft className="h-3 w-3" />Back</button>}
                {step! < STEPS.length - 1
                  ? <button onClick={() => setStep(step! + 1)} className="inline-flex h-7 items-center gap-1 rounded-[4px] bg-primary px-2.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90">Next<ArrowRight className="h-3 w-3" /></button>
                  : <button onClick={end} className="inline-flex h-7 items-center rounded-[4px] bg-primary px-2.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90">Finish</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {pinVisible && step === null && (
        <div className="fixed bottom-4 left-4 z-50 w-[280px] rounded-[4px] border bg-card shadow-card">
          <div className="flex h-9 items-center gap-2 px-3">
            <PlayCircle className="h-4 w-4 text-primary" />
            <button onClick={() => setPinOpen((o) => !o)} className="flex flex-1 items-center gap-1 text-left text-[12.5px] font-semibold" aria-expanded={pinOpen}>
              Demo walkthrough {pinOpen ? <ChevronDown className="ml-auto h-3.5 w-3.5" /> : <ChevronUp className="ml-auto h-3.5 w-3.5" />}
            </button>
            <button onClick={dismissPin} aria-label="Dismiss walkthrough" className="text-muted-foreground hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
          </div>
          {pinOpen && (
            <div className="border-t px-3 py-2.5">
              <ol className="space-y-1">
                {STEPS.map((s, i) => (
                  <li key={s.target}>
                    <button onClick={() => setStep(i)} className="flex w-full gap-2 rounded-[3px] px-1 py-0.5 text-left text-[12px] hover:bg-muted">
                      <span className="font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>{s.title}
                    </button>
                  </li>
                ))}
              </ol>
              <button onClick={() => setStep(0)} className="mt-2 inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-[4px] bg-primary text-[12px] font-medium text-primary-foreground hover:bg-primary/90">
                <PlayCircle className="h-3.5 w-3.5" />Start tour
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
