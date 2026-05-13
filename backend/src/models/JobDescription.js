const mongoose = require("mongoose");

const jobDescriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, default: null, trim: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

jobDescriptionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("JobDescription", jobDescriptionSchema);