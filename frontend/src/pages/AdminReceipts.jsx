import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

function buildQuery(filters) {
  const params = new URLSearchParams();
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.type && filters.type !== "ALL") params.set("type", filters.type);
  if (filters.dsm.trim()) params.set("dsm", filters.dsm.trim());
  const query = params.toString();
  return query ? `?${query}` : "";
}

export default function AdminReceipts() {
  const [filters, setFilters] = useState({ from: "", to: "", type: "ALL", dsm: "" });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadReceipts();
  }, []);

  function setFilter(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function loadReceipts(custom = filters) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const query = buildQuery(custom);
      const response = await fetch(`/api/reports/receipts${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to load receipts");
        return;
      }
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setMessage(error?.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    const next = { from: "", to: "", type: "ALL", dsm: "" };
    setFilters(next);
    loadReceipts(next);
  }

  function looksLikeImage(url) {
    const value = String(url || "").toLowerCase();
    return value.startsWith("data:image") || value.endsWith(".png") || value.endsWith(".jpg") || value.endsWith(".jpeg") || value.endsWith(".webp") || value.endsWith(".gif");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Receipts & Records</h1>

        <div className="card mb-6 grid gap-2 md:grid-cols-5">
          <input className="input" type="date" value={filters.from} onChange={(e) => setFilter("from", e.target.value)} />
          <input className="input" type="date" value={filters.to} onChange={(e) => setFilter("to", e.target.value)} />
          <select className="input" value={filters.type} onChange={(e) => setFilter("type", e.target.value)}>
            <option value="ALL">All Types</option>
            <option value="QR">QR</option>
            <option value="CARD">Card</option>
            <option value="FLEET">Fleet</option>
            <option value="PARTY_CREDIT">Party Credit</option>
            <option value="MDU">MDU</option>
          </select>
          <input className="input" placeholder="DSM name/code" value={filters.dsm} onChange={(e) => setFilter("dsm", e.target.value)} />
          <div className="flex gap-2">
            <button className="button" onClick={() => loadReceipts(filters)} disabled={loading}>{loading ? "Filtering..." : "Filter"}</button>
            <button className="button-outline" onClick={resetFilters} disabled={loading}>Reset</button>
          </div>
        </div>

        {message && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>}

        <div className="grid gap-4 md:grid-cols-3">
          {!loading && items.length === 0 && (
            <div className="text-sm text-slate-500">No receipts found.</div>
          )}
          {items.map((item) => (
            <div key={`${item.type}-${item.id}`} className="card flex flex-col gap-2">
              {looksLikeImage(item.url) ? (
                <img src={item.url} alt="Receipt" className="h-40 w-full rounded object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center rounded bg-slate-100 text-xs text-slate-600">Receipt file</div>
              )}
              <div className="text-xs text-slate-700">
                <p><strong>Type:</strong> {item.type}</p>
                <p><strong>DSM:</strong> {item.dsmName} ({item.dsmCode})</p>
                <p><strong>Amount:</strong> Rs {Number(item.amount || 0).toFixed(2)}</p>
                <p><strong>Date:</strong> {new Date(item.createdAt).toLocaleString()}</p>
                <p><strong>Ref:</strong> {item.reference || "-"}</p>
              </div>
              <a className="button-outline text-center text-xs" href={item.url} target="_blank" rel="noreferrer">Open Receipt</a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
