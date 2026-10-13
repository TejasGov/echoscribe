import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { AppHeader, STATUS_CLS } from "../components/layout/AppHeader";
import { PATIENTS } from "../lib/patients";

export function PatientsPage() {
  const [q, setQ] = useState("");
  const list = PATIENTS.filter((p) =>
    `${p.name} ${p.mrn}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-[13px]">
      <AppHeader />
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="text-[18px] font-semibold tracking-tight">Patient panel</h1>
          <span className="font-mono text-[12px] text-muted-foreground">
            {list.length} of {PATIENTS.length}
          </span>
          <div className="ml-auto flex h-8 w-72 items-center gap-2 rounded-[4px] border bg-card px-2.5 focus-within:border-primary">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name or MRN"
              className="flex-1 bg-transparent outline-none"
            />
          </div>
        </div>
        <div className="rounded-[4px] border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-[10.5px] uppercase tracking-[0.06em] text-muted-foreground">
                {["Patient", "MRN", "DOB", "Payer", "Allergies", "Status"].map((h) => (
                  <th key={h} className="px-4 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <Link
                      to={`/patients/${p.id}`}
                      className="flex items-center gap-2.5 font-semibold hover:text-physician"
                    >
                      <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary text-[11px]">
                        {p.initials}
                      </span>
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{p.mrn}</td>
                  <td className="px-4 py-2.5 font-mono text-[12px]">{p.dob}</td>
                  <td className="px-4 py-2.5">{p.payer}</td>
                  <td
                    className={`px-4 py-2.5 ${p.allergies === "NKDA" ? "text-muted-foreground" : "font-semibold text-destructive"}`}
                  >
                    {p.allergies}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-[3px] border px-1.5 py-px font-mono text-[10.5px] ${STATUS_CLS[p.status]}`}
                    >
                      {p.status.toUpperCase()}
                    </span>
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
