import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function TopBar() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/");
  }

  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="text-lg font-semibold text-slate-800">Samruddhi Petroleum</div>
        <div className="flex items-center gap-3">
          {userRole && (
            <span className="text-xs text-slate-600 font-medium">
              {userRole}
            </span>
          )}
          <div className="flex items-center gap-2">
            <button className="button-outline text-xs" onClick={() => i18n.changeLanguage("en")}>EN</button>
            <button className="button-outline text-xs" onClick={() => i18n.changeLanguage("mr")}>मराठी</button>
            <button className="button-outline text-xs" onClick={() => i18n.changeLanguage("hi")}>हिंदी</button>
          </div>
          {userRole && (
            <button className="button text-xs" onClick={handleLogout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
