import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const FUEL_TYPES = ["HSD", "MS"];

const toNumber = (value) => (value === "" || value === null || Number.isNaN(Number(value)) ? 0 : Number(value));

export default function AdminShiftDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const isAdmin = role === "ADMIN";

  const [shiftId, setShiftId] = useState(id || "");
  const [shift, setShift] = useState(null);
  const [images, setImages] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      setShiftId(id);
      loadShift(id);
    }
  }, [id]);

  async function loadShift(shiftIdToLoad) {
    if (!shiftIdToLoad) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/shifts/${shiftIdToLoad}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to load shift");
        return;
      }
      setShift(data.shift || null);
      setImages(Array.isArray(data.images) ? data.images : []);
      setEntries(Array.isArray(data.shift?.nozzleEntries) ? data.shift.nozzleEntries : []);
    } catch (error) {
      setMessage(error?.message || "Failed to load shift");
    } finally {
      setLoading(false);
    }
  }

  function handleEntryChange(entryId, field, value) {
    setEntries((prev) => prev.map((e) => (e.id === entryId ? { ...e, [field]: value } : e)));
  }

  function getPhotoUrl(pointNo, fuelType, type) {
    const key = `${shiftId}:${pointNo}:${fuelType}`;
    const image = images.find((img) => img.entityId === key && img.entityType === type);
    return image?.url || "";
  }

  const grouped = useMemo(() => {
    const points = [1, 2, 3, 4].map((p) => ({
      pointNo: p,
      fuels: {
        HSD: null,
        MS: null
      }
    }));

    entries.forEach((entry) => {
      const point = points.find((p) => p.pointNo === entry.pointNo);
      if (point) point.fuels[entry.fuelType] = entry;
    });

    return points;
  }, [entries]);

  async function handleSaveEdits() {
    if (!isAdmin) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }

    const payload = entries.map((entry) => ({
      pointNo: entry.pointNo,
      fuelType: entry.fuelType,
      openingReading: toNumber(entry.openingReading),
      closingReading: toNumber(entry.closingReading),
      rate: toNumber(entry.rate),
      pumpTestLiters: toNumber(entry.pumpTestLiters),
      ownUseLiters: toNumber(entry.ownUseLiters)
    }));

    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/shifts/nozzle-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ shiftId, entries: payload })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to save edits");
        return;
      }
      setMessage("Edits saved");
      await loadShift(shiftId);
    } catch (error) {
      setMessage(error?.message || "Failed to save edits");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">DSM Sheet</h1>
          <button className="button-outline" onClick={() => navigate("/admin/shifts")}>← Back to Shifts</button>
        </div>

        <div className="card mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <input
              className="input w-64"
              placeholder="Enter Shift ID"
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
            />
            <button className="button" onClick={() => loadShift(shiftId)} disabled={loading}>
              {loading ? "Loading..." : "Load"}
            </button>
            {isAdmin && (
              <button className="button-outline" onClick={handleSaveEdits} disabled={saving || !shift}>
                {saving ? "Saving..." : "Save Edits"}
              </button>
            )}
          </div>
          {message && (
            <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {message}
            </div>
          )}
        </div>

        {shift && (
          <div className="card mb-4">
            <div className="grid gap-2 text-sm">
              <div><strong>Date:</strong> {new Date(shift.shiftDate).toLocaleDateString()}</div>
              <div><strong>Shift #:</strong> {shift.shiftNumber}</div>
              <div><strong>DSM:</strong> {shift.dsm?.name} ({shift.dsm?.dsmCode})</div>
              <div><strong>Status:</strong> {shift.status}</div>
            </div>
          </div>
        )}

        {shift && grouped.map((point) => (
          <div key={point.pointNo} className="card mb-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Point {point.pointNo}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-100 text-left">
                  <tr>
                    <th className="px-3 py-2">Fuel</th>
                    <th className="px-3 py-2">Opening</th>
                    <th className="px-3 py-2">Closing</th>
                    <th className="px-3 py-2">Dispensed</th>
                    <th className="px-3 py-2">Pump Test</th>
                    <th className="px-3 py-2">Own Use</th>
                    <th className="px-3 py-2">Net Qty</th>
                    <th className="px-3 py-2">Rate</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Photos</th>
                  </tr>
                </thead>
                <tbody>
                  {FUEL_TYPES.map((fuel) => {
                    const entry = point.fuels[fuel];
                    if (!entry) {
                      return (
                        <tr key={fuel} className="border-t">
                          <td className="px-3 py-2 font-semibold text-slate-700">{fuel}</td>
                          <td className="px-3 py-2" colSpan={9}>—</td>
                        </tr>
                      );
                    }

                    const dispensed = toNumber(entry.closingReading) - toNumber(entry.openingReading);
                    const netQty = dispensed + toNumber(entry.pumpTestLiters) + toNumber(entry.ownUseLiters);
                    const amount = netQty * toNumber(entry.rate);
                    const openingPhoto = getPhotoUrl(point.pointNo, fuel, "NOZZLE_OPENING");
                    const closingPhoto = getPhotoUrl(point.pointNo, fuel, "NOZZLE_CLOSING");

                    return (
                      <tr key={fuel} className="border-t">
                        <td className="px-3 py-2 font-semibold text-slate-700">{fuel}</td>
                        <td className="px-3 py-2">
                          {isAdmin ? (
                            <input className="input" type="number" step="0.01" value={entry.openingReading} onChange={(e) => handleEntryChange(entry.id, "openingReading", e.target.value)} />
                          ) : (
                            entry.openingReading
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {isAdmin ? (
                            <input className="input" type="number" step="0.01" value={entry.closingReading} onChange={(e) => handleEntryChange(entry.id, "closingReading", e.target.value)} />
                          ) : (
                            entry.closingReading
                          )}
                        </td>
                        <td className="px-3 py-2">{dispensed.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          {isAdmin ? (
                            <input className="input" type="number" step="0.01" value={entry.pumpTestLiters} onChange={(e) => handleEntryChange(entry.id, "pumpTestLiters", e.target.value)} />
                          ) : (
                            entry.pumpTestLiters
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {isAdmin ? (
                            <input className="input" type="number" step="0.01" value={entry.ownUseLiters} onChange={(e) => handleEntryChange(entry.id, "ownUseLiters", e.target.value)} />
                          ) : (
                            entry.ownUseLiters
                          )}
                        </td>
                        <td className="px-3 py-2">{netQty.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          {isAdmin ? (
                            <input className="input" type="number" step="0.01" value={entry.rate} onChange={(e) => handleEntryChange(entry.id, "rate", e.target.value)} />
                          ) : (
                            entry.rate
                          )}
                        </td>
                        <td className="px-3 py-2">₹ {amount.toFixed(2)}</td>
                        <td className="px-3 py-2">
                          <div className="flex flex-col gap-2">
                            {openingPhoto ? (
                              <a href={openingPhoto} target="_blank" rel="noreferrer" className="button-outline text-xs">Opening Photo</a>
                            ) : (
                              <span className="text-xs text-slate-400">No opening photo</span>
                            )}
                            {closingPhoto ? (
                              <a href={closingPhoto} target="_blank" rel="noreferrer" className="button-outline text-xs">Closing Photo</a>
                            ) : (
                              <span className="text-xs text-slate-400">No closing photo</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
