import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AdminSidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Pump Shifts", path: "/admin/shifts", icon: "⛽" },
    { label: "MDU", path: "/admin/mdu", icon: "🚚" },
    { label: "User Management", path: "/admin/users", icon: "👥" },
    { label: "Receipts & Records", path: "/admin/receipts", icon: "🧾" },
    { label: "Reports", path: "/admin/reports", icon: "📤" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" }
  ];

  return (
    <div className="w-64 border-r bg-slate-900 text-white">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
      </div>
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
              isActive(item.path)
                ? "bg-emerald-600 text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
