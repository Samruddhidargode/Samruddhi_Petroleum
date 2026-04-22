/**
 * AlertDetailsPanel - Expandable alerts with detail rows
 * Props:
 *   - alerts: array of alert objects with metadata
 *   - onAlertClick: callback when alert is clicked
 */
export default function AlertDetailsPanel({ alerts = [], onAlertClick }) {
  const toneClasses = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
    rose: "bg-orange-50 border-orange-200 text-orange-900",
    sky: "bg-blue-50 border-blue-200 text-blue-900"
  };

  const toneDotClasses = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-orange-500",
    sky: "bg-blue-500"
  };

  return (
    <div className="space-y-2">
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-500">No alerts to display</p>
      ) : (
        alerts.map((alert, index) => (
          <div
            key={`${alert.title}-${index}`}
            onClick={() => onAlertClick?.(alert)}
            className={`p-4 rounded-lg border cursor-pointer transition hover:shadow-md ${
              toneClasses[alert.tone] || toneClasses.sky
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${toneDotClasses[alert.tone]}`} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                <p className="text-sm opacity-85 line-clamp-2">{alert.meta}</p>

                {/* Detail rows for mismatch alerts */}
                {alert.mismatchDetails && alert.mismatchDetails.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-current border-opacity-10 pt-3">
                    {alert.mismatchDetails.map((detail, idx) => (
                      <div
                        key={idx}
                        className="text-xs flex justify-between items-center p-2 bg-black bg-opacity-5 rounded"
                      >
                        <span className="font-medium">
                          Shift {detail.shiftNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span>Expected: {detail.expected}</span>
                          <span className="text-red-600 font-semibold">
                            Actual: {detail.actual}
                          </span>
                          <span className={`font-bold ${
                            Math.abs(detail.delta) > 1000
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}>
                            Δ{detail.delta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
