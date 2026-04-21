import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [qrAmount, setQrAmount] = useState("");
  const [qrReceiptFile, setQrReceiptFile] = useState(null);
  const [cards, setCards] = useState([{ cardType: "DEBIT", amount: "", receiptFile: null }]);
  const [fleets, setFleets] = useState([{ amount: "", receiptFile: null }]);
  const [parties, setParties] = useState([{ partyName: "", amount: "", receiptFile: null }]);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const cardTotal = useMemo(
    () => cards.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [cards]
  );
  const fleetTotal = useMemo(
    () => fleets.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [fleets]
  );
  const partyTotal = useMemo(
    () => parties.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [parties]
  );

  function updateCard(index, field, value) {
    setCards((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  function updateFleet(index, field, value) {
    setFleets((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  function updateParty(index, field, value) {
    setParties((prev) => prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item)));
  }

  function addCard(cardType) {
    setCards((prev) => [...prev, { cardType, amount: "", receiptFile: null }]);
  }

  function addFleet() {
    setFleets((prev) => [...prev, { amount: "", receiptFile: null }]);
  }

  function addParty() {
    setParties((prev) => [...prev, { partyName: "", amount: "", receiptFile: null }]);
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

  async function uploadReceipt(token, file, receiptType, referenceId) {
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
      body: JSON.stringify({ imageData, receiptType, referenceId })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to upload receipt.");
    }

    return data.url;
  }

  async function postJson(url, token, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to save payment entry.");
    }
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
      if (Number(qrAmount || 0) > 0) {
        const receiptUrl = await uploadReceipt(token, qrReceiptFile, "QR", shiftId);
        await postJson("/api/shifts/qr", token, {
          shiftId,
          amount: Number(qrAmount),
          receiptUrl
        });
      }

      for (const card of cards) {
        if (Number(card.amount || 0) > 0) {
          const receiptUrl = await uploadReceipt(token, card.receiptFile, "CARD", shiftId);
          await postJson("/api/shifts/card", token, {
            shiftId,
            cardType: card.cardType,
            amount: Number(card.amount),
            receiptUrl
          });
        }
      }

      for (const fleet of fleets) {
        if (Number(fleet.amount || 0) > 0) {
          const receiptUrl = await uploadReceipt(token, fleet.receiptFile, "FLEET", shiftId);
          await postJson("/api/shifts/fleet", token, {
            shiftId,
            amount: Number(fleet.amount),
            receiptUrl
          });
        }
      }

      for (const party of parties) {
        if (party.partyName.trim() && Number(party.amount || 0) > 0) {
          const receiptUrl = await uploadReceipt(token, party.receiptFile, "PARTY_CREDIT", shiftId);
          await postJson("/api/shifts/party-credit", token, {
            shiftId,
            partyName: party.partyName.trim(),
            amount: Number(party.amount),
            receiptUrl
          });
        }
      }

      navigate("/shift/summary");
    } catch (error) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-10 space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Payment Modes</h2>
        <p className="text-sm text-slate-500 mt-1">Record all non-cash payments</p>
      </div>

      {message && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
      )}

      {/* QR Payments */}
      <div className="card">
        <h3 className="font-semibold text-slate-800 text-lg mb-3">📱 QR / PhonePe Payments</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
            <input className="input" type="number" min="0" step="0.01" placeholder="Enter amount" value={qrAmount} onChange={(e) => setQrAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Upload Receipt</label>
            <input className="input" type="file" accept="image/*" onChange={(e) => setQrReceiptFile(e.target.files?.[0] || null)} />
          </div>
        </div>
      </div>

      {/* Card Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 text-lg">💳 Card Transactions</h3>
          <div className="text-sm font-bold text-emerald-700">₹ {cardTotal.toFixed(2)}</div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 mb-4">
          <button className="button-outline flex-1" onClick={() => addCard("DEBIT")}>+ Debit Card</button>
          <button className="button-outline flex-1" onClick={() => addCard("CREDIT")}>+ Credit Card</button>
        </div>
        <div className="space-y-3">
          {cards.map((card, index) => (
            <div className="grid gap-3 md:grid-cols-3 p-3 bg-slate-50 rounded-lg" key={`card-${index}`}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Card Type</label>
                <input className="input bg-white" value={card.cardType} readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={card.amount} onChange={(e) => updateCard(index, "amount", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receipt</label>
                <input className="input" type="file" accept="image/*" onChange={(e) => updateCard(index, "receiptFile", e.target.files?.[0] || null)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fleet Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 text-lg">🚗 Fleet Transactions</h3>
          <div className="text-sm font-bold text-emerald-700">₹ {fleetTotal.toFixed(2)}</div>
        </div>
        <button className="button-outline w-full mb-4" onClick={addFleet}>+ Add Fleet Transaction</button>
        <div className="space-y-3">
          {fleets.map((fleet, index) => (
            <div className="grid gap-3 md:grid-cols-2 p-3 bg-slate-50 rounded-lg" key={`fleet-${index}`}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={fleet.amount} onChange={(e) => updateFleet(index, "amount", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receipt</label>
                <input className="input" type="file" accept="image/*" onChange={(e) => updateFleet(index, "receiptFile", e.target.files?.[0] || null)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Party Credit */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800 text-lg">🏢 Party Credit</h3>
          <div className="text-sm font-bold text-emerald-700">₹ {partyTotal.toFixed(2)}</div>
        </div>
        <button className="button-outline w-full mb-4" onClick={addParty}>+ Add Party Credit</button>
        <div className="space-y-3">
          {parties.map((party, index) => (
            <div className="grid gap-3 md:grid-cols-3 p-3 bg-slate-50 rounded-lg" key={`party-${index}`}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Party Name</label>
                <input className="input" placeholder="Name" value={party.partyName} onChange={(e) => updateParty(index, "partyName", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
                <input className="input" type="number" min="0" step="0.01" value={party.amount} onChange={(e) => updateParty(index, "amount", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Receipt</label>
                <input className="input" type="file" accept="image/*" onChange={(e) => updateParty(index, "receiptFile", e.target.files?.[0] || null)} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="button-outline" onClick={() => navigate("/shift/cash")}>← Back</button>
        <button className="button flex-1 sm:flex-none" onClick={handleNext} disabled={saving}>
          {saving ? "Saving..." : "Next → Summary"}
        </button>
      </div>
    </div>
  );
}
