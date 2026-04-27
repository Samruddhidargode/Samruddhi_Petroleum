import StatCard from "../components/StatCard";

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Simple dashboard placeholder showing KPI cards and a shift table scaffold. */}
      <div className="grid gap-3 md:grid-cols-5">
        <StatCard label="Today Sales" value="₹ 0" />
        <StatCard label="Today Collection" value="₹ 0" />
        <StatCard label="Difference" value="₹ 0" />
        <StatCard label="Cash" value="₹ 0" />
        <StatCard label="Digital" value="₹ 0" />
      </div>

      {/* The table below is a basic shift list preview for the dashboard area. */}
      <div className="card">
        <h3 className="font-semibold text-slate-800">Shift Table</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                <th className="py-2">Date</th>
                <th>Shift</th>
                <th>DSM</th>
                <th>Sales</th>
                <th>Collected</th>
                <th>Diff</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="py-2">—</td>
                <td>—</td>
                <td>—</td>
                <td>₹ 0</td>
                <td>₹ 0</td>
                <td>₹ 0</td>
                <td className="text-emerald-700">Open</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
