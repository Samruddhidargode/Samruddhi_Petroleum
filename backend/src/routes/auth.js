const express = require("express");
const { login, changePassword } = require("../controllers/authController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/change-password", authRequired, changePassword);

module.exports = router;
