import { useEffect, useState } from "react";

export default function MduEodPage() {
  const [eodDate, setEodDate] = useState(new Date().toISOString().slice(0, 10));
  const [summary, setSummary] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPreview(eodDate);
  }, [eodDate]);

  async function loadPreview(date) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/mdu/summary/${encodeURIComponent(date)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to load summary");
        return;
      }
      setSummary(data);
    } catch (error) {
      setMessage(error?.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
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
      const response = await fetch("/api/mdu/eod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eodDate,
          confirmPassword: password
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to confirm EOD");
        return;
      }

      setSummary({
        date: eodDate,
        totalTrips: Number(data.totalTrips || 0),
        totalClients: Number(data.totalClients || 0),
        totalSales: Number(data.totalSales || 0),
        cashTotal: Number(data.cashTotal || 0),
        onlineTotal: Number(data.onlineTotal || 0),
        creditTotal: Number(data.creditTotal || 0)
      });
      setPassword("");
      setMessage("MDU EOD confirmed successfully.");
    } catch (error) {
      setMessage(error?.message || "Failed to confirm EOD");
    } finally {
      setLoading(false);
    }
  }

  const formatInr = (value) => `₹ ${Number(value || 0).toFixed(2)}`;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">MDU End of Day</h2>
        <p className="text-sm text-slate-500 mt-1">Review and confirm daily trip summary</p>
      </div>

      <div className="card">
        <label className="block text-sm font-medium text-slate-700 mb-2">📅 Select Date</label>
        <input className="input" type="date" value={eodDate} onChange={(e) => setEodDate(e.target.value)} />
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="card">
        <h3 className="text-lg font-bold text-slate-800 mb-4">📊 Daily Summary</h3>
        
        <div className="space-y-3">
          {/* Trip Statistics */}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-xs uppercase tracking-widest text-blue-600 font-semibold mb-3">🚗 Trip Statistics</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Total Trips</span>
                <span className="font-bold text-blue-600">{Number(summary?.totalTrips || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700 font-medium">Total Clients</span>
                <span className="font-bold text-blue-600">{Number(summary?.totalClients || 0)}</span>
              </div>
            </div>
          </div>

          {/* Sales Overview */}
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-xs uppercase tracking-widest text-green-600 font-semibold mb-3">💰 Sales Overview</p>
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Total Sales</span>
              <span className="text-xl font-bold text-green-600">{formatInr(summary?.totalSales)}</span>
            </div>
          </div>

          {/* Payment Breakdown */}
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500 space-y-2">
            <p className="text-xs uppercase tracking-widest text-purple-600 font-semibold mb-3">💳 Payment Collection</p>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Cash Collected</span>
              <span className="font-medium text-purple-600">{formatInr(summary?.cashTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Online Collected</span>
              <span className="font-medium text-purple-600">{formatInr(summary?.onlineTotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Credit Given</span>
              <span className="font-medium text-red-600">{formatInr(summary?.creditTotal)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold text-slate-800 mb-4">✓ Final Confirmation</h3>
        
        <div className="space-y-4">
          {/* Confirmation Checkbox */}
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
                  I confirm that all trip data, client deliveries, and payment information are accurate and complete.
                </p>
              </div>
            </label>
          </div>

          {/* Password Verification */}
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

          {/* Warning Box */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm font-medium text-amber-900">⚠️ Important</p>
            <p className="text-xs text-amber-700 mt-1">
              Once confirmed, the EOD cannot be modified. Please ensure all data is accurate.
            </p>
          </div>
        </div>

        <button 
          className="button w-full mt-4" 
          onClick={handleConfirm} 
          disabled={loading || !confirmed}
        >
          {loading ? "Confirming..." : "✓ Confirm EOD"}
        </button>
      </div>
    </div>
  );
}
