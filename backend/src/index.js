require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { ensureAdminUser } = require("./utils/seedAdmin");

const authRoutes = require("./routes/auth");
const shiftRoutes = require("./routes/shifts");
const mduRoutes = require("./routes/mdu");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/uploads");

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionsSuccessStatus: 200
};

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/mdu", mduRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);

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
