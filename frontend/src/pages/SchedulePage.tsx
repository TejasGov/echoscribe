import { Link } from "react-router-dom";
import { Mic, ArrowRight } from "lucide-react";
import { AppHeader, STATUS_CLS } from "../components/layout/AppHeader";
import { PATIENTS } from "../lib/patients";
import { DemoTour } from "../components/layout/DemoTour";

export function SchedulePage() {
  const sorted = [...PATIENTS].sort((a, b) => a.time.localeCompare(b.time));
  const stats = [
    ["Scheduled", PATIENTS.length],
    ["Completed", PATIENTS.filter((p) => p.status === "Completed").length],
    ["Notes pending sign", 2],
    ["Avg. note time", "3m 12s"],
  ];

  return (
    <div className="min-h-screen bg-background text-[13px]">
      <AppHeader />
      <DemoTour />
      <div className="border-b bg-card px-6 py-4">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          Tuesday, Oct 13 2026 · Ortho Clinic 3B
        </div>
        <h1 className="mt-0.5 text-[20px] font-semibold tracking-tight">
          Good morning, Dr. Shah
        </h1>
      </div>
      <div data-tour="stats" className="grid grid-cols-2 border-b bg-card md:grid-cols-4">
        {stats.map(([k, v]) => (
          <div key={k} className="border-r px-6 py-3">
            <div className="text-[10.5px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {k}
            </div>
            <div className="font-mono text-[20px] font-semibold tabular-nums">
              {v}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-6xl p-6">
        <div data-tour="schedule" className="rounded-[4px] border bg-card">
          <div className="flex h-10 items-center border-b px-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em]">
              Today's schedule
            </span>
            <Link
              to="/patients"
              className="ml-auto flex items-center gap-1 text-[12px] text-primary hover:underline"
            >
              All patients <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                {["Time", "Patient", "MRN", "Reason for visit", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-2.5 font-mono tabular-nums">{p.time}</td>
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/patients/${p.id}`}
                      className="font-semibold hover:text-primary hover:underline"
                    >
                      {p.name}
                    </Link>
                    <div className="text-[11.5px] text-muted-foreground">
                      {p.age} y · {p.sex}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{p.mrn}</td>
                  <td className="px-4 py-2.5">{p.reason}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-[3px] border px-1.5 py-px font-mono text-[10.5px] ${STATUS_CLS[p.status]}`}
                    >
                      {p.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {p.status !== "Completed" && (
                      <Link
                        to="/encounter"
                        data-tour={i === sorted.findIndex((x) => x.status !== "Completed") ? "start-visit" : undefined}
                        className="inline-flex h-7 items-center gap-1.5 rounded-[4px] border border-primary bg-primary px-2.5 text-[12px] font-medium text-primary-foreground hover:bg-primary/90"
                      >
                        <Mic className="h-3.5 w-3.5" />
                        {p.status === "In visit" ? "Resume" : "Start visit"}
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
