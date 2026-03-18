import AdminSidebar from "../components/AdminSidebar";

export default function AdminMdu() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">MDU Management</h1>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="card">
            <div className="text-xs text-slate-500">Today Sales</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">₹ 0</div>
          </div>
          <div className="card">
            <div className="text-xs text-slate-500">Cash</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">₹ 0</div>
          </div>
          <div className="card">
            <div className="text-xs text-slate-500">Online</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">₹ 0</div>
          </div>
          <div className="card">
            <div className="text-xs text-slate-500">Credit</div>
            <div className="mt-1 text-xl font-semibold text-slate-800">₹ 0</div>
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4 font-semibold text-slate-800">MDU Trips</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Trip</th>
                  <th className="px-4 py-2">DSM</th>
                  <th className="px-4 py-2">Clients</th>
                  <th className="px-4 py-2">Sales</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t hover:bg-slate-50">
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">—</td>
                  <td className="px-4 py-2">0</td>
                  <td className="px-4 py-2">₹ 0</td>
                  <td className="px-4 py-2">
                    <button className="button-outline text-xs">View</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
