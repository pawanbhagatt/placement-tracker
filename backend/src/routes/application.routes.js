const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const ctrl = require("../controllers/application.controllers");

router.use(requireAuth);

router.post("/", ctrl.createApplication);
router.get("/", ctrl.listApplications);
router.get("/:id", ctrl.getApplication);
router.patch("/:id", ctrl.updateApplication);
router.delete("/:id", ctrl.deleteApplication);

module.exports = router;