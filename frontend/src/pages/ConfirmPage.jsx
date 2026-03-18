import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ConfirmPage() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const validationError = useMemo(() => {
    const shiftId = localStorage.getItem("activeShiftId");
    if (!shiftId) return "Shift not started.";

    const raw = localStorage.getItem("shiftNozzleDraft");
    if (!raw) return "No nozzle data found.";

    try {
      const points = JSON.parse(raw);
      if (!Array.isArray(points) || points.length === 0) return "No nozzle points entered.";
      for (const point of points) {
        for (const fuel of ["HSD", "MS"]) {
          const row = point?.fuels?.[fuel];
          if (!row?.opening) {
            return `Missing opening readings for ${fuel}.`;
          }
          if (!row?.openingPhoto) {
            return `Missing opening photo for ${fuel}.`;
          }
        }
      }
    } catch {
      return "Invalid nozzle data.";
    }

    return "";
  }, []);

  function handleSubmit() {
    if (validationError) {
      setMessage(validationError);
      return;
    }
    if (!confirmed) {
      setMessage("Please confirm the data is correct.");
      return;
    }
    if (!password) {
      setMessage("Please re-enter password.");
      return;
    }

    setMessage("Shift is ready for submission.");
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-800">Confirmation</h2>
      {message && (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {message}
        </div>
      )}
      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          I confirm the above data is correct
        </label>
        <div>
          <label className="text-sm text-slate-600">Re-enter Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="flex items-center justify-between">
          <button className="button-outline" onClick={() => navigate("/shift/summary")}>← Back</button>
          <button className="button w-full md:w-auto" onClick={handleSubmit}>Submit Shift</button>
        </div>
      </div>
    </div>
  );
}
