import { motion } from "framer-motion";

/**
 * ShiftDetailsDrawer - Side panel showing shift drill-down details
 * Props:
 *   - isOpen: boolean to show/hide drawer
 *   - shiftId: shift ID being displayed
 *   - data: shift detail data from API { shift, nozzles, payments }
 *   - onClose: callback to close drawer
 *   - loading: boolean showing if data is loading
 */
export default function ShiftDetailsDrawer({ isOpen, shiftId, data, onClose, loading = false }) {
  if (!isOpen) return null;

  const shift = data?.shift || {};
  const nozzles = data?.nozzles || [];
  const payments = data?.payments || {};

  const formatInr = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed right-0 top-0 z-50 h-screen w-full max-w-md bg-white shadow-2xl overflow-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Shift Details</h2>
              <p className="text-sm text-slate-600">
                {shift.shiftDate ? new Date(shift.shiftDate).toLocaleDateString() : "—"} • Shift {shift.shiftNumber}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-900 transition"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8 text-slate-500">Loading shift details...</div>
          ) : (
            <>
              {/* Shift Summary */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Submitter:</span>
                    <span className="font-medium text-slate-900">{shift.submitter}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      shift.status === "SUBMITTED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {shift.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Sales:</span>
                    <span className="font-semibold text-slate-900">{formatInr(shift.totalSales)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Collected:</span>
                    <span className="font-semibold text-slate-900">{formatInr(shift.totalCollected)}</span>
                  </div>
                  <div className={`flex justify-between p-2 rounded-md ${
                    shift.difference === 0
                      ? "bg-emerald-50"
                      : Math.abs(shift.difference) < 1000
                      ? "bg-amber-50"
                      : "bg-red-50"
                  }`}>
                    <span className="text-slate-600">Variance:</span>
                    <span className={`font-semibold ${
                      shift.difference === 0
                        ? "text-emerald-700"
                        : Math.abs(shift.difference) < 1000
                        ? "text-amber-700"
                        : "text-red-700"
                    }`}>
                      {formatInr(shift.difference)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Nozzle Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Nozzle Performance</h3>
                <div className="space-y-2">
                  {nozzles.length === 0 ? (
                    <p className="text-sm text-slate-500">No nozzle data</p>
                  ) : (
                    nozzles.map((nozzle) => (
                      <div
                        key={`nozzle-${nozzle.pointNo}`}
                        className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-slate-900">Point {nozzle.pointNo}</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {formatInr(nozzle.total)}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>HSD:</span>
                            <span className="text-slate-900 font-medium">
                              {formatInr(nozzle.hsd)}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>MS:</span>
                            <span className="text-slate-900 font-medium">
                              {formatInr(nozzle.ms)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Payment Breakdown */}
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">Payment Collection</h3>
                <div className="space-y-2">
                  {[
                    { label: "Cash", value: payments.cash, color: "bg-blue-50 text-blue-700" },
                    { label: "Digital (QR + Card)", value: payments.digital, color: "bg-green-50 text-green-700" },
                    { label: "Fleet", value: payments.fleet, color: "bg-orange-50 text-orange-700" },
                    { label: "Party Credit", value: payments.credit, color: "bg-purple-50 text-purple-700" }
                  ].map((mode) => (
                    <div
                      key={mode.label}
                      className={`p-3 rounded-lg border border-slate-200 ${mode.color}`}
                    >
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium">{mode.label}</span>
                        <span className="font-semibold">{formatInr(mode.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full mt-6 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
                View Full Shift
              </button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
