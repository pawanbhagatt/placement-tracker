const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },

    status: {
      type: String,
      required: true,
      enum: ["draft", "applied", "interview", "offer", "rejected", "accepted", "on_hold"],
      default: "applied",
      index: true,
    },

    appliedDate: { type: Date, default: Date.now },
    nextFollowUpAt: { type: Date, default: null },

    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

applicationSchema.index({ userId: 1, appliedDate: -1 });

module.exports = mongoose.model("Application", applicationSchema);