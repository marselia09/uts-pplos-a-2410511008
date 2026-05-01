const express = require("express");
const controller = require("./receipt.controller.js");
const { authMiddleware, requireSuperadmin } = require("../../middlewares/auth.js");

const router = express.Router();

router.get("/", authMiddleware, controller.listReceipts);
router.get("/my", authMiddleware, controller.getMyReceipts);
router.get("/user/:userId", authMiddleware, requireSuperadmin, controller.getReceiptsByUserId);
router.get("/:id", authMiddleware, controller.getReceiptById);
router.post("/", authMiddleware, requireSuperadmin, controller.createReceipt);
router.put("/:id", authMiddleware, requireSuperadmin, controller.updateReceipt);
router.delete("/:id", authMiddleware, requireSuperadmin, controller.deleteReceipt);

module.exports = router;