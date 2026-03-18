import AdminSidebar from "../components/AdminSidebar";
import StatCard from "../components/StatCard";

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Dashboard</h1>

        {/* KPI Cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Today Sales" value="₹ 0" />
          <StatCard label="Today Collection" value="₹ 0" />
          <StatCard label="Difference" value="₹ 0" />
          <StatCard label="Cash vs Digital" value="—" />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Party Credit Today" value="₹ 0" />
          <StatCard label="Fleet Today" value="₹ 0" />
          <StatCard label="MDU Today" value="₹ 0" />
        </div>

        {/* Charts Section */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="font-semibold text-slate-800">Sales by Shift</h3>
            <p className="mt-2 text-sm text-slate-500">[Chart placeholder]</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-800">HSD vs MS</h3>
            <p className="mt-2 text-sm text-slate-500">[Chart placeholder]</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-800">Payment Mode</h3>
            <p className="mt-2 text-sm text-slate-500">[Chart placeholder]</p>
          </div>
          <div className="card">
            <h3 className="font-semibold text-slate-800">Point-wise Sales</h3>
            <p className="mt-2 text-sm text-slate-500">[Chart placeholder]</p>
          </div>
        </div>

        {/* Alerts */}
        <div className="card">
          <h3 className="font-semibold text-slate-800">🚨 Alerts</h3>
          <div className="mt-3 space-y-2 text-sm text-slate-600">
            <p>• Shifts with differences ≠ 0</p>
            <p>• Pending shift submissions</p>
            <p>• Missing receipt uploads</p>
          </div>
        </div>
      </main>
    </div>
  );
}
