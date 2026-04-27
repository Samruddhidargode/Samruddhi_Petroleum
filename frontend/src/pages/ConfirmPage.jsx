import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ConfirmPage() {
  const navigate = useNavigate();
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const shiftId = localStorage.getItem("activeShiftId");
    const token = localStorage.getItem("token");

    if (!shiftId || !token) {
      setMessage("Missing shift or login session.");
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

    setLoading(true);
    setMessage("");

    try {
      // Final submit locks the shift and sends the confirmation password to the backend.
      const response = await fetch("/api/shifts/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shiftId,
          timeOut: new Date().toISOString(),
          confirmPassword: password
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message || "Failed to submit shift.");
        return;
      }

      localStorage.removeItem("activeShiftId");
      localStorage.removeItem("activeShiftNumber");
      localStorage.removeItem("shiftNozzleDraft");
      localStorage.removeItem("shiftStartDraft");
      setMessage("Shift submitted successfully.");
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 space-y-4">
      {/* This is the final gate before the shift is permanently submitted. */}
      <div className="card">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Final Confirmation</h2>
        <p className="text-sm text-slate-500 mb-4">Verify and submit your shift</p>
        
        {message && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}
        
        <div className="space-y-4">
          {/* The checkbox forces the user to explicitly confirm the data is correct. */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="h-5 w-5 mt-0.5 rounded border-blue-300" 
                checked={confirmed} 
                onChange={(e) => setConfirmed(e.target.checked)} 
              />
              <div>
                <p className="font-medium text-blue-900">Confirm data accuracy</p>
                <p className="text-sm text-blue-700 mt-1">
                  I confirm that all nozzle readings, cash drops, and payment transactions are accurate and complete.
                </p>
              </div>
            </label>
          </div>
          
          {/* Password re-entry provides a second layer of user verification. */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">🔐 Re-enter Password</label>
            <input 
              className="input" 
              type="password" 
              placeholder="Enter your password to confirm"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <p className="text-xs text-slate-500 mt-1">This verifies your identity for security</p>
          </div>
          
          {/* Warning box reminds the user that submission is irreversible. */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-900">⚠️ Important</p>
            <p className="text-xs text-amber-700 mt-1">
              Once submitted, shift data cannot be modified. Please ensure all information is correct before proceeding.
            </p>
          </div>
        </div>
      </div>
      
      {/* Navigation goes back to summary or submits the completed shift. */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="button-outline" onClick={() => navigate("/shift/summary")}>← Back</button>
        <button 
          className="button flex-1 sm:flex-none" 
          onClick={handleSubmit} 
          disabled={loading || !confirmed}
        >
          {loading ? "Submitting..." : "✓ Submit Shift"}
        </button>
      </div>
    </div>
  );
}
