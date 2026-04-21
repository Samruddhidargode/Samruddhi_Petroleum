const express = require("express");
const { authRequired, authorizeRoles } = require("../middleware/auth");
const { getDashboard } = require("../controllers/analyticsController");

const router = express.Router();

router.get("/dashboard", authRequired, authorizeRoles("ADMIN", "MANAGER"), getDashboard);

module.exports = router;
