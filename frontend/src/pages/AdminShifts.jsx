import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminShifts() {
  const [shiftId, setShiftId] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
        headers: { "Authorization": `Bearer ${token}` }
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

  function getLabel(entityId, entityType) {
    const parts = (entityId || "").split(":");
    const pointNo = parts[1] || "?";
    const fuel = parts[2] || "?";
    const type = entityType === "NOZZLE_OPENING" ? "Opening" : "Closing";
    return `Point ${pointNo} • ${fuel} • ${type}`;
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
          <div className="mb-4 flex gap-2">
            <input className="input w-64" placeholder="Search by date/DSM/shift" />
            <button className="button">Search</button>
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
                <tr className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">₹ 0</td>
                  <td className="px-4 py-2">₹ 0</td>
                  <td className="px-4 py-2 text-emerald-600">₹ 0</td>
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">
                    <button className="button-outline text-xs">View</button>
                  </td>
                </tr>
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
