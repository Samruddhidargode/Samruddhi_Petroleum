const express = require("express");
const { authRequired, authorizeRoles } = require("../middleware/auth");
const { uploadNozzlePhoto, listNozzlePhotos, deleteNozzlePhoto } = require("../controllers/uploadController");

const router = express.Router();

router.post("/nozzle-photo", authRequired, uploadNozzlePhoto);
router.get("/nozzle-photos", authRequired, listNozzlePhotos);
router.delete("/nozzle-photo", authRequired, deleteNozzlePhoto);

module.exports = router;
