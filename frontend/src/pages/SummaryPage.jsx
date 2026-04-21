import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SummaryPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSummary() {
      const shiftId = localStorage.getItem("activeShiftId");
      const token = localStorage.getItem("token");

      if (!shiftId || !token) {
        setMessage("Missing shift or login session.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/shifts/draft/${shiftId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setMessage(data.message || "Failed to load summary.");
          return;
        }

        setSummary(data.shift || null);
      } catch (error) {
        setMessage(error.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    loadSummary();
  }, []);

  const totals = useMemo(() => {
    const shift = summary || {};
    const cashFromDrops = (shift.cashDrops || []).reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);
    const qr = (shift.qrEntries || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const card = (shift.cardEntries || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const fleet = (shift.fleetEntries || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const partyCredit = (shift.partyCredits || []).reduce((sum, item) => sum + Number(item.amount || 0), 0);

    return {
      totalSales: Number(shift.totalSales || 0),
      cashFromDrops,
      qr,
      card,
      fleet,
      partyCredit,
      totalCollected: Number(shift.totalCollected || 0),
      difference: Number(shift.difference || 0)
    };
  }, [summary]);

  if (loading) {
    return <div className="mx-auto max-w-2xl px-4 pb-10"><div className="card text-sm text-slate-600">Loading summary...</div></div>;
  }

  const formatInr = (value) => `₹ ${Number(value || 0).toFixed(2)}`;
  const isBalanced = totals.difference === 0;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 space-y-4">
      <div className="card">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Shift Summary</h2>
        <p className="text-sm text-slate-500 mb-4">Review your sales and collection data before final submission</p>
        
        {message && (
          <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {message}
          </div>
        )}
        
        <div className="space-y-3">
          {/* Sales Section */}
          <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-2">💰 Sales</p>
            <div className="flex justify-between items-center">
              <span className="text-slate-700 font-medium">Total Sales (A)</span>
              <span className="text-lg font-bold text-blue-600">{formatInr(totals.totalSales)}</span>
            </div>
          </div>
          
          {/* Collections Section */}
          <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-green-500 space-y-2">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-3">📊 Collections Breakdown</p>
            <div className="flex justify-between text-sm"><span className="text-slate-600">Cash from Drops</span><span className="font-medium">{formatInr(totals.cashFromDrops)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-600">QR / PhonePe</span><span className="font-medium">{formatInr(totals.qr)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-600">Card</span><span className="font-medium">{formatInr(totals.card)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-600">Fleet</span><span className="font-medium">{formatInr(totals.fleet)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-600">Party Credit</span><span className="font-medium">{formatInr(totals.partyCredit)}</span></div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total Collected (B)</span>
              <span className="text-green-600">{formatInr(totals.totalCollected)}</span>
            </div>
          </div>
          
          {/* Difference Section */}
          <div className={`p-4 rounded-lg border-l-4 ${isBalanced ? "bg-emerald-50 border-emerald-500" : "bg-rose-50 border-rose-500"}`}>
            <p className="text-xs uppercase tracking-widest font-semibold mb-2" style={{color: isBalanced ? '#059669' : '#dc2626'}}>
              {isBalanced ? '✓ Balance' : '⚠ Difference'}
            </p>
            <div className="flex justify-between items-center">
              <span className="font-medium" style={{color: isBalanced ? '#059669' : '#991b1b'}}>Difference (B - A)</span>
              <span className="text-xl font-bold" style={{color: isBalanced ? '#059669' : '#dc2626'}}>
                {formatInr(totals.difference)}
              </span>
            </div>
            {!isBalanced && (
              <p className="text-xs mt-2" style={{color: '#991b1b'}}>
                Note: There's a mismatch between sales and collection.
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button className="button-outline" onClick={() => navigate("/shift/payments")}>← Back</button>
        <button className="button flex-1 sm:flex-none" onClick={() => navigate("/shift/confirm")}>Next → Confirm</button>
      </div>
    </div>
  );
}
