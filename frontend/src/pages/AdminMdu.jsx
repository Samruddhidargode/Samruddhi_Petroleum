import { useEffect, useMemo, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminMdu() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("ALL");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Load today's MDU trips on first render.
    loadTrips({ date, status });
  }, []);

  async function loadTrips(filters = { date, status }) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams();
      if (filters.date) params.set("date", filters.date);
      if (filters.status && filters.status !== "ALL") params.set("status", filters.status);

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`/api/mdu/trips${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to load MDU trips");
        return;
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setMessage(error?.message || "Failed to load MDU trips");
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    const nextDate = new Date().toISOString().slice(0, 10);
    setDate(nextDate);
    setStatus("ALL");
    loadTrips({ date: nextDate, status: "ALL" });
  }

  const summary = useMemo(() => {
    return items.reduce(
      (acc, trip) => {
        acc.sales += Number(trip.totalSales || 0);
        acc.cash += Number(trip.cashTotal || 0);
        acc.online += Number(trip.onlineTotal || 0);
        acc.credit += Number(trip.creditTotal || 0);
        acc.clients += Number(trip.clientCount || 0);
        return acc;
      },
      { sales: 0, cash: 0, online: 0, credit: 0, clients: 0 }
    );
  }, [items]);

  const formatInr = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">MDU Management</h1>

        {/* Filters help the admin inspect MDU trips by date and status. */}
        <div className="card mb-4 grid gap-2 md:grid-cols-4">
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="OPEN">OPEN</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <button className="button" onClick={() => loadTrips({ date, status })} disabled={loading}>
            {loading ? "Filtering..." : "Filter"}
          </button>
          <button className="button-outline" onClick={resetFilters} disabled={loading}>Reset</button>
        </div>

        {message && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>}

        {/* Summary cards aggregate totals from the visible MDU trips. */}
        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <div className="card">
            <div className="text-xs text-slate-500">Total Sales</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">{formatInr(summary.sales)}</div>
          </div>
          <div className="card">
            <div className="text-xs text-slate-500">Cash</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">{formatInr(summary.cash)}</div>
          </div>
          <div className="card">
            <div className="text-xs text-slate-500">Online</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">{formatInr(summary.online)}</div>
          </div>
          <div className="card">
            <div className="text-xs text-slate-500">Credit</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">{formatInr(summary.credit)}</div>
          </div>
          <div className="card">
            <div className="text-xs text-slate-500">Clients Served</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">{summary.clients}</div>
          </div>
        </div>

        {/* Table shows each trip with its route, client count, and sales. */}
        <div className="card">
          <h3 className="mb-4 font-semibold text-slate-800">MDU Trips</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Trip ID</th>
                  <th className="px-4 py-2">DSM</th>
                  <th className="px-4 py-2">Vehicle</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Clients</th>
                  <th className="px-4 py-2">Sales</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr className="border-t">
                    <td className="px-4 py-2 text-slate-500" colSpan={7}>Loading trips...</td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-2 text-slate-500" colSpan={7}>No MDU trips found.</td>
                  </tr>
                )}
                {!loading && items.map((trip) => (
                  <tr key={trip.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2">{new Date(trip.tripDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{trip.id}</td>
                    <td className="px-4 py-2">{trip?.dsm?.name} ({trip?.dsm?.dsmCode})</td>
                    <td className="px-4 py-2">{trip.vehicleNo}</td>
                    <td className="px-4 py-2">{trip.status}</td>
                    <td className="px-4 py-2">{Number(trip.clientCount || 0)}</td>
                    <td className="px-4 py-2">{formatInr(trip.totalSales)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
