import { Routes, Route, Navigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import Stepper from "./components/Stepper";
import LoginPage from "./pages/LoginPage";
import StartShiftPage from "./pages/StartShiftPage";
import NozzlePage from "./pages/NozzlePage";
import CashDropPage from "./pages/CashDropPage";
import PaymentsPage from "./pages/PaymentsPage";
import SummaryPage from "./pages/SummaryPage";
import ConfirmPage from "./pages/ConfirmPage";
import MduTripPage from "./pages/MduTripPage";
import MduEodPage from "./pages/MduEodPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminShifts from "./pages/AdminShifts";
import AdminMdu from "./pages/AdminMdu";
import AdminUsers from "./pages/AdminUsers";
import AdminReceipts from "./pages/AdminReceipts";
import AdminReports from "./pages/AdminReports";
import AdminSettings from "./pages/AdminSettings";
import AdminShiftDetails from "./pages/AdminShiftDetails";

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  const userRole = localStorage.getItem("userRole");

  return (
    <div className="min-h-screen">
      <TopBar />
      <div className={userRole && (userRole === "ADMIN" || userRole === "MANAGER") ? "" : "mx-auto max-w-5xl px-4 pb-10"}>
        {!(userRole && (userRole === "ADMIN" || userRole === "MANAGER")) && <Stepper />}
        <Routes>
          <Route path="/" element={<LoginPage />} />

          {/* DSM Routes */}
          <Route
            path="/shift/start"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <StartShiftPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shift/nozzle"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <NozzlePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shift/cash"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <CashDropPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shift/payments"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <PaymentsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shift/summary"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <SummaryPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/shift/confirm"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <ConfirmPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/mdu/trip"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <MduTripPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/mdu/eod"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <MduEodPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={["DSM"]}>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* Admin/Manager Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/shifts"
            element={
              <PrivateRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <AdminShifts />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/shifts/:id"
            element={
              <PrivateRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <AdminShiftDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/mdu"
            element={
              <PrivateRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <AdminMdu />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <PrivateRoute allowedRoles={["ADMIN"]}>
                <AdminUsers />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/receipts"
            element={
              <PrivateRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <AdminReceipts />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <PrivateRoute allowedRoles={["ADMIN", "MANAGER"]}>
                <AdminReports />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <PrivateRoute allowedRoles={["ADMIN"]}>
                <AdminSettings />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
