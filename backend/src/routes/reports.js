const express = require("express");
const { authRequired, authorizeRoles } = require("../middleware/auth");
const { listReceipts, exportShiftCsv, exportMduCsv } = require("../controllers/reportsController");

const router = express.Router();

router.get("/receipts", authRequired, authorizeRoles("ADMIN", "MANAGER"), listReceipts);
router.get("/export/shifts", authRequired, authorizeRoles("ADMIN", "MANAGER"), exportShiftCsv);
router.get("/export/mdu", authRequired, authorizeRoles("ADMIN", "MANAGER"), exportMduCsv);

module.exports = router;
