import AdminSidebar from "../components/AdminSidebar";

export default function AdminSettings() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Settings</h1>

        {/* This page is a static reference area for configuration and system status. */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="mb-3 font-semibold">Pump Configuration</h3>
            <div className="space-y-2">
              <label className="text-sm text-slate-600">Points Setup</label>
              <p className="text-sm text-slate-600">• DU1 → Point 1, Point 2</p>
              <p className="text-sm text-slate-600">• DU2 → Point 3, Point 4</p>
              <p className="text-sm text-slate-600">• MDU → HSD only</p>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Fuel Types</h3>
            <p className="text-sm text-slate-600">• HSD (Diesel)</p>
            <p className="text-sm text-slate-600">• MS (Petrol)</p>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">Language Settings</h3>
            <select className="input">
              <option>English</option>
              <option>Marathi</option>
              <option>Hindi</option>
            </select>
          </div>

          <div className="card">
            <h3 className="mb-3 font-semibold">System Status</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>✓ Database: Connected</p>
              <p>✓ Backend API: Running</p>
              <p>• Cloudinary: Not configured</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
