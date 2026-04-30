const express = require("express");
const controller = require("./kos.controller.js");
const {
  authMiddleware,
  requireSuperadmin,
} = require("../../middlewares/auth.js");

const router = express.Router();

router.get("/", controller.listKos);
router.get("/my", authMiddleware, controller.getMyKos);
router.get("/:id", controller.getKos);
router.post("/", authMiddleware, controller.createKos);
router.put("/:id", authMiddleware, controller.updateKos);
router.delete("/:id", authMiddleware, requireSuperadmin, controller.deleteKos);

module.exports = router;
