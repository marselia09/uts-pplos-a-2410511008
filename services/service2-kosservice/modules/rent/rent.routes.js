const express = require("express");
const controller = require("./rent.controller.js");
const { authMiddleware, requireSuperadmin } = require("../../middlewares/auth.js");

const router = express.Router();

router.get("/my", authMiddleware, controller.getMyRents);
router.get("/:id", authMiddleware, controller.getRentById);
router.post("/", authMiddleware, controller.createRent);
router.put("/:id/cancel", authMiddleware, controller.cancelRent);
router.put("/:id/complete", authMiddleware, requireSuperadmin, controller.completeRent);

module.exports = router;