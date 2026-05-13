const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/upload.middleware");
const ctrl = require("../controllers/resume.controllers");

router.use(requireAuth);

router.post("/", upload.single("file"), ctrl.uploadResume);
router.get("/", ctrl.listResumes);

module.exports = router;