const express = require("express");
const { login, logout, changePassword } = require("../controllers/authController");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);
router.post("/logout", authRequired, logout);
router.post("/change-password", authRequired, changePassword);

module.exports = router;
