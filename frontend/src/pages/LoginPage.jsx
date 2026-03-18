import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState("ADMIN");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const usernameLabel =
    role === "ADMIN" ? "Admin Username" : role === "MANAGER" ? "Manager Username" : "DSM ID";

  async function handleLogin(e) {
    e.preventDefault();
    setError("");

    try {
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
      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.user.role);

      if (data.user.role === "ADMIN" || data.user.role === "MANAGER") {
        navigate("/admin/dashboard");
      } else {
        navigate("/shift/start");
      }
    } catch (err) {
      setError(err.message || "Login failed");
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card mt-8">
        <h1 className="text-lg font-semibold text-slate-800">{t("loginTitle")}</h1>
        <form className="mt-4 space-y-3" onSubmit={handleLogin}>
          <div>
            <label className="text-sm text-slate-600">Role</label>
            <select
              className="input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="DSM">DSM</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-600">{usernameLabel}</label>
            <input
              className="input"
              placeholder={usernameLabel}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button className="button w-full" type="submit">Login</button>
          <button className="button-outline w-full" type="button">Change Password</button>
        </form>
      </div>
    </div>
  );
}
