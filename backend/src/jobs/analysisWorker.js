const pdfParseModule = require("pdf-parse");
const pdfParse =
  typeof pdfParseModule === "function"
    ? pdfParseModule
    : pdfParseModule?.default;

if (typeof pdfParse !== "function") {
  throw new Error(
    `pdf-parse import failed. Resolved: ${require.resolve("pdf-parse")}, typeof export: ${typeof pdfParseModule}, keys: ${Object.keys(pdfParseModule || {})}`
  );
}

require("dotenv").config();
const fs = require("fs/promises");
// const pdfParse = require("pdf-parse").default;
const { Worker } = require("bullmq");

const { createRedisConnection } = require("../config/redis");
const { connectDB } = require("../config/db");

const Resume = require("../models/Resume");
const JobDescription = require("../models/JobDescription");
const AnalysisResult = require("../models/AnalysisResult");
const { analyze } = require("../services/ats.service");

console.log("pdfParse typeof =", typeof pdfParse, "keys =", Object.keys(require("pdf-parse")));

async function getResumeText(resume) {
  // reuse cached parsed text
  if (resume.parsedText && resume.parsedText.trim().length > 0) {
    return resume.parsedText;
  }

  if (!resume.filePath) {
    throw new Error("Resume filePath missing");
  }

  const buffer = await fs.readFile(resume.filePath);
  const parsed = await pdfParse(buffer);
  const text = (parsed.text || "").trim();

  if (!text) throw new Error("Could not extract text from PDF");
  return text;
}

async function run() {
  await connectDB(process.env.MONGO_URI);
  const connection = createRedisConnection();

  const worker = new Worker(
    "analysis",
    async (job) => {
      const { analysisResultId, userId, resumeId, jdId } = job.data;

      // mark running
      await AnalysisResult.findByIdAndUpdate(analysisResultId, {
        status: "running",
        error: null,
      });

      try {
        // load owned docs
        const resume = await Resume.findOne({ _id: resumeId, userId });
        if (!resume) throw new Error("Resume not found");

        const jd = await JobDescription.findOne({ _id: jdId, userId });
        if (!jd) throw new Error("Job description not found");

        const resumeText = await getResumeText(resume);

        // cache parsed text
        if (!resume.parsedText || resume.parsedText.trim().length === 0) {
          await Resume.findByIdAndUpdate(resumeId, { parsedText: resumeText });
        }

        const result = analyze(resumeText, jd.text);

        // normalize result to avoid undefined fields
        const normalized = {
          score: Number(result.score ?? 0),
          matchedKeywords: Array.isArray(result.matchedKeywords) ? result.matchedKeywords : [],
          missingKeywords: Array.isArray(result.missingKeywords) ? result.missingKeywords : [],
          suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
        };

        await AnalysisResult.findByIdAndUpdate(analysisResultId, {
          status: "done",
          error: null,
          ...normalized,
        });

        return { ok: true, score: normalized.score };
      } catch (err) {
        await AnalysisResult.findByIdAndUpdate(analysisResultId, {
          status: "failed",
          error: err.message || "Unknown error",
        });
        throw err;
      }
    },
    {
      connection,
      concurrency: Number(process.env.ANALYSIS_WORKER_CONCURRENCY || 2),
      lockDuration: 5 * 60 * 1000,
    }
  );

  worker.on("completed", (job, result) => {
    console.log("Job completed", job.id, result);
  });

  worker.on("failed", (job, err) => {
    console.error("Job failed", job?.id, err?.message);
  });

  console.log("Analysis worker running...");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

// require("dotenv").config();
// const fs = require("fs");
// const pdfParse = require("pdf-parse");
// const { Worker } = require("bullmq");

// const { createRedisConnection } = require("../config/redis");
// const { connectDB } = require("../config/db");

// const Resume = require("../models/Resume");
// const JobDescription = require("../models/JobDescription");
// const AnalysisResult = require("../models/AnalysisResult");
// const { analyze } = require("../services/ats.service");
 
// async function run() {
//   await connectDB(process.env.MONGO_URI);

//   const connection = createRedisConnection();

//   const worker = new Worker(
//     "analysis",
//     async (job) => {
//       const { analysisResultId, userId, resumeId, jdId } = job.data;

//       await AnalysisResult.findByIdAndUpdate(analysisResultId, { status: "running", error: null });

//       const resume = await Resume.findOne({ _id: resumeId, userId });
//       if (!resume) throw new Error("Resume not found");

//       const jd = await JobDescription.findOne({ _id: jdId, userId });
//       if (!jd) throw new Error("Job description not found");

//       const buffer = fs.readFileSync(resume.filePath);
//       const parsed = await pdfParse(buffer);
//       const resumeText = parsed.text || "";

//       const result = analyze(resumeText, jd.text);

//       // store parsedText optionally to avoid re-parsing later
//       await Resume.findByIdAndUpdate(resumeId, { parsedText: resumeText });

//       await AnalysisResult.findByIdAndUpdate(analysisResultId, {
//         status: "done",
//         ...result,
//       });

//       return { ok: true, score: result.score };
//     },
//     { connection }
//   );

//   worker.on("completed", (job, result) => {
//     console.log("Job completed", job.id, result);
//   });

//   worker.on("failed", async (job, err) => {
//     console.error("Job failed", job?.id, err.message);

//     if (job?.data?.analysisResultId) {
//       await AnalysisResult.findByIdAndUpdate(job.data.analysisResultId, {
//         status: "failed",
//         error: err.message,
//       });
//     }
//   });

//   console.log("Analysis worker running...");
// }

// run().catch((e) => {
//   console.error(e);
//   process.exit(1);
// });