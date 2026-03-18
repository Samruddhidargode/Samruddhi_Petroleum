const express = require("express");
const { authRequired } = require("../middleware/auth");
const { startTrip, addClient, closeTrip, eodSummary } = require("../controllers/mduController");

const router = express.Router();

router.post("/start", authRequired, startTrip);
router.post("/client", authRequired, addClient);
router.post("/close", authRequired, closeTrip);
router.post("/eod", authRequired, eodSummary);

module.exports = router;
