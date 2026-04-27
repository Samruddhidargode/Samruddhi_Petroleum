import { useMemo, useState } from "react";

const makeClientRow = () => ({
  clientName: "",
  qty: "",
  rate: "",
  paymentMode: "CASH",
  receiptFile: null
});

export default function MduTripPage() {
  const [tripDate, setTripDate] = useState(new Date().toISOString().slice(0, 10));
  const [openingTime, setOpeningTime] = useState("");
  const [vehicleNo, setVehicleNo] = useState("");
  const [openingMeter, setOpeningMeter] = useState("");

  const [activeTripId, setActiveTripId] = useState(localStorage.getItem("activeMduTripId") || "");
  const [clients, setClients] = useState([makeClientRow()]);

  const [closingTime, setClosingTime] = useState("");
  const [closingMeter, setClosingMeter] = useState("");

  const [message, setMessage] = useState("");
  const [starting, setStarting] = useState(false);
  const [savingClients, setSavingClients] = useState(false);
  const [closing, setClosing] = useState(false);

  const totalSales = useMemo(
    () => clients.reduce((sum, row) => sum + Number(row.qty || 0) * Number(row.rate || 0), 0),
    [clients]
  );

  function updateClient(index, field, value) {
    setClients((prev) => prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row)));
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === "string" ? reader.result : "";
        if (!result) {
          reject(new Error("Failed to read selected file."));
          return;
        }
        resolve(result);
      };
      reader.onerror = () => reject(new Error("Failed to read selected file."));
      reader.readAsDataURL(file);
    });
  }

  async function uploadReceipt(token, file, referenceId) {
    if (!file) {
      return undefined;
    }

    const imageData = await readFileAsDataUrl(file);
    const response = await fetch("/api/uploads/receipt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ imageData, receiptType: "MDU", referenceId })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.message || "Failed to upload receipt");
    }

    return data.url;
  }

  async function startTrip() {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }
    if (!tripDate || !openingTime || !vehicleNo.trim()) {
      setMessage("Trip date, opening time, and vehicle no are required.");
      return;
    }

    setStarting(true);
    setMessage("");
    try {
      // Create the trip first so all client rows and closure data attach to one trip id.
      const response = await fetch("/api/mdu/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tripDate,
          openingTime: `${tripDate}T${openingTime}:00`,
          vehicleNo: vehicleNo.trim(),
          openingMeter: openingMeter !== "" ? Number(openingMeter) : undefined
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to start trip");
        return;
      }
      setActiveTripId(data.id);
      localStorage.setItem("activeMduTripId", data.id);
      setMessage("Trip started successfully.");
    } catch (error) {
      setMessage(error?.message || "Failed to start trip");
    } finally {
      setStarting(false);
    }
  }

  async function saveClients() {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }
    if (!activeTripId) {
      setMessage("Start trip first.");
      return;
    }

    const validRows = clients.filter(
      (row) => row.clientName.trim() && Number(row.qty || 0) > 0 && Number(row.rate || 0) >= 0
    );

    if (validRows.length === 0) {
      setMessage("Add at least one valid client row.");
      return;
    }

    setSavingClients(true);
    setMessage("");
    try {
      // Each valid row is uploaded individually with an optional receipt.
      for (const row of validRows) {
        const receiptUrl = await uploadReceipt(token, row.receiptFile, activeTripId);
        const response = await fetch("/api/mdu/client", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            tripId: activeTripId,
            clientName: row.clientName.trim(),
            qty: Number(row.qty),
            rate: Number(row.rate),
            paymentMode: row.paymentMode,
            receiptUrl
          })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data?.message || "Failed to save client row");
        }
      }

      setClients([makeClientRow()]);
      setMessage("Client deliveries saved.");
    } catch (error) {
      setMessage(error?.message || "Failed to save client rows");
    } finally {
      setSavingClients(false);
    }
  }

  async function closeTrip() {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      return;
    }
    if (!activeTripId) {
      setMessage("No active trip found.");
      return;
    }
    if (!closingTime) {
      setMessage("Closing time is required.");
      return;
    }

    setClosing(true);
    setMessage("");
    try {
      // Closing the trip finalizes the MDU cycle and clears the active trip id.
      const response = await fetch("/api/mdu/close", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          tripId: activeTripId,
          closingTime: `${tripDate}T${closingTime}:00`,
          closingMeter: closingMeter !== "" ? Number(closingMeter) : undefined
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data?.message || "Failed to close trip");
        return;
      }

      localStorage.removeItem("activeMduTripId");
      setActiveTripId("");
      setClosingTime("");
      setClosingMeter("");
      setMessage("Trip closed successfully.");
    } catch (error) {
      setMessage(error?.message || "Failed to close trip");
    } finally {
      setClosing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 space-y-4">
      {/* MDU trip management follows start, client save, and close in one page. */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">MDU Trip Management</h2>
        <p className="text-sm text-slate-500 mt-1">Track fuel deliveries and manage customer transactions</p>
      </div>

      {message && (
        <div className={`rounded-lg px-4 py-3 text-sm ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* Start Trip section captures opening metadata for the delivery run. */}
      <div className="card">
        <h3 className="text-xl font-bold text-slate-800 mb-1">🚗 Start Trip</h3>
        {activeTripId && <div className="mt-2 text-xs bg-emerald-50 text-emerald-700 p-2 rounded inline-block">Active Trip ID: {activeTripId}</div>}
        
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Trip Date</label>
            <input className="input" type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Opening Time</label>
            <input className="input" type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No</label>
            <input className="input" placeholder="Vehicle No" value={vehicleNo} onChange={(e) => setVehicleNo(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Opening Meter (optional)</label>
            <input className="input" type="number" value={openingMeter} onChange={(e) => setOpeningMeter(e.target.value)} />
          </div>
        </div>
        <button className="button mt-4 w-full" onClick={startTrip} disabled={starting}>
          {starting ? "Starting..." : "🚗 Start Trip"}
        </button>
      </div>

      {/* Client deliveries are recorded row by row with quantity, rate, and payment mode. */}
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold text-slate-800">👥 Client Deliveries</h3>
          <div className="text-sm font-bold text-green-600">₹ {totalSales.toFixed(2)}</div>
        </div>
        <p className="text-sm text-slate-500 mb-4">Total sales from all deliveries</p>
        
        <button className="button-outline w-full mb-4" onClick={() => setClients((prev) => [...prev, makeClientRow()])}>+ Add Client Delivery</button>

        <div className="space-y-3">
          {clients.map((row, index) => (
            <div key={`client-row-${index}`} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Client Name</label>
                  <input className="input" value={row.clientName} onChange={(e) => updateClient(index, "clientName", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quantity (L)</label>
                  <input className="input" type="number" value={row.qty} onChange={(e) => updateClient(index, "qty", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Rate (₹/L)</label>
                  <input className="input" type="number" value={row.rate} onChange={(e) => updateClient(index, "rate", e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Payment Mode</label>
                  <select className="input" value={row.paymentMode} onChange={(e) => updateClient(index, "paymentMode", e.target.value)}>
                    <option value="CASH">Cash</option>
                    <option value="ONLINE">Online</option>
                    <option value="CREDIT">Credit</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Upload Receipt</label>
                  <input className="input" type="file" accept="image/*" onChange={(e) => updateClient(index, "receiptFile", e.target.files?.[0] || null)} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="button mt-4 w-full" onClick={saveClients} disabled={savingClients || !activeTripId}>
          {savingClients ? "Saving..." : "✓ Save Client Deliveries"}
        </button>
      </div>

      {/* Close Trip section stores the end meter/time for the trip. */}
      <div className="card">
        <h3 className="text-xl font-bold text-slate-800 mb-4">⏱️ Close Trip</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Closing Time</label>
            <input className="input" type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Closing Meter (optional)</label>
            <input className="input" type="number" value={closingMeter} onChange={(e) => setClosingMeter(e.target.value)} />
          </div>
        </div>
        <button className="button mt-4 w-full" onClick={closeTrip} disabled={closing || !activeTripId}>
          {closing ? "Closing..." : "⏹️ Close Trip"}
        </button>
      </div>
    </div>
  );
}
