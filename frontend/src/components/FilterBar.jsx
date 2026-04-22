/**
 * FilterBar - Period selector and comparison toggle
 * Props:
 *   - selectedPeriod: "today" | "week" | "month"
 *   - compareMode: "yesterday" | "lastWeek" | "lastMonth"
 *   - showCompareBadges: boolean
 *   - onPeriodChange: callback(period)
 *   - onCompareModeChange: callback(mode)
 *   - onToggleCompareBadges: callback(bool)
 *   - onRefresh: callback()
 *   - loading: boolean
 */
export default function FilterBar({
  selectedPeriod = "today",
  compareMode = "yesterday",
  showCompareBadges = true,
  onPeriodChange,
  onCompareModeChange,
  onToggleCompareBadges,
  onRefresh,
  loading = false
}) {
  const periods = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" }
  ];

  const compareModes = [
    { id: "yesterday", label: "vs Yesterday" },
    { id: "lastWeek", label: "vs Last Week" },
    { id: "lastMonth", label: "vs Last Month" }
  ];

  return (
    <div className="mb-6 rounded-[24px] border border-blue-100 bg-white p-4 shadow-md">
      <div className="flex flex-wrap items-center gap-4">
        {/* Period Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">Period:</span>
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => onPeriodChange?.(period.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                  selectedPeriod === period.id
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Toggle */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompareBadges}
              onChange={(e) => onToggleCompareBadges?.(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-xs font-semibold text-slate-600">Compare</span>
          </label>

          {showCompareBadges && (
            <select
              value={compareMode}
              onChange={(e) => onCompareModeChange?.(e.target.value)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 focus:border-blue-500 focus:outline-none"
            >
              {compareModes.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={loading}
          className="ml-auto rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "🔄 Refresh"}
        </button>
      </div>
    </div>
  );
}
