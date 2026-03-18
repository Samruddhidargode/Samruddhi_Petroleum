import { useNavigate } from "react-router-dom";

export default function PaymentsPage() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-slate-800">QR / PhonePe</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">Amount</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Upload Screenshot</label>
            <input className="input" type="file" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Card Transactions</h3>
          <div className="text-sm text-slate-600">Total Card: ₹ 0</div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="button-outline">+ Debit Card</button>
          <button className="button-outline">+ Credit Card</button>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">Amount</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Upload Slip</label>
            <input className="input" type="file" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Fleet Transactions</h3>
          <div className="text-sm text-slate-600">Total Fleet: ₹ 0</div>
        </div>
        <button className="button-outline mt-3">+ Add Fleet Transaction</button>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">Amount</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Upload</label>
            <input className="input" type="file" />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Party Credit</h3>
          <div className="text-sm text-slate-600">Total Party Credit: ₹ 0</div>
        </div>
        <button className="button-outline mt-3">+ Add Party Credit</button>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm text-slate-600">Party Name</label>
            <input className="input" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Amount</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Upload Slip</label>
            <input className="input" type="file" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button className="button-outline" onClick={() => navigate("/shift/cash")}>← Back</button>
        <button className="button" onClick={() => navigate("/shift/summary")}>Next → Summary</button>
      </div>
    </div>
  );
}
