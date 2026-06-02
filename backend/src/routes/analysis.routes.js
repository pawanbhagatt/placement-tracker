const router = require("express").Router();
const { createAnalysis, getAnalysis } = require("../controllers/analysis.controllers");
const { requireAuth } = require("../middleware/auth.middleware");

router.post("/", requireAuth, createAnalysis);
router.get("/:analysisResultId", requireAuth, getAnalysis);

module.exports = router;

// const router = require("express").Router();
// const { requireAuth } = require("../middleware/auth.middleware");
// const ctrl = require("../controllers/analysis.controllers");

// router.use(requireAuth);

// router.post("/", ctrl.createAnalysis);
// router.get("/:jobId", ctrl.getAnalysisStatus);

// module.exports = router;