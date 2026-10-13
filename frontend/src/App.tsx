import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SchedulePage } from "./pages/SchedulePage";
import { PatientsPage } from "./pages/PatientsPage";
import { PatientChartPage } from "./pages/PatientChartPage";
import { EncounterPage } from "./pages/EncounterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SchedulePage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:patientId" element={<PatientChartPage />} />
        <Route path="/encounter" element={<EncounterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
