const express = require("express");
const controller = require("./facility.controller.js");
const {
  authMiddleware,
  requirePemilik,
  requireSuperadmin,
} = require("../../middlewares/auth.js");

const router = express.Router();

router.get("/", controller.listFacilities);
router.get("/:id", controller.getFacility);
router.post("/", authMiddleware, requireSuperadmin, controller.createFacility);
router.put("/:id", authMiddleware, requireSuperadmin, controller.updateFacility);
router.delete("/:id", authMiddleware, requireSuperadmin, controller.deleteFacility);

router.get("/kos/:kosId", controller.getFacilitiesByKos);
router.post("/kos", authMiddleware, requirePemilik, controller.addFacilityToKos);
router.delete("/kos/:kosId/:facilityId", authMiddleware, requirePemilik, controller.removeFacilityFromKos);

module.exports = router;