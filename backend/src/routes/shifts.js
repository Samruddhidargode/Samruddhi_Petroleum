const express = require("express");
const { authRequired, authorizeRoles } = require("../middleware/auth");
const {
  createShift,
  getShifts,
  getShiftsByDate,
  getShiftDetails,
  getShiftDraft,
  addNozzleEntry,
  saveNozzleDraft,
  addCashDrop,
  addQr,
  addCard,
  addFleet,
  addPartyCredit,
  submitShift
} = require("../controllers/shiftController");

const router = express.Router();

router.post("/create", authRequired, createShift);
router.get("/draft/:id", authRequired, getShiftDraft);
router.get("/by-date/:date", authRequired, authorizeRoles("ADMIN", "MANAGER"), getShiftsByDate);
router.get("/", authRequired, authorizeRoles("ADMIN", "MANAGER"), getShifts);
router.get("/:id", authRequired, authorizeRoles("ADMIN", "MANAGER"), getShiftDetails);
router.post("/nozzle", authRequired, addNozzleEntry);
router.post("/nozzle-draft", authRequired, saveNozzleDraft);
router.post("/cash-drop", authRequired, addCashDrop);
router.post("/qr", authRequired, addQr);
router.post("/card", authRequired, addCard);
router.post("/fleet", authRequired, addFleet);
router.post("/party-credit", authRequired, addPartyCredit);
router.post("/submit", authRequired, submitShift);

module.exports = router;
