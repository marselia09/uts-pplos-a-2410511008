const express = require("express");
const controller = require("./room.controller.js");
const { authMiddleware, requireSuperadmin } = require("../../middlewares/auth.js");

const router = express.Router();

router.get("/", controller.listRooms);
router.get("/:id", controller.getRoom);
router.post("/", authMiddleware, controller.createRoom);
router.put("/:id", authMiddleware, controller.updateRoom);
router.delete("/:id", authMiddleware, controller.deleteRoom);

module.exports = router;