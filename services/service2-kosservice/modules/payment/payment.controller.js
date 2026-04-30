const validator = require("./payment.validator.js");
const paymentService = require("./payment.service.js");
const config = require("./payment.config.js");

const sendSuccess = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server",
  });
};

const createPaymentHandler = async (req, res) => {
  try {
    const payload = validator.validateCreatePayment(req.body);
    const userId = req.user.id;
    const payment = await paymentService.createPayment(payload, userId);
    sendSuccess(res, 201, `${config.label} berhasil dibuat`, payment);
  } catch (error) {
    handleError(res, error);
  }
};

const processPaymentHandler = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const userRole = req.user.role;
    const payment = await paymentService.processPayment(paymentId, userId, userRole);
    sendSuccess(res, 200, `${config.label} berhasil diproses`, payment);
  } catch (error) {
    handleError(res, error);
  }
};

const getMyPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await paymentService.getMyPayments(userId);
    sendSuccess(res, 200, `Daftar ${config.label.toLowerCase()} saya berhasil diambil`, payments);
  } catch (error) {
    handleError(res, error);
  }
};

const getPaymentById = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id, 10);
    const payment = await paymentService.findPaymentById(paymentId);
    sendSuccess(res, 200, `${config.label} berhasil diambil`, payment);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createPayment: createPaymentHandler,
  getMyPayments,
  getPaymentById,
  processPayment: processPaymentHandler,
};