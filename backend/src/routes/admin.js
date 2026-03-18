const express = require("express");
const { authRequired, authorizeRoles } = require("../middleware/auth");
const { createUser, listUsers, resetUserPassword, deactivateUser, activateUser, deleteUser } = require("../controllers/adminController");

const router = express.Router();

router.post("/users", authRequired, authorizeRoles("ADMIN"), createUser);
router.get("/users", authRequired, authorizeRoles("ADMIN"), listUsers);
router.post("/users/:id/reset-password", authRequired, authorizeRoles("ADMIN"), resetUserPassword);
router.patch("/users/:id/deactivate", authRequired, authorizeRoles("ADMIN"), deactivateUser);
router.patch("/users/:id/activate", authRequired, authorizeRoles("ADMIN"), activateUser);
router.delete("/users/:id", authRequired, authorizeRoles("ADMIN"), deleteUser);

module.exports = router;
