const router = require("express").Router();
const { requireAuth } = require("../middleware/auth.middleware");
const { register, login, me } = require("../controllers/auth.controllers");

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);

module.exports = router;