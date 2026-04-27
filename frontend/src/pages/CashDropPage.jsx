import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CashDropPage() {
  const navigate = useNavigate();
  const [drops, setDrops] = useState([makeDrop()]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  function makeDrop() {
    return {
      den500: "",
      den200: "",
      den100: "",
      den50: "",
      den20: "",
      den10: "",
      coins: ""
    };
  }

  const calculateDropTotal = (drop) => {
    // Multiply each denomination by its face value to get the cash drop total.
    const den500 = Number(drop.den500 || 0);
    const den200 = Number(drop.den200 || 0);
    const den100 = Number(drop.den100 || 0);
    const den50 = Number(drop.den50 || 0);
    const den20 = Number(drop.den20 || 0);
    const den10 = Number(drop.den10 || 0);
    const coins = Number(drop.coins || 0);
    return den500 * 500 + den200 * 200 + den100 * 100 + den50 * 50 + den20 * 20 + den10 * 10 + coins;
  };

  const grandTotal = useMemo(() => {
    return drops.reduce((sum, drop) => sum + calculateDropTotal(drop), 0);
  }, [drops]);

  function updateDrop(index, field, value) {
    setDrops((prev) => prev.map((drop, idx) => (idx === index ? { ...drop, [field]: value } : drop)));
  }

  function addDrop() {
    setDrops((prev) => [...prev, makeDrop()]);
  }

  async function handleNext() {
    const shiftId = localStorage.getItem("activeShiftId");
    const token = localStorage.getItem("token");

    if (!shiftId || !token) {
      setMessage("Missing shift or login session.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      for (const drop of drops) {
        // Skip completely empty rows so the backend only receives real cash drops.
        const normalized = {
          den500: Number(drop.den500 || 0),
          den200: Number(drop.den200 || 0),
          den100: Number(drop.den100 || 0),
          den50: Number(drop.den50 || 0),
          den20: Number(drop.den20 || 0),
          den10: Number(drop.den10 || 0),
          coins: Number(drop.coins || 0)
        };

        const isFullyEmpty = [
          drop.den500,
          drop.den200,
          drop.den100,
          drop.den50,
          drop.den20,
          drop.den10,
          drop.coins
        ].every((value) => String(value || "").trim() === "");

        if (isFullyEmpty) {
          continue;
        }

        const response = await fetch("/api/shifts/cash-drop", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            shiftId,
            ...normalized
          })
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Failed to save cash drop.");
        }
      }

      navigate("/shift/payments");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 space-y-4">
      {/* Top summary shows the grand cash total before moving to payments. */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cash Drops</h2>
          <p className="text-sm text-slate-500 mt-1">Record denomination-wise cash collection</p>
        </div>
        <div className="rounded-lg bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
          ₹ {grandTotal.toFixed(2)}
        </div>
      </div>

      {message && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
      )}

      {drops.map((drop, index) => (
        <div className="card" key={`drop-${index}`}>
          <h3 className="font-semibold text-slate-800 mb-3">💰 Cash Drop #{index + 1}</h3>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">₹500 (x)</label>
              <input className="input" type="number" min="0" value={drop.den500} onChange={(e) => updateDrop(index, "den500", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">₹200 (x)</label>
              <input className="input" type="number" min="0" value={drop.den200} onChange={(e) => updateDrop(index, "den200", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">₹100 (x)</label>
              <input className="input" type="number" min="0" value={drop.den100} onChange={(e) => updateDrop(index, "den100", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">₹50 (x)</label>
              <input className="input" type="number" min="0" value={drop.den50} onChange={(e) => updateDrop(index, "den50", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">₹20 (x)</label>
              <input className="input" type="number" min="0" value={drop.den20} onChange={(e) => updateDrop(index, "den20", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">₹10 (x)</label>
              <input className="input" type="number" min="0" value={drop.den10} onChange={(e) => updateDrop(index, "den10", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Coins (₹)</label>
              <input className="input" type="number" min="0" step="0.01" value={drop.coins} onChange={(e) => updateDrop(index, "coins", e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Drop Total</label>
              <div className="input bg-slate-50 flex items-center justify-center font-semibold text-emerald-700">
                ₹ {calculateDropTotal(drop).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="button-outline" onClick={addDrop}>+ Add Another Drop</button>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
          <button className="button-outline" onClick={() => navigate("/shift/nozzle")}>← Back</button>
          <button className="button flex-1 sm:flex-none" onClick={handleNext} disabled={saving}>
            {saving ? "Saving..." : "Next → Payments"}
          </button>
        </div>
      </div>
    </div>
  );
}
