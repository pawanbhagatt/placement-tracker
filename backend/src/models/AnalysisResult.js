const mongoose = require("mongoose");

const analysisResultSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // References
    resumeId: { type: mongoose.Schema.Types.ObjectId, ref: "Resume", required: true, index: true },
    jdId: { type: mongoose.Schema.Types.ObjectId, ref: "JobDescription", required: true, index: true },

    score: { type: Number, min: 0, max: 100, default: null },

    matchedKeywords: { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },

    suggestions: { type: [String], default: [] },

    status: {
      type: String,
      enum: ["queued", "running", "done", "failed"],
      default: "queued",
      index: true,
    },

    // optional if you want to store failure reason
    error: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent duplicate analysis records for same user+resume+jd
analysisResultSchema.index({ userId: 1, resumeId: 1, jdId: 1 }, { unique: true });

module.exports = mongoose.model("AnalysisResult", analysisResultSchema);