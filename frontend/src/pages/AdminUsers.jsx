import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminUsers() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const isAdminOnly = userRole === "ADMIN";
  const [activeTab, setActiveTab] = useState("dsm");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ role: activeTab === "dsm" ? "DSM" : "MANAGER", dsmCode: "", name: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const token = localStorage.getItem("token");
      if (!token) return;

      setListLoading(true);
      try {
        const response = await fetch("/api/admin/users", {
          headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await response.json().catch(() => []);
        if (response.ok) {
          setUsers(Array.isArray(data) ? data : []);
        } else {
          setMessage({ type: "error", text: data?.message || "Failed to load users" });
        }
      } catch (error) {
        setMessage({ type: "error", text: `Failed to load users: ${error?.message || "Unknown error"}` });
      } finally {
        setListLoading(false);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    setFormData({ role: activeTab === "dsm" ? "DSM" : "MANAGER", dsmCode: "", name: "", password: "" });
  }, [activeTab]);

  async function handleResetPassword(userId) {
    const newPassword = window.prompt("Enter new password (min 6 chars):");
    if (!newPassword) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setMessage({ type: "success", text: "Password reset successfully" });
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to reset password" });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to reset password: ${error?.message || "Unknown error"}` });
    }
  }

  async function handleDeactivate(userId) {
    const confirmed = window.confirm("Deactivate this user?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/deactivate`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: false } : u)));
        setMessage({ type: "success", text: "User deactivated" });
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to deactivate user" });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to deactivate user: ${error?.message || "Unknown error"}` });
    }
  }

  async function handleActivate(userId) {
    const confirmed = window.confirm("Activate this user?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}/activate`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: true } : u)));
        setMessage({ type: "success", text: "User activated" });
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to activate user" });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to activate user: ${error?.message || "Unknown error"}` });
    }
  }

  async function handleDelete(userId) {
    const confirmed = window.confirm("Are you sure you want to permanently delete this user?");
    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        setMessage({ type: "success", text: "User deleted" });
      } else {
        setMessage({ type: "error", text: data?.message || "Failed to delete user" });
      }
    } catch (error) {
      setMessage({ type: "error", text: `Failed to delete user: ${error?.message || "Unknown error"}` });
    }
  }

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!formData.dsmCode || !formData.name || !formData.password) {
      setMessage({ type: "error", text: "All fields required" });
      return;
    }

    setLoading(true);
    setMessage(""); // Clear previous message
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Not authenticated. Please login again." });
        setLoading(false);
        return;
      }

      console.log("Creating user with payload:", {
        role: activeTab === "dsm" ? "DSM" : "MANAGER",
        dsmCode: formData.dsmCode,
        name: formData.name
      });

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          role: activeTab === "dsm" ? "DSM" : "MANAGER",
          dsmCode: formData.dsmCode,
          name: formData.name,
          password: formData.password
        })
      });

      console.log("Response status:", response.status);

      const rawText = await response.text();
      let data = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (err) {
          console.error("JSON parse error:", err, "Raw response:", rawText);
        }
      }
      
      if (response.ok) {
        setMessage({ type: "success", text: `✓ User ${formData.name} created successfully!` });
        setFormData({ role: activeTab === "dsm" ? "DSM" : "MANAGER", dsmCode: "", name: "", password: "" });
        setShowCreateForm(false);
        setUsers((prev) => [data, ...prev]);
        setTimeout(() => setMessage(""), 3000);
      } else {
        const errorDetails = Array.isArray(data?.errors)
          ? data.errors.map((e) => `${e.path?.join(".") || "field"}: ${e.message}`).join("; ")
          : "";
        const errorMsg = data?.message || rawText || `Server error: ${response.status} ${response.statusText}`;
        console.error("API error:", errorMsg);
        const stackInfo = data?.stack ? `\n${data.stack}` : "";
        const detailsInfo = errorDetails ? `${errorDetails}` : "";
        const displayText = detailsInfo ? detailsInfo : errorMsg;
        setMessage({ type: "error", text: `Error: ${displayText}${stackInfo}` });
      }
    } catch (error) {
      console.error("Network error:", error);
      setMessage({ type: "error", text: `Connection error: ${error?.message || "Failed to reach server"}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 p-6">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">User Management</h1>

        {!isAdminOnly && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
            ⚠️ User management is restricted to Admins only. Manager accounts have read-only access.
          </div>
        )}

        {message && (
          <div className={`mb-4 rounded-lg p-3 text-sm ${message.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
            {message.text}
          </div>
        )}

        <div className="card">
          <div className="mb-4 flex gap-2 border-b">
            <button
              onClick={() => setActiveTab("dsm")}
              className={`px-4 py-2 font-medium ${activeTab === "dsm" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-600"}`}
            >
              DSM Management
            </button>
            <button
              onClick={() => setActiveTab("manager")}
              className={`px-4 py-2 font-medium ${activeTab === "manager" ? "border-b-2 border-emerald-600 text-emerald-600" : "text-slate-600"}`}
            >
              Manager Management
            </button>
          </div>

          <button 
            className="button mb-4" 
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={!isAdminOnly}
          >
            + Add {activeTab === "dsm" ? "DSM" : "Manager"}
          </button>

          {showCreateForm && (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="mb-3 font-semibold">
                Create New {activeTab === "dsm" ? "DSM" : "Manager"}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-sm text-slate-600">
                    {activeTab === "dsm" ? "DSM" : "Manager"} ID
                  </label>
                  <input
                    className="input"
                    placeholder="ID"
                    value={formData.dsmCode}
                    onChange={(e) => setFormData({ ...formData, dsmCode: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Name</label>
                  <input
                    className="input"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Password</label>
                  <input
                    className="input"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>
              <button 
                className="button mt-3" 
                onClick={handleCreateUser}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-100 text-left">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listLoading && (
                  <tr className="border-t">
                    <td className="px-4 py-3 text-slate-500" colSpan={4}>Loading users...</td>
                  </tr>
                )}
                {!listLoading && users.filter((u) => (activeTab === "dsm" ? u.role === "DSM" : u.role === "MANAGER")).length === 0 && (
                  <tr className="border-t">
                    <td className="px-4 py-3 text-slate-500" colSpan={4}>No users found</td>
                  </tr>
                )}
                {!listLoading && users
                  .filter((u) => (activeTab === "dsm" ? u.role === "DSM" : u.role === "MANAGER"))
                  .map((u) => (
                    <tr key={u.id} className="border-t hover:bg-slate-50">
                      <td className="px-4 py-2">{u.name}</td>
                      <td className="px-4 py-2">{u.dsmCode || "—"}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block rounded-full px-2 py-1 text-xs ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                          {u.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {isAdminOnly ? (
                          <>
                            {u.isActive ? (
                              <button className="button-outline mr-2" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                            ) : (
                              <button className="button-outline mr-2" onClick={() => handleActivate(u.id)}>Activate</button>
                            )}
                            <button className="button-outline mr-2" onClick={() => handleResetPassword(u.id)}>Reset Password</button>
                            <button className="button-outline" onClick={() => handleDelete(u.id)}>Delete</button>
                          </>
                        ) : (
                          <span className="text-slate-400 text-xs">View Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
