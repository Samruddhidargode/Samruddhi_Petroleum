const express = require("express");
const { authRequired } = require("../middleware/auth");
const { startTrip, addClient, closeTrip, getTrips, getEodPreview, eodSummary } = require("../controllers/mduController");

const router = express.Router();

router.get("/trips", authRequired, getTrips);
router.get("/summary/:date", authRequired, getEodPreview);
router.post("/start", authRequired, startTrip);
router.post("/client", authRequired, addClient);
router.post("/close", authRequired, closeTrip);
router.post("/eod", authRequired, eodSummary);

module.exports = router;
