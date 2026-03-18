import AdminSidebar from "../components/AdminSidebar";

export default function AdminReports() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Reports & Excel Export</h1>

        <div className="space-y-4">
          <div className="card">
            <h3 className="mb-3 font-semibold">Export Pump Shifts</h3>
            <div className="flex gap-2">
              <input className="input" type="date" placeholder="From date" />
              <input className="input" type="date" placeholder="To date" />
              <button className="button">Download Excel</button>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Export MDU Data</h3>
            <div className="flex gap-2">
              <input className="input" type="date" placeholder="From date" />
              <input className="input" type="date" placeholder="To date" />
              <button className="button">Download Excel</button>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Export Party Credits</h3>
            <div className="flex gap-2">
              <input className="input" type="date" placeholder="From date" />
              <input className="input" type="date" placeholder="To date" />
              <button className="button">Download Excel</button>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Export Fleet Records</h3>
            <div className="flex gap-2">
              <input className="input" type="date" placeholder="From date" />
              <input className="input" type="date" placeholder="To date" />
              <button className="button">Download Excel</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
