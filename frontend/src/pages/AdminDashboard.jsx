import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AdminSidebar from "../components/AdminSidebar";

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

function MetricCard({ label, value, subtitle, accent, badge }) {
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
    </GlassPanel>
  );
}

function HorizontalBars({ title, rows, valueFormatter, emptyText = "No data available" }) {
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
            const barColor = palette[index % palette.length];
            const width = maxValue > 0 ? Math.max(8, (Number(row.value || 0) / maxValue) * 100) : 0;
            return (
              <div key={row.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">{row.label}</span>
                  <span className="font-semibold text-slate-900">{valueFormatter(row.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full shadow-md"
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

  useEffect(() => {
    loadDashboard();
  }, []);

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
      const response = await fetch("/api/analytics/dashboard", {
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
        badge: <TrendBadge value={Number(kpis.totalSales || 0)} positiveLabel="Strong day" />
      },
      {
        label: "Total Collection",
        value: formatInr(kpis.totalCollected),
        subtitle: "Cash + digital + credit collections captured",
        accent: "#38bdf8",
        badge: <TrendBadge value={Number(kpis.totalCollected || 0)} positiveLabel="On track" />
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
    [kpis]
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
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Dashboard date</div>
                  <div className="mt-1 text-base font-semibold text-slate-900">{data?.date || "-"}</div>
                </div>
                <button
                  type="button"
                  onClick={loadDashboard}
                  disabled={loading}
                  className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Refreshing..." : "Refresh dashboard"}
                </button>
              </div>
            </div>
          </motion.div>

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
            {secondaryMetrics.map((metric, index) => (
              <motion.div key={metric.label} variants={itemVariants}>
                <GlassPanel className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">{metric.label}</span>
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: palette[(index + 2) % palette.length] }}
                    />
                  </div>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <p className="mt-2 text-sm text-slate-400">{metric.subtitle}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <HorizontalBars
              title="Sales by Shift"
              rows={salesByShiftRows}
              valueFormatter={formatInr}
              emptyText="No shift sales available for the selected date"
            />

            <DistributionList
              title="Payment Mix"
              rows={paymentRows}
              total={paymentTotal}
              valueFormatter={formatInr}
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
            <DistributionList
              title="Fuel Revenue Split"
              rows={fuelRows}
              total={fuelTotal}
              valueFormatter={formatInr}
            />

            <HorizontalBars
              title="Point-wise Sales Performance"
              rows={pointRows}
              valueFormatter={formatInr}
              emptyText="No nozzle point sales available for the selected date"
            />
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
            <GlassPanel className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Operations Snapshot</h3>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-400">Station intelligence</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-black/10 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Cash vs digital</div>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="text-2xl font-bold text-white">{formatInr(kpis.cashTotal)}</div>
                    <div className="pb-1 text-sm text-slate-400">cash</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    Digital processed: <span className="font-semibold text-slate-200">{formatInr(kpis.digitalTotal)}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/10 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Business accounts</div>
                  <div className="mt-3 flex items-end gap-3">
                    <div className="text-2xl font-bold text-white">
                      {formatInr(Number(kpis.partyCreditTotal || 0) + Number(kpis.fleetTotal || 0))}
                    </div>
                    <div className="pb-1 text-sm text-slate-400">fleet + credit</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    Fleet: <span className="font-semibold text-slate-200">{formatInr(kpis.fleetTotal)}</span> • Credit:{" "}
                    <span className="font-semibold text-slate-200">{formatInr(kpis.partyCreditTotal)}</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/10 p-5 md:col-span-2">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Collection balance</div>
                    <TrendBadge
                      value={-Math.abs(Number(kpis.difference || 0))}
                      positiveLabel="Balanced"
                      negativeLabel="Review variance"
                    />
                  </div>
                  <div className="text-3xl font-bold text-white">{formatInr(kpis.difference)}</div>
                  <p className="mt-2 text-sm text-slate-400">
                    Positive values indicate collections ahead of sales. Negative or mismatched values should be audited
                    against shift entries and payment splits.
                  </p>
                </div>
              </div>
            </GlassPanel>

            <GlassPanel className="p-6">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Alerts & Focus</h3>
                <span className="text-xs text-slate-400">{alerts.length} item(s)</span>
              </div>

              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div
                    key={`${alert.title}-${index}`}
                    className="rounded-2xl border border-white/5 bg-black/10 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h4 className="font-medium text-white">{alert.title}</h4>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[alert.tone]}`}>
                        {alert.tone.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{alert.meta}</p>
                  </div>
                ))}
              </div>
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
    </div>
  );
}
