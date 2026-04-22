/**
 * VarianceWaterfall - Horizontal waterfall chart
 * Shows: Sales → -Cash → -Digital → -Fleet → -Credit → Variance
 * Props:
 *   - totalSales: total booked sales
 *   - cash, digital, fleet, credit: payment amounts
 *   - variance: final difference
 */
export default function VarianceWaterfall({ totalSales = 0, cash = 0, digital = 0, fleet = 0, credit = 0, variance = 0 }) {
  const segments = [
    { label: "Booked Sales", value: totalSales, type: "start", color: "#0066CC" },
    { label: "− Cash Collected", value: -cash, type: "sub", color: "#007C3F" },
    { label: "− Digital (QR+Card)", value: -digital, type: "sub", color: "#854f0b" },
    { label: "− Fleet", value: -fleet, type: "sub", color: "#993c1d" },
    { label: "− Party Credit", value: -credit, type: "sub", color: "#993556" },
    { label: "= Variance", value: variance, type: "end", color: variance >= 0 ? "#FF6B35" : "#dc2626" }
  ];

  const scale = totalSales > 0 ? 150 / totalSales : 150 / 10000; // Track width in pixels

  let runningValue = totalSales;

  return (
    <div className="space-y-3">
      {segments.map((segment, idx) => {
        const width = Math.abs(segment.value * scale);
        let offset = 0;

        if (segment.type === "start") {
          offset = 0;
          runningValue = totalSales;
        } else if (segment.type === "sub") {
          offset = (totalSales - Math.abs(runningValue)) * scale;
          runningValue += segment.value;
        } else if (segment.type === "end") {
          offset = (totalSales - Math.abs(variance)) * scale;
        }

        return (
          <div key={idx} className="flex items-center gap-3">
            <div className="w-32 text-sm font-medium text-slate-700">{segment.label}</div>
            <div className="flex-1 flex items-center" style={{ minHeight: "28px" }}>
              <div className="relative h-6 bg-slate-200 rounded-md" style={{ width: "170px" }}>
                <div
                  className="absolute h-6 rounded-md flex items-center justify-center transition-all"
                  style={{
                    left: `${offset}px`,
                    width: `${Math.max(width, 1)}px`,
                    backgroundColor: `${segment.color}20`,
                    border: `1.5px solid ${segment.color}`
                  }}
                >
                  <span className="text-xs font-semibold text-slate-900 px-1 truncate">
                    ₹{(segment.value / 1000).toFixed(0)}k
                  </span>
                </div>
              </div>
              <span className="ml-2 text-sm font-semibold text-slate-900 w-20 text-right">
                ₹{(segment.value / 1000).toFixed(0)}k
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
