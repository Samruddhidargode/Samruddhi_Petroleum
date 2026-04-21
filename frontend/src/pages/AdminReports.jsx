import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

function buildQuery(fromDate, toDate) {
  const params = new URLSearchParams();
  if (fromDate) params.set("from", fromDate);
  if (toDate) params.set("to", toDate);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export default function AdminReports() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadingKey, setLoadingKey] = useState("");
  const [message, setMessage] = useState("");

  async function downloadReport(kind) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }

    const key = `${kind}-${Date.now()}`;
    setLoadingKey(key);
    setMessage("");

    try {
      const query = buildQuery(fromDate, toDate);
      const response = await fetch(`/api/reports/export/${kind}${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setMessage(body?.message || `Failed to download ${kind} report`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${kind}_report_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage(`Downloaded ${kind.toUpperCase()} report`);
    } catch (error) {
      setMessage(error?.message || `Failed to download ${kind} report`);
    } finally {
      setLoadingKey("");
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Reports & Excel Export</h1>

        <div className="card mb-4 grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm text-slate-600">From Date</label>
            <input className="input" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-slate-600">To Date</label>
            <input className="input" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button className="button-outline w-full" onClick={() => { setFromDate(""); setToDate(""); }}>
              Reset Range
            </button>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div className="card">
            <h3 className="mb-3 font-semibold">Export Pump Shifts</h3>
            <button className="button" onClick={() => downloadReport("shifts")} disabled={loadingKey !== ""}>
              {loadingKey ? "Preparing..." : "Download CSV"}
            </button>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Export MDU Data</h3>
            <button className="button" onClick={() => downloadReport("mdu")} disabled={loadingKey !== ""}>
              {loadingKey ? "Preparing..." : "Download CSV"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
