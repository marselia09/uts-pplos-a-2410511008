const validator = require("./rent.validator.js");
const rentService = require("./rent.service.js");
const config = require("./rent.config.js");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const sendSuccess = (res, statusCode, message, data, meta = null) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
};

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server",
  });
};

const createRentHandler = async (req, res) => {
  try {
    const payload = validator.validateCreateRent(req.body);
    const userId = req.user.id;
    const rent = await rentService.createRent(payload, userId);
    sendSuccess(res, 201, `${config.label} berhasil dibuat`, rent);
  } catch (error) {
    handleError(res, error);
  }
};

const getMyRents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    const result = await rentService.getMyRents(userId, limit, offset);
    const total = await rentService.countRentsByUserId(userId);

    const meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    sendSuccess(
      res,
      200,
      `Daftar ${config.label.toLowerCase()} saya berhasil diambil`,
      result,
      meta,
    );
  } catch (error) {
    handleError(res, error);
  }
};

const getRentById = async (req, res) => {
  try {
    const id = validator.validateRentId(req.params.id);
    const rent = await rentService.findRentById(id);
    sendSuccess(res, 200, `${config.label} berhasil diambil`, rent);
  } catch (error) {
    handleError(res, error);
  }
};

const cancelRentHandler = async (req, res) => {
  try {
    const id = validator.validateRentId(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const rent = await rentService.cancelRent(id, userId, userRole);
    sendSuccess(res, 200, `${config.label} berhasil dibatalkan`, rent);
  } catch (error) {
    handleError(res, error);
  }
};

const completeRentHandler = async (req, res) => {
  try {
    const id = validator.validateRentId(req.params.id);
    const userRole = req.user.role;
    const rent = await rentService.completeRent(id, userRole);
    sendSuccess(res, 200, `${config.label} berhasil diselesaikan`, rent);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  cancelRent: cancelRentHandler,
  completeRent: completeRentHandler,
  createRent: createRentHandler,
  getMyRents,
  getRentById,
};