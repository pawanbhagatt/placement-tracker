const { z } = require("zod");
const mongoose = require("mongoose");

const AnalysisResult = require("../models/AnalysisResult");
const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const { analysisQueue } = require("../jobs/analysisQueue");

const createSchema = z.object({
  resumeId: z.string().min(1),
  jdId: z.string().min(1),
});

// POST /api/analysis
async function createAnalysis(req, res) {
  const { resumeId, jdId } = createSchema.parse(req.body);

  // Basic ObjectId validation (avoids CastError noise)
  if (!mongoose.isValidObjectId(resumeId) || !mongoose.isValidObjectId(jdId)) {
    return res.status(400).json({ message: "Invalid resumeId or jdId" });
  }

  // Ensure ownership
  const [resume, jd] = await Promise.all([
    Resume.findOne({ _id: resumeId, userId: req.user.id }),
    JobDescription.findOne({ _id: jdId, userId: req.user.id }),
  ]);

  if (!resume) return res.status(404).json({ message: "Resume not found" });
  if (!jd) return res.status(404).json({ message: "Job description not found" });

  // Create a new analysis record every time (simpler + keeps history)
  const ar = await AnalysisResult.create({
    userId: req.user.id,
    resumeId,
    jdId,
    status: "queued",
    score: 0,
    matchedKeywords: [],
    missingKeywords: [],
    suggestions: [],
    error: null,
  });

  // Queue the job; we use analysisResultId as the stable identifier
  await analysisQueue.add("analyze", {
    analysisResultId: ar._id.toString(),
    userId: req.user.id,
    resumeId,
    jdId,
  });

  return res.status(202).json({
    analysisResultId: ar._id,
    status: ar.status,
  });
}

// GET /api/analysis/:analysisResultId
async function getAnalysis(req, res) {
  const { analysisResultId } = req.params;

  if (!mongoose.isValidObjectId(analysisResultId)) {
    return res.status(400).json({ message: "Invalid analysisResultId" });
  }

  const ar = await AnalysisResult.findOne({
    _id: analysisResultId,
    userId: req.user.id,
  });

  if (!ar) return res.status(404).json({ message: "Analysis result not found" });

  return res.json(ar);
}

module.exports = { createAnalysis, getAnalysis };
// const { z } = require("zod");
// const AnalysisResult = require("../models/AnalysisResult");
// const Resume = require("../models/Resume");
// const JobDescription = require("../models/JobDescription");
// const { analysisQueue } = require("../jobs/analysisQueue");

// const createSchema = z.object({
//   resumeId: z.string().min(1),
//   jdId: z.string().min(1),
// });

// async function createAnalysis(req, res) {
//   const { resumeId, jdId } = createSchema.parse(req.body);

//   // ensure ownership
//   const [resume, jd] = await Promise.all([
//     Resume.findOne({ _id: resumeId, userId: req.user.id }),
//     JobDescription.findOne({ _id: jdId, userId: req.user.id }),
//   ]);

//   if (!resume) return res.status(404).json({ message: "Resume not found" });
//   if (!jd) return res.status(404).json({ message: "JD not found" });

//   // upsert unique (resumeId, jdId)
//   let ar = await AnalysisResult.findOne({ resumeId, jdId, userId: req.user.id });
//   if (!ar) {
//     ar = await AnalysisResult.create({ userId: req.user.id, resumeId, jdId, status: "queued" });
//   } else {
//     ar.status = "queued";
//     ar.score = 0; 
//     ar.matchedKeywords = [];
//     ar.missingKeywords = [];
//     ar.suggestions = [];
//     ar.error = null;
//     await ar.save();
//   }

//   const job = await analysisQueue.add("analyze", {
//     analysisResultId: ar._id.toString(),
//     userId: req.user.id,
//     resumeId,
//     jdId,
//   });

//   res.status(202).json({ jobId: job.id, analysisResultId: ar._id, status: ar.status });
// }

// async function getAnalysisStatus(req, res) {
//   const { jobId } = req.params;

//   // BullMQ jobId is not Mongo id; we return both:
//   // - job status from queue (if still exists)
//   // - latest analysisResult (by analysisResultId query param, or by latest)
//   const { analysisResultId } = req.query;

//   let ar = null;
//   if (analysisResultId) {
//     ar = await AnalysisResult.findOne({ _id: analysisResultId, userId: req.user.id });
//   }

//   // job may have been removed on complete; so this is best-effort
//   const job = await analysisQueue.getJob(jobId);
//   const jobState = job ? await job.getState() : "unknown";

//   res.json({
//     jobId,
//     jobState,
//     analysisResult: ar,
//   });
// }

// module.exports = { createAnalysis, getAnalysisStatus };