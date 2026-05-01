const express = require("express");
const kosRoutes = require("./modules/kos/kos.routes.js");
const roomRoutes = require("./modules/room/room.routes.js");
const balanceRoutes = require("./modules/balance/balance.routes.js");
const rentRoutes = require("./modules/rent/rent.routes.js");
const paymentRoutes = require("./modules/payment/payment.routes.js");
const receiptRoutes = require("./modules/receipt/receipt.routes.js");
const facilityRoutes = require("./modules/facility/facility.routes.js");

const app = express();
app.use(express.json());
app.use("/kos", kosRoutes);
app.use("/room", roomRoutes);
app.use("/balance", balanceRoutes);
app.use("/rent", rentRoutes);
app.use("/payment", paymentRoutes);
app.use("/receipt", receiptRoutes);
app.use("/facility", facilityRoutes);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
  });
});

module.exports = app;
