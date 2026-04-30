const express = require("express");
const controller = require("./balance.controller.js");
const { authMiddleware, requireSuperadmin } = require("../../middlewares/auth.js");

const router = express.Router();

router.get("/", authMiddleware, controller.listAllBalances);
router.get("/me", authMiddleware, controller.getMyBalance);
router.get("/user/:userId", authMiddleware, controller.getBalanceByUserId);
router.put("/user/:userId", authMiddleware, controller.updateBalance);

module.exports = router;