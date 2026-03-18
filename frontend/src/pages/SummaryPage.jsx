import { useNavigate } from "react-router-dom";

export default function SummaryPage() {
  const navigate = useNavigate();
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-800">Shift Summary</h2>
      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex justify-between"><span>Total Sales (A)</span><span>₹ 0</span></div>
        <div className="flex justify-between"><span>Cash from Drops</span><span>₹ 0</span></div>
        <div className="flex justify-between"><span>QR</span><span>₹ 0</span></div>
        <div className="flex justify-between"><span>Card</span><span>₹ 0</span></div>
        <div className="flex justify-between"><span>Fleet</span><span>₹ 0</span></div>
        <div className="flex justify-between"><span>Party Credit</span><span>₹ 0</span></div>
        <div className="border-t pt-2 flex justify-between font-semibold"><span>Total Collected (B)</span><span>₹ 0</span></div>
        <div className="flex justify-between font-semibold"><span>Difference (B - A)</span><span>₹ 0</span></div>
      </div>
      <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
        Difference is balanced.
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button className="button-outline" onClick={() => navigate("/shift/payments")}>← Back</button>
        <button className="button" onClick={() => navigate("/shift/confirm")}>Next → Confirm</button>
      </div>
    </div>
  );
}
