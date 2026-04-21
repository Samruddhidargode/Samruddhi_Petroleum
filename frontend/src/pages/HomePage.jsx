import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to appropriate page
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");
    if (token && userRole) {
      if (userRole === "ADMIN" || userRole === "MANAGER") {
        navigate("/admin/dashboard");
      } else {
        navigate("/shift/start");
      }
    }
  }, [navigate]);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url(/brand/bg.jpg)"
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-4 py-12 md:justify-center md:py-0">
        {/* Logo & Title - Top Section */}
        <div className="mt-8 text-center md:mt-0 md:mb-12">
          <img 
            src="/brand/logo.png" 
            alt="Samruddhi Petroleum" 
            className="mx-auto mb-4 h-16 w-auto drop-shadow-lg"
          />
          <h1 className="text-3xl font-bold text-white md:text-5xl lg:text-6xl drop-shadow-lg">
            Samruddhi Petroleum
          </h1>
          <p className="mt-2 text-lg text-white/90 drop-shadow-md">
            DSM Shift Management System
          </p>
        </div>

        {/* Role Selection - Horizontal Bottom/Center */}
        <div className="w-full max-w-4xl space-y-4 md:space-y-0">
          <p className="mb-6 text-center text-lg font-semibold text-white drop-shadow-md">
            Select Your Role to Continue
          </p>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <button
              onClick={() => navigate("/login?role=DSM")}
              className="group rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-5 text-center font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
            >
              <div className="text-sm font-medium text-emerald-100">DSM (Delivery Staff)</div>
              <div className="text-xl mt-1">Shift Management</div>
            </button>

            <button
              onClick={() => navigate("/login?role=MANAGER")}
              className="group rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 text-center font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
            >
              <div className="text-sm font-medium text-blue-100">MANAGER</div>
              <div className="text-xl mt-1">Verify & Monitor</div>
            </button>

            <button
              onClick={() => navigate("/login?role=ADMIN")}
              className="group rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-5 text-center font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-violet-500/50 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/20"
            >
              <div className="text-sm font-medium text-violet-100">ADMIN</div>
              <div className="text-xl mt-1">System Control</div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-white/70 text-sm drop-shadow-md">
          <p>© 2026 Samruddhi Petroleum. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
