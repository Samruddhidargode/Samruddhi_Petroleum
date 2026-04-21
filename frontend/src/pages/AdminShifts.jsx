import { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

const initialFilters = {
  date: "",
  dsm: "",
  shiftNumber: "",
  status: ""
};

export default function AdminShifts() {
  const [shiftId, setShiftId] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState(initialFilters);
  const [shifts, setShifts] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    loadShifts();
  }, []);

  async function loadShifts(search = searchText, extraFilters = filters) {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }

    setListLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (extraFilters.date) params.set("date", extraFilters.date);
      if (extraFilters.dsm.trim()) params.set("dsm", extraFilters.dsm.trim());
      if (extraFilters.shiftNumber) params.set("shiftNumber", extraFilters.shiftNumber);
      if (extraFilters.status) params.set("status", extraFilters.status);

      const query = params.toString() ? `?${params.toString()}` : "";
      const response = await fetch(`/api/shifts${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setMessage(data?.message || "Failed to load shifts");
        return;
      }

      setShifts(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setMessage(error?.message || "Failed to load shifts");
    } finally {
      setListLoading(false);
    }
  }

  async function handleLoadPhotos() {
    if (!shiftId) {
      setMessage("Please enter Shift ID");
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
      const response = await fetch(`/api/uploads/nozzle-photos?shiftId=${encodeURIComponent(shiftId)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json().catch(() => []);
      if (response.ok) {
        setPhotos(Array.isArray(data) ? data : []);
      } else {
        setMessage(data?.message || "Failed to load photos");
      }
    } catch (error) {
      setMessage(error?.message || "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(field, value) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  function resetFilters() {
    setSearchText("");
    setFilters(initialFilters);
    loadShifts("", initialFilters);
  }

  function getLabel(entityId, entityType) {
    const parts = (entityId || "").split(":");
    const pointNo = parts[1] || "?";
    const fuel = parts[2] || "?";
    const type = entityType === "NOZZLE_OPENING" ? "Opening" : "Closing";
    return `Point ${pointNo} - ${fuel} - ${type}`;
  }

  function formatInr(value) {
    return `Rs ${Number(value || 0).toFixed(2)}`;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Pump Shifts</h1>

        <div className="card mb-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">Open DSM Sheet</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input w-64"
              placeholder="Enter Shift ID"
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
            />
            <button className="button" onClick={() => shiftId && window.location.assign(`/admin/shifts/${shiftId}`)}>
              View DSM Sheet
            </button>
          </div>
        </div>

        <div className="card">
          <div className="mb-4 grid gap-2 md:grid-cols-5">
            <input
              className="input"
              placeholder="Search by id or DSM"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <input className="input" type="date" value={filters.date} onChange={(e) => handleFilterChange("date", e.target.value)} />
            <input
              className="input"
              placeholder="DSM name/code"
              value={filters.dsm}
              onChange={(e) => handleFilterChange("dsm", e.target.value)}
            />
            <select className="input" value={filters.shiftNumber} onChange={(e) => handleFilterChange("shiftNumber", e.target.value)}>
              <option value="">All shifts</option>
              <option value="1">Shift 1</option>
              <option value="2">Shift 2</option>
              <option value="3">Shift 3</option>
            </select>
            <select className="input" value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}>
              <option value="">All status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
            </select>
          </div>

          <div className="mb-4 flex gap-2">
            <button className="button" onClick={() => loadShifts(searchText, filters)} disabled={listLoading}>
              {listLoading ? "Searching..." : "Search"}
            </button>
            <button className="button-outline" onClick={resetFilters} disabled={listLoading}>
              Reset
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Shift</th>
                  <th className="px-4 py-2">DSM</th>
                  <th className="px-4 py-2">Sales</th>
                  <th className="px-4 py-2">Collected</th>
                  <th className="px-4 py-2">Difference</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listLoading && (
                  <tr className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500" colSpan={8}>Loading shifts...</td>
                  </tr>
                )}
                {!listLoading && shifts.length === 0 && (
                  <tr className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2 text-slate-500" colSpan={8}>No shifts found.</td>
                  </tr>
                )}
                {!listLoading && shifts.map((shift) => (
                  <tr key={shift.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2">{new Date(shift.shiftDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{shift.shiftNumber}</td>
                    <td className="px-4 py-2">{shift?.dsm?.name} ({shift?.dsm?.dsmCode})</td>
                    <td className="px-4 py-2">{formatInr(shift.totalSales)}</td>
                    <td className="px-4 py-2">{formatInr(shift.totalCollected)}</td>
                    <td className={`px-4 py-2 ${Number(shift.difference || 0) >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {formatInr(shift.difference)}
                    </td>
                    <td className="px-4 py-2">{shift.status}</td>
                    <td className="px-4 py-2">
                      <button className="button-outline text-xs" onClick={() => window.location.assign(`/admin/shifts/${shift.id}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card mt-6">
          <h2 className="mb-3 text-lg font-semibold text-slate-800">DSM Sheet Photos</h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input w-64"
              placeholder="Enter Shift ID"
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
            />
            <button className="button" onClick={handleLoadPhotos} disabled={loading}>
              {loading ? "Loading..." : "Load Photos"}
            </button>
          </div>
          {message && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </div>
          )}
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <div key={photo.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 text-xs font-medium text-slate-600">
                  {getLabel(photo.entityId, photo.entityType)}
                </div>
                <img src={photo.url} alt="Nozzle reading" className="h-40 w-full rounded object-cover" />
              </div>
            ))}
            {!loading && photos.length === 0 && (
              <div className="text-sm text-slate-500">No photos loaded.</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
