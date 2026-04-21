import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const FUEL_TYPES = ["HSD", "MS"];

const makeFuelRow = () => ({
  opening: "",
  closing: "",
  pumpTest: "",
  ownUse: "",
  rate: "",
  openingPhoto: "",
  closingPhoto: ""
});

const makePoint = (pointNo = 1) => ({
  id: crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
  pointNo,
  fuels: {
    HSD: makeFuelRow(),
    MS: makeFuelRow()
  }
});

const toNumber = (value) => (value === "" || value === null || Number.isNaN(Number(value)) ? 0 : Number(value));

export default function NozzlePage() {
  const navigate = useNavigate();
  const [points, setPoints] = useState([makePoint(1)]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("shiftNozzleDraft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          const restored = parsed.map((p) => ({
            ...p,
            fuels: {
              HSD: { ...p.fuels.HSD, openingPhoto: "", closingPhoto: "" },
              MS: { ...p.fuels.MS, openingPhoto: "", closingPhoto: "" }
            }
          }));
          setPoints(restored);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    try {
      const sanitized = points.map((p) => ({
        ...p,
        fuels: {
          HSD: { ...p.fuels.HSD, openingPhoto: "", closingPhoto: "" },
          MS: { ...p.fuels.MS, openingPhoto: "", closingPhoto: "" }
        }
      }));
      localStorage.setItem("shiftNozzleDraft", JSON.stringify(sanitized));
    } catch {
      // ignore storage errors
    }
  }, [points]);

  useEffect(() => {
    const shiftId = localStorage.getItem("activeShiftId");
    if (!shiftId) return;
    loadDraftFromServer(shiftId);
  }, []);

  async function loadDraftFromServer(shiftId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/shifts/draft/${shiftId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return;

      const entries = Array.isArray(data.shift?.nozzleEntries) ? data.shift.nozzleEntries : [];
      if (entries.length) {
        const pointsMap = new Map();
        entries.forEach((entry) => {
          if (!pointsMap.has(entry.pointNo)) {
            pointsMap.set(entry.pointNo, makePoint(entry.pointNo));
          }
          const point = pointsMap.get(entry.pointNo);
          point.fuels[entry.fuelType] = {
            ...point.fuels[entry.fuelType],
            opening: String(entry.openingReading ?? ""),
            closing: String(entry.closingReading ?? ""),
            pumpTest: String(entry.pumpTestLiters ?? ""),
            ownUse: String(entry.ownUseLiters ?? ""),
            rate: String(entry.rate ?? "")
          };
        });

        setPoints(Array.from(pointsMap.values()));
      }

      fetchPhotos(shiftId);
    } catch {
      // ignore
    }
  }

  const runningSales = useMemo(() => {
    return points.reduce((sum, point) => {
      return sum + FUEL_TYPES.reduce((fuelSum, fuel) => {
        const row = point.fuels[fuel];
        const dispensed = toNumber(row.closing) - toNumber(row.opening);
        const netQty = dispensed - toNumber(row.ownUse) + toNumber(row.pumpTest);
        const amount = netQty * toNumber(row.rate);
        return fuelSum + amount;
      }, 0);
    }, 0);
  }, [points]);

  const shiftNumber = localStorage.getItem("activeShiftNumber") || "2";

  function handlePointNoChange(pointId, value) {
    setPoints((prev) => prev.map((p) => (p.id === pointId ? { ...p, pointNo: Number(value) } : p)));
  }

  function handleFuelChange(pointId, fuel, field, value) {
    setPoints((prev) =>
      prev.map((p) => {
        if (p.id !== pointId) return p;
        return {
          ...p,
          fuels: {
            ...p.fuels,
            [fuel]: {
              ...p.fuels[fuel],
              [field]: value
            }
          }
        };
      })
    );
  }

  async function handlePhotoCapture(pointId, fuel, field, file) {
    if (!file) return;
    const shiftId = localStorage.getItem("activeShiftId");
    if (!shiftId) {
      setMessage("Shift not started. Please start shift first.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) return;
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/uploads/nozzle-photo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            shiftId,
            pointNo: Number(points.find((p) => p.id === pointId)?.pointNo || 1),
            fuelType: fuel,
            photoType: field === "openingPhoto" ? "OPENING" : "CLOSING",
            imageData: result
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setMessage(data?.message || "Photo upload failed");
          return;
        }

        handleFuelChange(pointId, fuel, field, data.url);
      } catch (error) {
        setMessage(error?.message || "Photo upload failed");
      }
    };
    reader.readAsDataURL(file);
  }

  async function fetchPhotos(shiftId) {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/uploads/nozzle-photos?shiftId=${encodeURIComponent(shiftId)}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json().catch(() => []);
      if (!response.ok) return;

      const images = Array.isArray(data) ? data : [];
      setPoints((prev) =>
        prev.map((point) => {
          const updateFuel = (fuel) => {
            const key = `${shiftId}:${point.pointNo}:${fuel}`;
            const opening = images.find((img) => img.entityId === key && img.entityType === "NOZZLE_OPENING")?.url || "";
            const closing = images.find((img) => img.entityId === key && img.entityType === "NOZZLE_CLOSING")?.url || "";
            return { ...point.fuels[fuel], openingPhoto: opening, closingPhoto: closing };
          };

          return {
            ...point,
            fuels: {
              HSD: updateFuel("HSD"),
              MS: updateFuel("MS")
            }
          };
        })
      );
    } catch {
      // ignore
    }
  }

  async function handleDeletePhoto(pointId, fuel, field) {
    const shiftId = localStorage.getItem("activeShiftId");
    if (!shiftId) {
      setMessage("Shift not started. Please start shift first.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const pointNo = points.find((p) => p.id === pointId)?.pointNo || 1;
      const photoType = field === "openingPhoto" ? "OPENING" : "CLOSING";
      const response = await fetch(`/api/uploads/nozzle-photo?shiftId=${encodeURIComponent(shiftId)}&pointNo=${encodeURIComponent(pointNo)}&fuelType=${encodeURIComponent(fuel)}&photoType=${encodeURIComponent(photoType)}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to delete photo");
        return;
      }
      handleFuelChange(pointId, fuel, field, "");
    } catch (error) {
      setMessage(error?.message || "Failed to delete photo");
    }
  }

  function addPoint() {
    const nextNo = Math.min(points.length + 1, 4);
    setPoints((prev) => [...prev, makePoint(nextNo)]);
  }

  function deletePoint(pointId) {
    if (points.length === 1) {
      setMessage("You must have at least one point.");
      return;
    }
    const confirmed = window.confirm("Delete this point? This action cannot be undone.");
    if (confirmed) {
      setPoints((prev) => prev.filter((p) => p.id !== pointId));
      setMessage("Point deleted successfully");
    }
  }

  function pointHasAnyData(point) {
    return FUEL_TYPES.some((fuel) => {
      const row = point.fuels[fuel];
      return (
        row.opening !== "" ||
        row.closing !== "" ||
        row.pumpTest !== "" ||
        row.ownUse !== "" ||
        row.rate !== "" ||
        row.openingPhoto ||
        row.closingPhoto
      );
    });
  }

  function canProceed() {
    for (const point of points) {
      if (!pointHasAnyData(point)) continue;
      for (const fuel of FUEL_TYPES) {
        const row = point.fuels[fuel];
        if (row.opening === "" || !row.openingPhoto) return false;
      }
    }
    return true;
  }

  async function saveDraftInternal({ silent } = { silent: false }) {
    const shiftId = localStorage.getItem("activeShiftId");
    if (!shiftId) {
      if (!silent) setMessage("Shift not started. Please start shift first.");
      return false;
    }

    const entries = [];
    for (const point of points) {
      for (const fuel of FUEL_TYPES) {
        const row = point.fuels[fuel];
        if (!row.opening) continue;
        entries.push({
          pointNo: point.pointNo,
          fuelType: fuel,
          openingReading: Number(row.opening),
          closingReading: Number(row.closing || 0),
          rate: Number(row.rate || 0),
          pumpTestLiters: Number(row.pumpTest || 0),
          ownUseLiters: Number(row.ownUse || 0)
        });
      }
    }

    if (silent) {
      setAutoSaving(true);
    } else {
      setSaving(true);
      setMessage("");
    }
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/shifts/nozzle-draft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ shiftId, entries })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (!silent) setMessage(data?.message || "Failed to save draft");
        return false;
      }

      if (!silent) setMessage("Draft saved");
      return true;
    } catch (error) {
      if (!silent) setMessage(error?.message || "Failed to save draft");
      return false;
    } finally {
      if (silent) {
        setAutoSaving(false);
      } else {
        setSaving(false);
      }
    }
  }

  async function saveDraft() {
    return saveDraftInternal({ silent: false });
  }

  useEffect(() => {
    const shiftId = localStorage.getItem("activeShiftId");
    if (!shiftId) return;
    if (!points.some((p) => pointHasAnyData(p))) return;

    const timeoutId = setTimeout(() => {
      saveDraftInternal({ silent: true });
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [points]);

  function formatNumber(value) {
    return Number(value || 0).toFixed(2);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-10 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-medium text-slate-600">Shift {shiftNumber} | Running Sales: ₹ {formatNumber(runningSales)}</div>
        <button className="button-outline" onClick={addPoint}>+ Add Point</button>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.includes("deleted") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      {points.map((point, index) => {
        const pointTotal = FUEL_TYPES.reduce((sum, fuel) => {
          const row = point.fuels[fuel];
          const dispensed = toNumber(row.closing) - toNumber(row.opening);
          const netQty = dispensed - toNumber(row.ownUse) + toNumber(row.pumpTest);
          return sum + netQty * toNumber(row.rate);
        }, 0);

        return (
          <div key={point.id} className="card">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">POINT NO:</span>
                <select className="input w-28" value={point.pointNo} onChange={(e) => handlePointNoChange(point.id, e.target.value)}>
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => deletePoint(point.id)}
                className="button-outline text-red-600 border-red-200 hover:bg-red-50"
              >
                🗑️ Delete Point
              </button>
            </div>

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
                  </tr>
                </thead>
                <tbody>
                  {FUEL_TYPES.map((fuel) => {
                    const row = point.fuels[fuel];
                    const dispensed = toNumber(row.closing) - toNumber(row.opening);
                    const netQty = dispensed - toNumber(row.ownUse) + toNumber(row.pumpTest);
                    const amount = netQty * toNumber(row.rate);
                    return (
                      <tr key={fuel} className="border-t">
                        <td className="px-3 py-2 font-semibold text-slate-700">{fuel}</td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex flex-col gap-2">
                            <input className="input" type="number" step="0.01" value={row.opening} onChange={(e) => handleFuelChange(point.id, fuel, "opening", e.target.value)} />
                            <label className="button-outline w-full cursor-pointer text-[11px] leading-4 text-center py-2">
                              {row.openingPhoto ? "Opening Photo Captured" : "Capture Opening Photo"}
                              <input
                                className="hidden"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => {
                                  handlePhotoCapture(point.id, fuel, "openingPhoto", e.target.files?.[0]);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            {row.openingPhoto && (
                              <div className="flex flex-col gap-2">
                                <img src={row.openingPhoto} alt="Opening" className="h-20 w-full rounded object-cover" />
                                <div className="flex items-center gap-2">
                                  <a className="button-outline text-[11px]" href={row.openingPhoto} target="_blank" rel="noreferrer">Open</a>
                                  <button className="button-outline text-[11px]" onClick={() => handleDeletePhoto(point.id, fuel, "openingPhoto")}>Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 align-top">
                          <div className="flex flex-col gap-2">
                            <input className="input" type="number" step="0.01" value={row.closing} onChange={(e) => handleFuelChange(point.id, fuel, "closing", e.target.value)} />
                            <label className="button-outline w-full cursor-pointer text-[11px] leading-4 text-center py-2">
                              {row.closingPhoto ? "Closing Photo Captured" : "Capture Closing Photo"}
                              <input
                                className="hidden"
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={(e) => {
                                  handlePhotoCapture(point.id, fuel, "closingPhoto", e.target.files?.[0]);
                                  e.target.value = "";
                                }}
                              />
                            </label>
                            {row.closingPhoto && (
                              <div className="flex flex-col gap-2">
                                <img src={row.closingPhoto} alt="Closing" className="h-20 w-full rounded object-cover" />
                                <div className="flex items-center gap-2">
                                  <a className="button-outline text-[11px]" href={row.closingPhoto} target="_blank" rel="noreferrer">Open</a>
                                  <button className="button-outline text-[11px]" onClick={() => handleDeletePhoto(point.id, fuel, "closingPhoto")}>Delete</button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{formatNumber(dispensed)}</td>
                        <td className="px-3 py-2">
                          <input className="input" type="number" step="0.01" value={row.pumpTest} onChange={(e) => handleFuelChange(point.id, fuel, "pumpTest", e.target.value)} />
                        </td>
                        <td className="px-3 py-2">
                          <input className="input" type="number" step="0.01" value={row.ownUse} onChange={(e) => handleFuelChange(point.id, fuel, "ownUse", e.target.value)} />
                        </td>
                        <td className="px-3 py-2 text-slate-600">{formatNumber(netQty)}</td>
                        <td className="px-3 py-2">
                          <input className="input" type="number" step="0.01" value={row.rate} onChange={(e) => handleFuelChange(point.id, fuel, "rate", e.target.value)} />
                        </td>
                        <td className="px-3 py-2 text-slate-600">₹ {formatNumber(amount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-3 text-sm font-semibold text-slate-700">Point Total: ₹ {formatNumber(pointTotal)}</div>
          </div>
        );
      })}

      <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
        Total Sales (All Points): ₹ {formatNumber(runningSales)}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button className="button-outline" onClick={() => navigate("/shift/start")}>← Back</button>
          <button className="button-outline" onClick={addPoint}>+ Add Point</button>
          <button className="button-outline" onClick={saveDraft} disabled={saving}>
            {saving ? "Saving..." : "Save Draft"}
          </button>
        </div>
        <button
          className="button w-full sm:w-auto"
          onClick={async () => {
            if (!canProceed()) {
              setMessage("Please fill Opening and capture Opening photos for both HSD and MS before proceeding.");
              return;
            }
            await saveDraftInternal({ silent: true });
            if (!canProceed()) {
              setMessage("Please fill Opening and capture Opening photos for both HSD and MS before proceeding.");
              return;
            }
            navigate("/shift/cash");
          }}
          disabled={saving}
        >
          Next → Cash Drops
        </button>
      </div>
    </div>
  );
}
