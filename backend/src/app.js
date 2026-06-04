const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const { errorHandler, notFound } = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const applicationRoutes = require("./routes/application.routes");
const resumeRoutes = require("./routes/resume.routes");
const jdRoutes = require("./routes/jd.routes");
const analysisRoutes = require("./routes/analysis.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// serve uploads (dev only)
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads"))
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jds", jdRoutes);
app.use("/api/analysis", analysisRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;