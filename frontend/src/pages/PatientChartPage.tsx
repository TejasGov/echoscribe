import { Link, useParams } from "react-router-dom";
import { Mic, ChevronLeft } from "lucide-react";
import { AppHeader } from "../components/layout/AppHeader";
import { getPatient } from "../lib/patients";

const Panel = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-[4px] border bg-card">
    <div className="border-b bg-muted/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em]">
      {title}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export function PatientChartPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const p = getPatient(patientId || "");

  if (!p) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="p-10 text-center">
          <p className="font-semibold">Patient not found.</p>
          <Link to="/patients" className="text-physician hover:underline">
            Back to patients
          </Link>
        </div>
      </div>
    );
  }

  const v = p.vitals;
  return (
    <div className="min-h-screen bg-background text-[13px]">
      <AppHeader />
      <div className="flex flex-wrap items-stretch border-b bg-card">
        <div className="flex items-center gap-3 border-r px-4 py-2.5">
          <Link to="/patients" aria-label="Back" className="text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary font-semibold">
            {p.initials}
          </div>
          <div>
            <div className="text-[15px] font-semibold leading-tight">{p.name}</div>
            <div className="text-[11.5px] text-muted-foreground">{p.age} y · {p.sex}</div>
          </div>
        </div>
        {[
          ["MRN", p.mrn],
          ["DOB", p.dob],
          ["Payer", p.payer],
          ["Allergies", p.allergies],
          ["PCP", "P. Shah, MD"],
        ].map(([k, val]) => (
          <div key={k} className="flex flex-col justify-center border-r px-4 py-2">
            <span className="text-[10px] font-medium uppercase tracking-[0.06em] text-muted-foreground">{k}</span>
            <span className={`font-mono text-[12px] ${k === "Allergies" && val !== "NKDA" ? "font-semibold text-destructive" : ""}`}>
              {val}
            </span>
          </div>
        ))}
        <div className="ml-auto flex items-center px-4">
          <Link
            to="/encounter"
            className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-primary bg-primary px-3 text-[12.5px] font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Mic className="h-3.5 w-3.5" />Start ambient visit
          </Link>
        </div>
      </div>
      <div className="mx-auto grid max-w-6xl gap-4 p-6 lg:grid-cols-3">
        <Panel title="Today's visit">
          <div className="font-mono text-[12px] text-muted-foreground">{p.time} · {p.status}</div>
          <div className="mt-1 font-medium">{p.reason}</div>
        </Panel>
        <Panel title="Latest vitals">
          {v.hr ? (
            <dl className="grid grid-cols-3 gap-3">
              {[["BP", v.bp], ["HR", `${v.hr}`], ["Temp", v.temp], ["SpO₂", `${v.spo2}%`], ["BMI", `${v.bmi}`]].map(([k, val]) => (
                <div key={k}>
                  <dt className="text-[10.5px] uppercase text-muted-foreground">{k}</dt>
                  <dd className="font-mono text-[14px] tabular-nums">{val}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-muted-foreground">Not yet recorded.</p>
          )}
        </Panel>
        <Panel title="Medications">
          {p.meds.length ? (
            <ul className="space-y-1">{p.meds.map((m) => <li key={m}>{m}</li>)}</ul>
          ) : (
            <p className="text-muted-foreground">No active medications.</p>
          )}
        </Panel>
        <div className="lg:col-span-1">
          <Panel title="Problem list">
            {p.problems.length ? (
              <ul className="space-y-1.5">
                {p.problems.map((x) => (
                  <li key={x.code} className="flex gap-2">
                    <span className="w-16 font-mono text-[11.5px] text-muted-foreground">{x.code}</span>
                    {x.display}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">None documented.</p>
            )}
          </Panel>
        </div>
        <div className="lg:col-span-2">
          <Panel title="Visit history">
            {p.visits.length ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10.5px] uppercase text-muted-foreground">
                    <th className="pb-1.5 font-medium">Date</th>
                    <th className="pb-1.5 font-medium">Type</th>
                    <th className="pb-1.5 font-medium">Provider</th>
                    <th className="pb-1.5 font-medium">CPT</th>
                  </tr>
                </thead>
                <tbody>
                  {p.visits.map((x) => (
                    <tr key={x.date} className="border-t">
                      <td className="py-1.5 font-mono text-[12px]">{x.date}</td>
                      <td>{x.type}</td>
                      <td>{x.provider}</td>
                      <td className="font-mono text-[12px]">{x.cpt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-muted-foreground">No prior visits.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
