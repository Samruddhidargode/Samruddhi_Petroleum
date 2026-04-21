require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { ensureAdminUser } = require("./utils/seedAdmin");
const { createRateLimiter } = require("./middleware/rateLimit");

const authRoutes = require("./routes/auth");
const shiftRoutes = require("./routes/shifts");
const mduRoutes = require("./routes/mdu");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/uploads");
const analyticsRoutes = require("./routes/analytics");
const reportsRoutes = require("./routes/reports");

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || localOriginPattern.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  optionsSuccessStatus: 200
};

const apiRateLimiter = createRateLimiter({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  max: Number(process.env.RATE_LIMIT_MAX || 300)
});

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));
app.use("/api", apiRateLimiter);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/", (req, res) => {
  res.json({ message: "API is running", status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/mdu", mduRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reports", reportsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found", path: req.path, method: req.method });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, async () => {
  try {
    await ensureAdminUser();
    console.log(`API running on port ${port}`);
  } catch (error) {
    console.error("Failed to seed admin user", error);
  }
});

