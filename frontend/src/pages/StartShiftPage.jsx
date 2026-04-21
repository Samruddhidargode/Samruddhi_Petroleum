import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StartShiftPage() {
  const navigate = useNavigate();
  const [shiftDate, setShiftDate] = useState("");
  const [timeIn, setTimeIn] = useState("");
  const [shiftNumber, setShiftNumber] = useState("1");
  const [qrScannerNo, setQrScannerNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const draft = localStorage.getItem("shiftStartDraft");
    if (draft) {
      try {
        const data = JSON.parse(draft);
        if (data.shiftDate) setShiftDate(data.shiftDate);
        if (data.timeIn) setTimeIn(data.timeIn);
        if (data.shiftNumber) setShiftNumber(String(data.shiftNumber));
        if (data.qrScannerNo) setQrScannerNo(data.qrScannerNo);
        if (localStorage.getItem("activeShiftId")) {
          setHasDraft(true);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  async function handleStartShift() {
    const existingShift = localStorage.getItem("activeShiftId");
    if (existingShift) {
      navigate("/shift/nozzle");
      return;
    }

    if (!shiftDate || !timeIn) {
      setMessage("Please enter Date In and Time In");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/shifts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          shiftDate,
          timeIn: `${shiftDate}T${timeIn}:00`,
          shiftNumber: Number(shiftNumber),
          qrScannerNo: qrScannerNo || undefined
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        localStorage.setItem("activeShiftId", data.id);
        if (data.shiftNumber) {
          localStorage.setItem("activeShiftNumber", String(data.shiftNumber));
        }
        localStorage.setItem("shiftStartDraft", JSON.stringify({ shiftDate, timeIn, shiftNumber, qrScannerNo }));
        setHasDraft(true);
        navigate("/shift/nozzle");
      } else {
        setMessage(data?.message || "Failed to start shift");
      }
    } catch (error) {
      setMessage(error?.message || "Failed to start shift");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    if (!shiftDate || !timeIn) {
      setMessage("Please enter Date In and Time In");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/shifts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          shiftDate,
          timeIn: `${shiftDate}T${timeIn}:00`,
          shiftNumber: Number(shiftNumber),
          qrScannerNo: qrScannerNo || undefined
        })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        localStorage.setItem("activeShiftId", data.id);
        if (data.shiftNumber) {
          localStorage.setItem("activeShiftNumber", String(data.shiftNumber));
        }
        localStorage.setItem("shiftStartDraft", JSON.stringify({ shiftDate, timeIn, shiftNumber, qrScannerNo }));
        setHasDraft(true);
        setMessage("Draft saved");
      } else {
        setMessage(data?.message || "Failed to save draft");
      }
    } catch (error) {
      setMessage(error?.message || "Failed to save draft");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10">
      <div className="card">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Start New Shift</h2>
        <p className="text-sm text-slate-500 mb-4">Initialize your shift with date, time, and pump details</p>
        
        {message && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.includes("saved") || message.includes("Draft") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}
        
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date In</label>
              <input className="input" type="date" value={shiftDate} onChange={(e) => setShiftDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Time In</label>
              <input className="input" type="time" value={timeIn} onChange={(e) => setTimeIn(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Shift Number</label>
              <select className="input" value={shiftNumber} onChange={(e) => setShiftNumber(e.target.value)}>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">QR Scanner No</label>
              <input className="input" placeholder="Scanner ID" value={qrScannerNo} onChange={(e) => setQrScannerNo(e.target.value)} />
            </div>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row">
            <button className="button flex-1" onClick={handleStartShift} disabled={loading}>
              {loading ? "Starting..." : "▶️ Start Shift"}
            </button>
            <button className="button-outline flex-1" onClick={handleSaveDraft} disabled={loading}>
              {loading ? "Saving..." : "💾 Save Draft"}
            </button>
            {hasDraft && (
              <button className="button-outline flex-1" onClick={() => navigate("/shift/nozzle")}>
                ▶️ Continue →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
