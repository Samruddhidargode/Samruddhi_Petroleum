import { useNavigate } from "react-router-dom";

export default function CashDropPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Cash Drops</h2>
        <div className="rounded-lg bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
          Total Cash From Drops: ₹ 0
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Cash Drop #1</h3>
          <span className="text-xs text-slate-500">Time: 11:24 AM</span>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm text-slate-600">500 x</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">200 x</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">100 x</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">50 x</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">20 x</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">10 x</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Coins</label>
            <input className="input" type="number" />
          </div>
        </div>
        <div className="mt-3 text-sm text-slate-600">Drop Total: ₹ 0</div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button className="button-outline">+ Add Another Drop</button>
        <div className="flex gap-2">
          <button className="button-outline" onClick={() => navigate("/shift/nozzle")}>← Back</button>
          <button className="button" onClick={() => navigate("/shift/payments")}>Next → Payments</button>
        </div>
      </div>
    </div>
  );
}
