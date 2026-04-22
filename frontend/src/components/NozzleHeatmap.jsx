/**
 * NozzleHeatmap - Grid showing nozzle points (rows) × shifts (columns)
 * Cell color intensity represents revenue
 * Props:
 *   - heatmap: array of { shiftNumber, points: [{pointNo, revenue}] }
 *   - onCellClick: callback function(pointNo, shiftNumber)
 */
export default function NozzleHeatmap({ heatmap = [], onCellClick }) {
  // Find max revenue for color scaling
  const allRevenues = [];
  heatmap.forEach((shift) => {
    shift.points?.forEach((point) => {
      allRevenues.push(point.revenue || 0);
    });
  });
  const maxRevenue = Math.max(...allRevenues, 1);

  // Generate color based on intensity
  function getHeatColor(value) {
    if (!value) return "#f0f4f8"; // very light blue-gray
    const intensity = Math.min(value / maxRevenue, 1);

    // Color scale: light blue → medium blue → dark blue
    // #e6f1fb (10% intensity) → #185fa5 (100% intensity)
    const r = Math.round(230 - intensity * 180);
    const g = Math.round(241 - intensity * 150);
    const b = Math.round(251 - intensity * 100);

    return `rgb(${r},${g},${b})`;
  }

  function getTextColor(value) {
    const intensity = value ? Math.min(value / maxRevenue, 1) : 0;
    return intensity > 0.5 ? "#042c53" : "#378add";
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        {/* Header row */}
        <div className="mb-2 flex gap-1">
          <div className="w-16 text-center text-xs font-semibold text-slate-600">Nozzle</div>
          {heatmap.map((shift) => (
            <div
              key={`shift-${shift.shiftNumber}`}
              className="w-20 text-center text-xs font-semibold text-slate-600"
            >
              Shift {shift.shiftNumber}
            </div>
          ))}
        </div>

        {/* Data rows */}
        {[1, 2, 3, 4].map((pointNo) => (
          <div key={`row-${pointNo}`} className="mb-1 flex gap-1">
            <div className="w-16 flex items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">
              Point {pointNo}
            </div>
            {heatmap.map((shift) => {
              const pointData = shift.points?.find((p) => p.pointNo === pointNo);
              const revenue = pointData?.revenue || 0;
              return (
                <div
                  key={`cell-${pointNo}-${shift.shiftNumber}`}
                  onClick={() => onCellClick?.(pointNo, shift.shiftNumber)}
                  className="w-20 h-12 flex items-center justify-center rounded-md border border-slate-200 cursor-pointer transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: getHeatColor(revenue),
                    color: getTextColor(revenue)
                  }}
                  title={`Point ${pointNo}, Shift ${shift.shiftNumber}: ₹${revenue.toLocaleString("en-IN")}`}
                >
                  <span className="text-xs font-semibold">
                    ₹{(revenue / 1000).toFixed(0)}k
                  </span>
                </div>
              );
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-slate-600">Low</span>
          <div className="h-3 w-40 rounded-md bg-gradient-to-r from-blue-100 to-blue-600" />
          <span className="text-xs text-slate-600">High</span>
        </div>
      </div>
    </div>
  );
}
