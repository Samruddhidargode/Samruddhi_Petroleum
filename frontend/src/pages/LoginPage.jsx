import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Read role from the URL so one login screen can serve DSM, Manager, and Admin.
  const [role, setRole] = useState(searchParams.get("role") || "DSM");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam && ["DSM", "MANAGER", "ADMIN"].includes(roleParam)) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const usernameLabel =
    role === "ADMIN" ? "Admin Username" : role === "MANAGER" ? "Manager Username" : "DSM ID";

  const roleColors = {
    DSM: "from-blue-600 to-blue-700",
    MANAGER: "from-emerald-600 to-emerald-700",
    ADMIN: "from-blue-600 to-blue-700"
  };

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send credentials to the auth API and wait for a token/user response.
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dsmCode: username,
          password,
          role
        })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Login failed");
      }

      const data = await response.json();
      // Keep the session in localStorage so later pages can reuse the token.
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);

      // Route users to the correct first page after login.
      if (data.user.role === "ADMIN" || data.user.role === "MANAGER") {
        navigate("/admin/dashboard");
      } else {
        navigate("/shift/start");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-blue-200 bg-white p-8 shadow-lg">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold" style={{color: "#0066CC"}}>LOGIN</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your credentials to access the system
            </p>
          </div>

          {/* This badge confirms which role is being authenticated. */}
          <div className={`mb-6 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r ${roleColors[role]} px-4 py-2 font-semibold text-white shadow-lg`}>
            {role === "DSM" && "🚚 DSM - Delivery Staff"}
            {role === "MANAGER" && "👤 Manager - Verify & Monitor"}
            {role === "ADMIN" && "⚙️ Admin - System Control"}
          </div>

          {/* Login form sends username, password, and role together. */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {usernameLabel}
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                placeholder={usernameLabel}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500/20"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-lg font-semibold py-3 text-white transition-all duration-200 ${
                loading
                  ? "bg-slate-300 cursor-not-allowed"
                  : `bg-gradient-to-r ${roleColors[role]} hover:shadow-lg hover:shadow-current`
              }`}
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          {/* Back button returns to the role selection screen. */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
          >
            ← Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  );
}
