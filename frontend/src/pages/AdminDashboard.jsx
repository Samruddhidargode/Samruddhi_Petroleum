import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";
import SparklineChart from "../components/SparklineChart";
import NozzleHeatmap from "../components/NozzleHeatmap";
import VarianceWaterfall from "../components/VarianceWaterfall";
import ShiftDetailsDrawer from "../components/ShiftDetailsDrawer";
import AlertDetailsPanel from "../components/AlertDetailsPanel";
import FilterBar from "../components/FilterBar";
import PieChart from "../components/PieChart";
import LineChart from "../components/LineChart";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" }
  }
};

const palette = ["#0066CC", "#007C3F", "#FF6B35", "#FFA500", "#00A3E0", "#6EC6F1"];

function formatInr(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatCompactNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

function percentOf(value, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, (Number(value || 0) / Number(total)) * 100));
}

function TrendBadge({ value, positiveLabel = "Healthy", negativeLabel = "Attention" }) {
  const positive = Number(value || 0) >= 0;
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
        positive
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-orange-50 text-orange-700 ring-1 ring-orange-200"
      }`}
    >
      <span>{positive ? "↗" : "↘"}</span>
      {positive ? positiveLabel : negativeLabel}
    </span>
  );
}

function GlassPanel({ children, className = "" }) {
  return (
    <div
      className={`rounded-[24px] border border-blue-100 bg-white shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

function MetricCard({ label, value, subtitle, accent, badge, sparklineData, sparklineColor }) {
  return (
    <GlassPanel className="relative overflow-hidden p-5">
      <div
        className="absolute inset-x-5 top-0 h-[3px] rounded-full opacity-90"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`
        }}
      />
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
        </div>
        {badge}
      </div>
      <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-4 h-12">
          <SparklineChart data={sparklineData} label={label} color={sparklineColor || accent} height={12} />
        </div>
      )}
    </GlassPanel>
  );
}

function HorizontalBars({ title, rows, valueFormatter, emptyText = "No data available", onRowClick }) {
  const maxValue = Math.max(...rows.map((row) => Number(row.value || 0)), 0);

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">
          Live analytics
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">{emptyText}</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => {
            const isClickable = onRowClick && row.shiftId;
            const barColor = palette[index % palette.length];
            const width = maxValue > 0 ? Math.max(8, (Number(row.value || 0) / maxValue) * 100) : 0;
            return (
              <div
                key={row.key}
                className={`space-y-2 p-3 rounded-lg transition ${
                  isClickable ? "cursor-pointer hover:bg-slate-50" : ""
                }`}
                onClick={() => isClickable && onRowClick?.(row.shiftId)}
              >
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{row.label}</span>
                  <span className="font-semibold text-slate-900">{valueFormatter(row.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full shadow-md transition"
                    style={{
                      width: `${width}%`,
                      background: `linear-gradient(90deg, ${barColor}, ${barColor}99)`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}

function DistributionList({ title, rows, total, valueFormatter }) {
  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-500">Distribution</span>
      </div>

      {rows.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">No data available</p>
      ) : (
        <div className="space-y-4">
          {rows.map((row, index) => {
            const color = palette[index % palette.length];
            const percentage = percentOf(row.value, total);
            return (
              <div key={row.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full shadow-md"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium text-slate-700">{row.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{percentage.toFixed(1)}%</span>
                </div>
                <div className="mb-2 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.max(percentage, 6)}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}99)`
                    }}
                  />
                </div>
                <div className="text-sm text-slate-600">{valueFormatter(row.value)}</div>
              </div>
            );
          })}
        </div>
      )}
    </GlassPanel>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  
  // Filter state
  const [selectedPeriod, setSelectedPeriod] = useState("today");
  const [fromDate, setFromDate] = useState(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(new Date().toISOString().slice(0, 10));
  const [compareMode, setCompareMode] = useState("yesterday");
  const [showCompareBadges, setShowCompareBadges] = useState(true);

  // Drill-down state
  const [expandedShiftId, setExpandedShiftId] = useState(null);
  const [shiftDetailsData, setShiftDetailsData] = useState(null);
  const [shiftDetailsLoading, setShiftDetailsLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, [fromDate, toDate, compareMode]);

  async function loadDashboard() {
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Not authenticated. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const query = new URLSearchParams({
        from: fromDate,
        to: toDate,
        compare: compareMode
      }).toString();
      
      const response = await fetch(`/api/analytics/dashboard?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(body?.message || "Failed to load dashboard");
        return;
      }
      setData(body);
    } catch (error) {
      setMessage(error?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  async function loadShiftDetails(shiftId) {
    if (!shiftId) return;
    
    const token = localStorage.getItem("token");
    if (!token) return;

    setShiftDetailsLoading(true);
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) {
        setShiftDetailsData(body);
      }
    } catch (error) {
      console.error("Failed to load shift details:", error);
    } finally {
      setShiftDetailsLoading(false);
    }
  }

  // Handle period filter change
  function handlePeriodChange(period) {
    setSelectedPeriod(period);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (period) {
      case "today":
        setFromDate(today.toISOString().slice(0, 10));
        setToDate(today.toISOString().slice(0, 10));
        setCompareMode("yesterday");
        break;
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - today.getDay());
        setFromDate(weekStart.toISOString().slice(0, 10));
        setToDate(today.toISOString().slice(0, 10));
        setCompareMode("lastWeek");
        break;
      case "month":
        const monthStart = new Date(today);
        monthStart.setDate(1);
        setFromDate(monthStart.toISOString().slice(0, 10));
        setToDate(today.toISOString().slice(0, 10));
        setCompareMode("lastMonth");
        break;
      default:
        break;
    }
  }

  const userRole = localStorage.getItem("userRole") || "ADMIN";
  const kpis = data?.kpis || {};
  const charts = data?.charts || {};

  const primaryMetrics = useMemo(
    () => [
      {
        label: "Today's Sales",
        value: formatInr(kpis.totalSales),
        subtitle: "Live station sales booked for the selected date",
        accent: "#22c55e",
        sparklineColor: "#10b981",
        sparklineData: showCompareBadges ? data?.sparklines?.totalSales : null,
        badge: showCompareBadges ? (
          <TrendBadge
            value={kpis.salesDelta}
            positiveLabel={`+${kpis.salesDelta?.toFixed(1) || 0}%`}
            negativeLabel={`${kpis.salesDelta?.toFixed(1) || 0}%`}
          />
        ) : (
          <TrendBadge value={Number(kpis.totalSales || 0)} positiveLabel="Strong day" />
        )
      },
      {
        label: "Total Collection",
        value: formatInr(kpis.totalCollected),
        subtitle: "Cash + digital + credit collections captured",
        accent: "#38bdf8",
        sparklineColor: "#0ea5e9",
        sparklineData: showCompareBadges ? data?.sparklines?.totalCollected : null,
        badge: showCompareBadges ? (
          <TrendBadge
            value={kpis.collectedDelta}
            positiveLabel={`+${kpis.collectedDelta?.toFixed(1) || 0}%`}
            negativeLabel={`${kpis.collectedDelta?.toFixed(1) || 0}%`}
          />
        ) : (
          <TrendBadge value={Number(kpis.totalCollected || 0)} positiveLabel="On track" />
        )
      },
      {
        label: "Variance",
        value: formatInr(kpis.difference),
        subtitle: "Collection minus booked sales across shifts",
        accent: Number(kpis.difference || 0) >= 0 ? "#f59e0b" : "#f43f5e",
        badge: (
          <TrendBadge
            value={-Math.abs(Number(kpis.difference || 0))}
            positiveLabel="Balanced"
            negativeLabel="Check mismatch"
          />
        )
      },
      {
        label: "Pending Submissions",
        value: formatCompactNumber(kpis.pendingSubmissions),
        subtitle: "Draft or incomplete shift submissions needing review",
        accent: "#a855f7",
        badge: (
          <span className="inline-flex items-center rounded-full bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-300 ring-1 ring-violet-400/20">
            {Number(kpis.pendingSubmissions || 0) > 0 ? "Needs action" : "All clear"}
          </span>
        )
      }
    ],
    [kpis, data?.sparklines, showCompareBadges]
  );

  const secondaryMetrics = useMemo(
    () => [
      {
        label: "Cash Channel",
        value: formatInr(kpis.cashTotal),
        subtitle: "Cash receipts recorded in today's operations"
      },
      {
        label: "Digital Channel",
        value: formatInr(kpis.digitalTotal),
        subtitle: "QR + card collections combined"
      },
      {
        label: "Fleet & Credit",
        value: formatInr(Number(kpis.fleetTotal || 0) + Number(kpis.partyCreditTotal || 0)),
        subtitle: "Fleet and party credit business handled today"
      }
    ],
    [kpis]
  );

  const salesByShiftRows = useMemo(
    () =>
      (charts.salesByShift || []).map((row) => ({
        key: `shift-${row.shiftNumber}`,
        label: `Shift ${row.shiftNumber}`,
        value: row.value
      })),
    [charts.salesByShift]
  );

  const paymentRows = useMemo(
    () =>
      (charts.paymentModes || []).map((row) => ({
        key: `payment-${row.mode}`,
        label: row.mode.replaceAll("_", " "),
        value: row.value
      })),
    [charts.paymentModes]
  );

  const fuelRows = useMemo(
    () =>
      (charts.fuelSplit || []).map((row) => ({
        key: `fuel-${row.fuelType}`,
        label: row.fuelType,
        value: row.value
      })),
    [charts.fuelSplit]
  );

  const pointRows = useMemo(
    () =>
      (charts.pointWiseSales || []).map((row) => ({
        key: `point-${row.pointNo}`,
        label: `Point ${row.pointNo}`,
        value: row.value
      })),
    [charts.pointWiseSales]
  );

  const comparisonChartData = useMemo(() => {
    const sparklines = data?.sparklines;
    if (!sparklines?.totalSales || !sparklines?.totalCollected) {
      return null;
    }

    // Create labels for 7 days
    const labels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }

    return {
      labels,
      datasets: [
        {
          label: 'Total Sales',
          data: sparklines.totalSales || [],
          borderColor: '#0066CC',
          backgroundColor: 'rgba(0, 102, 204, 0.05)',
        },
        {
          label: 'Total Collected',
          data: sparklines.totalCollected || [],
          borderColor: '#007C3F',
          backgroundColor: 'rgba(0, 124, 63, 0.05)',
        }
      ]
    };
  }, [data?.sparklines]);

  const alerts = useMemo(() => {
    const list = [];

    if (Number(kpis.pendingSubmissions || 0) > 0) {
      list.push({
        title: "Pending shift submissions",
        meta: `${kpis.pendingSubmissions} shift entries are still in draft state`,
        tone: "amber"
      });
    }

    if (Number(kpis.mismatchCount || 0) > 0) {
      list.push({
        title: "Shift mismatch detected",
        meta: `${kpis.mismatchCount} shifts need reconciliation review`,
        tone: "rose"
      });
    }

    if (Number(kpis.digitalTotal || 0) > Number(kpis.cashTotal || 0)) {
      list.push({
        title: "Digital channel leading",
        meta: "Digital collections are ahead of cash today",
        tone: "sky"
      });
    }

    if (list.length === 0) {
      list.push({
        title: "Operations are stable",
        meta: "No major exceptions found for the selected date",
        tone: "emerald"
      });
    }

    return list;
  }, [kpis]);

  const toneClasses = {
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    rose: "bg-orange-50 text-orange-700 border border-orange-200",
    sky: "bg-blue-50 text-blue-700 border border-blue-200"
  };

  const paymentTotal = (charts.paymentModes || []).reduce((sum, row) => sum + Number(row.value || 0), 0);
  const fuelTotal = (charts.fuelSplit || []).reduce((sum, row) => sum + Number(row.value || 0), 0);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      <main className="relative flex-1 overflow-auto">
        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <motion.div
            className="mb-6 overflow-hidden rounded-[28px] border border-blue-200 bg-white p-6 shadow-md"
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-blue-50 p-3 ring-1 ring-blue-200">
                  <img src="/brand/logo.png" alt="Samruddhi Petroleum" className="h-12 w-12 rounded-xl object-cover" />
                </div>
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Live station view
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200">
                      {userRole} dashboard
                    </span>
                  </div>
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    Premium Operations Dashboard
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    Inspired by the teammate dashboard shell, but driven entirely by your live backend analytics:
                    collections, fuel split, point performance, shift sales, and operational alerts.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dashboard date range</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">{fromDate} to {toDate}</div>
                </div>
              </div>
            </div>
          </motion.div>

          <FilterBar
            selectedPeriod={selectedPeriod}
            compareMode={compareMode}
            showCompareBadges={showCompareBadges}
            onPeriodChange={handlePeriodChange}
            onCompareModeChange={setCompareMode}
            onToggleCompareBadges={setShowCompareBadges}
            onRefresh={loadDashboard}
            loading={loading}
          />

          <AnimatePresence>
            {message && (
              <motion.div
                className="mb-6 rounded-2xl border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-700"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {primaryMetrics.map((metric) => (
              <motion.div key={metric.label} variants={itemVariants}>
                <MetricCard {...metric} />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-4 grid gap-4 lg:grid-cols-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {secondaryMetrics.map((metric, index) => {
              const bgColor = palette[(index + 2) % palette.length];
              const bgClass = 
                index === 0 ? 'bg-blue-50' :
                index === 1 ? 'bg-emerald-50' :
                'bg-orange-50';
              const textClass = 
                index === 0 ? 'text-blue-700' :
                index === 1 ? 'text-emerald-700' :
                'text-orange-700';
              
              return (
                <motion.div key={metric.label} variants={itemVariants}>
                  <GlassPanel className={`p-5 ${bgClass} border-2`} style={{ borderColor: bgColor + '40' }}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs uppercase tracking-[0.2em] text-slate-600">{metric.label}</span>
                      <span
                        className="h-3 w-3 rounded-full shadow-sm"
                        style={{ backgroundColor: bgColor }}
                      />
                    </div>
                    <div className={`text-2xl font-bold ${textClass}`}>{metric.value}</div>
                    <p className="mt-2 text-sm text-slate-600">{metric.subtitle}</p>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <HorizontalBars
              title="Sales by Shift"
              rows={salesByShiftRows}
              valueFormatter={formatInr}
              emptyText="No shift sales available for the selected date"
            />

            <HorizontalBars
              title="Point-wise Sales Performance"
              rows={pointRows}
              valueFormatter={formatInr}
              emptyText="No nozzle point sales available for the selected date"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <GlassPanel className="p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900">Payment Mix</h3>
                <p className="mt-1 text-xs text-slate-500">Breakdown by payment mode</p>
              </div>
              {paymentRows.length > 0 ? (
                <div className="mx-auto w-full max-w-[260px]">
                  <PieChart
                    data={paymentRows.map(row => ({
                      label: row.label,
                      value: Number(row.value || 0)
                    }))}
                    height={200}
                  />
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">No payment data available</p>
              )}
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900">Fuel Revenue Split</h3>
                <p className="mt-1 text-xs text-slate-500">HSD vs MS distribution</p>
              </div>
              {fuelRows.length > 0 ? (
                <div className="mx-auto w-full max-w-[260px]">
                  <PieChart
                    data={fuelRows.map(row => ({
                      label: row.label,
                      value: Number(row.value || 0)
                    }))}
                    height={200}
                  />
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">No fuel data available</p>
              )}
            </GlassPanel>
          </div>

          {/* Comparison and Trend Analysis */}
          {comparisonChartData && (
            <div className="mt-6">
              <GlassPanel className="mx-auto w-full max-w-5xl p-5">
                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-slate-900">7-Day Trend Comparison</h3>
                  <p className="mt-1 text-xs text-slate-500">Sales vs Collection trends over the last week</p>
                </div>
                <LineChart
                  labels={comparisonChartData.labels}
                  datasets={comparisonChartData.datasets}
                  height={150}
                />
              </GlassPanel>
            </div>
          )}

          {/* Heatmap and Waterfall Charts */}
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <GlassPanel className="p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900">Nozzle × Shift Heatmap</h3>
                <p className="mt-1 text-xs text-slate-500">Revenue intensity by point and shift</p>
              </div>
              {data?.heatmap && data.heatmap.length > 0 ? (
                <NozzleHeatmap
                  heatmap={data.heatmap}
                  onCellClick={(pointNo, shiftNum) => {
                    console.log(`Clicked nozzle point ${pointNo}, shift ${shiftNum}`);
                  }}
                />
              ) : (
                <p className="py-10 text-center text-sm text-slate-500">No heatmap data available</p>
              )}
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="mb-5">
                <h3 className="text-lg font-semibold text-slate-900">Variance Waterfall</h3>
                <p className="mt-1 text-xs text-slate-500">Sales breakdown by payment mode</p>
              </div>
              <VarianceWaterfall
                totalSales={Number(kpis.totalSales || 0)}
                cash={Number(kpis.cashTotal || 0)}
                digital={Number(kpis.digitalTotal || 0)}
                fleet={Number(kpis.fleetTotal || 0)}
                credit={Number(kpis.partyCreditTotal || 0)}
                variance={Number(kpis.difference || 0)}
              />
            </GlassPanel>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <GlassPanel className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Operations Snapshot</h3>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">Station intelligence</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-blue-100 bg-slate-50 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-600">Cash vs digital</div>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="text-2xl font-bold text-slate-900">{formatInr(kpis.cashTotal)}</div>
                    <div className="pb-1 text-sm text-slate-600">cash</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    Digital processed: <span className="font-semibold text-blue-700">{formatInr(kpis.digitalTotal)}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-slate-50 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-600">Business accounts</div>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="text-2xl font-bold text-slate-900">
                      {formatInr(Number(kpis.partyCreditTotal || 0) + Number(kpis.fleetTotal || 0))}
                    </div>
                    <div className="pb-1 text-sm text-slate-600">fleet + credit</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-700">
                    Fleet: <span className="font-semibold text-blue-700">{formatInr(kpis.fleetTotal)}</span> • Credit:{" "}
                    <span className="font-semibold text-blue-700">{formatInr(kpis.partyCreditTotal)}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-slate-50 p-5 md:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-600">Collection balance</div>
                    <TrendBadge
                      value={-Math.abs(Number(kpis.difference || 0))}
                      positiveLabel="Balanced"
                      negativeLabel="Review variance"
                    />
                  </div>
                  <div className="text-3xl font-bold text-slate-900">{formatInr(kpis.difference)}</div>
                  <p className="mt-2 text-sm text-slate-700">
                    Positive values indicate collections ahead of sales. Negative or mismatched values should be audited
                    against shift entries and payment splits.
                  </p>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Alerts & Focus</h3>
                <span className="text-xs text-slate-500">{alerts.length} item(s)</span>
              </div>

              <AlertDetailsPanel
                alerts={alerts}
                onAlertClick={(alert) => {
                  console.log("Alert clicked:", alert);
                }}
              />
            </GlassPanel>
          </div>

          {loading && (
            <motion.div
              className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Fetching the latest station analytics...
            </motion.div>
          )}
        </div>
      </main>

      {/* Shift Details Drawer */}
      <AnimatePresence>
        {expandedShiftId && (
          <ShiftDetailsDrawer
            isOpen={true}
            shiftId={expandedShiftId}
            data={shiftDetailsData}
            onClose={() => {
              setExpandedShiftId(null);
              setShiftDetailsData(null);
            }}
            loading={shiftDetailsLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
