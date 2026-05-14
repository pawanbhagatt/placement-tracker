const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/jd.controllers");

router.use(requireAuth);

router.post("/", ctrl.createJD);
router.get("/", ctrl.listJDs);

module.exports = router;