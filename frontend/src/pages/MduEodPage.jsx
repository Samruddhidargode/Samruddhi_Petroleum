export default function MduEodPage() {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-slate-800">MDU End of Day</h2>
      <div className="mt-3 grid gap-2 text-sm">
        <div className="flex justify-between"><span>Total Trips Today</span><span>0</span></div>
        <div className="flex justify-between"><span>Total Clients Served</span><span>0</span></div>
        <div className="flex justify-between"><span>Total Sales</span><span>₹ 0</span></div>
        <div className="flex justify-between"><span>Cash Collected</span><span>₹ 0</span></div>
        <div className="flex justify-between"><span>Online Collected</span><span>₹ 0</span></div>
        <div className="flex justify-between"><span>Credit Given</span><span>₹ 0</span></div>
      </div>
      <div className="mt-4 space-y-3">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" className="h-4 w-4" />
          I confirm the above data is correct
        </label>
        <div>
          <label className="text-sm text-slate-600">Re-enter Password</label>
          <input className="input" type="password" />
        </div>
        <button className="button w-full md:w-auto">Confirm EOD</button>
      </div>
    </div>
  );
}
