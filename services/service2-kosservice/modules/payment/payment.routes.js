const express = require("express");
const controller = require("./payment.controller.js");
const { authMiddleware } = require("../../middlewares/auth.js");

const router = express.Router();

router.get("/my", authMiddleware, controller.getMyPayments);
router.get("/:id", authMiddleware, controller.getPaymentById);
router.post("/", authMiddleware, controller.createPayment);
router.put("/:id/pay", authMiddleware, controller.processPayment);

module.exports = router;