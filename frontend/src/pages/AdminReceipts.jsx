import AdminSidebar from "../components/AdminSidebar";

export default function AdminReceipts() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Receipts & Records</h1>

        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <input className="input w-40" placeholder="Date range" />
            <select className="input w-40">
              <option>All Types</option>
              <option>QR</option>
              <option>Card</option>
              <option>Fleet</option>
              <option>Party Credit</option>
              <option>MDU</option>
            </select>
            <input className="input w-40" placeholder="DSM name" />
            <button className="button">Filter</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card flex flex-col items-center gap-2">
              <div className="h-32 w-32 rounded-lg bg-slate-200"></div>
              <div className="text-center text-xs text-slate-600">
                <p>Receipt #{i}</p>
                <p>Type: QR</p>
                <p>Date: —</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
