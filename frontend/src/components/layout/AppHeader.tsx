import { Link, useLocation } from "react-router-dom";

export function AppHeader() {
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const navClass = (path: string) =>
    isActive(path)
      ? "opacity-100 underline decoration-2 underline-offset-[14px] font-medium"
      : "opacity-75 hover:opacity-100";

  return (
    <header className="flex h-11 items-center gap-3 bg-primary px-4 text-primary-foreground border-b border-primary/20">
      <Link to="/" className="flex items-center gap-2">
        <div className="grid h-5 w-5 place-items-center rounded-[3px] bg-primary-foreground font-mono text-[11px] font-bold text-primary">
          E
        </div>
        <span className="text-[13.5px] font-semibold tracking-tight">EchoScribe</span>
        <span className="ml-1 rounded-[3px] border border-primary-foreground/25 px-1.5 font-mono text-[10px] opacity-80">
          AMBIENT
        </span>
      </Link>
      <nav className="ml-6 flex items-center gap-4 text-[12.5px]">
        <Link to="/" className={navClass("/")}>Schedule</Link>
        <Link to="/patients" className={navClass("/patients")}>Patients</Link>
        <Link to="/encounter" className={navClass("/encounter")}>Encounter</Link>
      </nav>
      <span className="ml-auto text-[12px] opacity-90 hidden sm:inline">
        Priya Shah, MD · NPI 1487662903
      </span>
    </header>
  );
}

export const STATUS_CLS: Record<string, string> = {
  "In visit": "border-destructive/40 text-destructive bg-destructive/5",
  Roomed: "border-plan/40 text-plan bg-plan/5",
  "Checked in": "border-obj/40 text-obj bg-obj/5",
  Scheduled: "border-border text-muted-foreground",
  Completed: "border-border text-muted-foreground bg-muted",
};
