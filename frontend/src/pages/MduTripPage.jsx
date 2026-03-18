export default function MduTripPage() {
  return (
    <div className="space-y-4">
      <div className="card">
        <h2 className="text-lg font-semibold text-slate-800">Start MDU Trip</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">Date</label>
            <input className="input" type="date" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Opening Time</label>
            <input className="input" type="time" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Vehicle No</label>
            <input className="input" placeholder="Vehicle No" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Opening Meter (optional)</label>
            <input className="input" type="number" />
          </div>
        </div>
        <button className="button mt-4">Start Trip</button>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Client Deliveries</h3>
          <div className="text-sm text-slate-600">Total Sales: ₹ 0</div>
        </div>
        <button className="button-outline mt-3">+ Add Client Delivery</button>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm text-slate-600">Client Name</label>
            <input className="input" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Quantity (L)</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Rate</label>
            <input className="input" type="number" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Payment Mode</label>
            <select className="input">
              <option>Cash</option>
              <option>Online</option>
              <option>Credit</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">Upload Receipt</label>
            <input className="input" type="file" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-800">Close Trip</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-sm text-slate-600">Closing Time</label>
            <input className="input" type="time" />
          </div>
          <div>
            <label className="text-sm text-slate-600">Closing Meter (optional)</label>
            <input className="input" type="number" />
          </div>
        </div>
        <button className="button mt-3">Close Trip</button>
      </div>
    </div>
  );
}
