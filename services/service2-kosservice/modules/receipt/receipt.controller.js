const validator = require("./receipt.validator.js");
const receiptService = require("./receipt.service.js");
const config = require("./receipt.config.js");

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

const listReceipts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const userId = req.user.id;
    const userRole = req.user.role;

    let result, total;
    if (userRole === "Superadmin") {
      result = await receiptService.getReceiptsWithPagination(limit, offset);
      total = await receiptService.countReceipts();
    } else {
      const data = await receiptService.getReceiptsByUserId(userId, limit, offset);
      result = data.receipts;
      total = data.total;
    }

    const meta = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    sendSuccess(
      res,
      200,
      `Daftar ${config.label.toLowerCase()} berhasil diambil`,
      result,
      meta,
    );
  } catch (error) {
    handleError(res, error);
  }
};

const getMyReceipts = async (req, res) => {
  try {
    const userId = req.user.id;
    const receipts = await receiptService.getMyReceipts(userId);
    sendSuccess(res, 200, `${config.label} saya berhasil diambil`, receipts);
  } catch (error) {
    handleError(res, error);
  }
};

const getReceiptsByUserId = async (req, res) => {
  try {
    const targetUserId = validator.validateReceiptId(req.params.userId);
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const data = await receiptService.getReceiptsByUserId(targetUserId, limit, offset);

    const meta = {
      page,
      limit,
      total: data.total,
      totalPages: Math.ceil(data.total / limit),
    };

    sendSuccess(
      res,
      200,
      `${config.label} user berhasil diambil`,
      data.receipts,
      meta,
    );
  } catch (error) {
    handleError(res, error);
  }
};

const getReceiptById = async (req, res) => {
  try {
    const receiptId = validator.validateReceiptId(req.params.id);
    const receipt = await receiptService.findReceiptById(receiptId);
    sendSuccess(res, 200, `${config.label} berhasil diambil`, receipt);
  } catch (error) {
    handleError(res, error);
  }
};

const createReceiptHandler = async (req, res) => {
  try {
    const payload = validator.validateCreateReceipt(req.body);
    const userId = req.user.id;
    const userRole = req.user.role;
    const receipt = await receiptService.createReceipt(payload, userId, userRole);
    sendSuccess(res, 201, `${config.label} berhasil dibuat`, receipt);
  } catch (error) {
    handleError(res, error);
  }
};

const updateReceiptHandler = async (req, res) => {
  try {
    const receiptId = validator.validateReceiptId(req.params.id);
    const payload = validator.validateUpdateReceipt(req.body);
    const userId = req.user.id;
    const userRole = req.user.role;
    const receipt = await receiptService.updateReceipt(receiptId, payload, userId, userRole);
    sendSuccess(res, 200, `${config.label} berhasil diupdate`, receipt);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteReceiptHandler = async (req, res) => {
  try {
    const receiptId = validator.validateReceiptId(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await receiptService.deleteReceipt(receiptId, userId, userRole);
    sendSuccess(res, 200, result.message, null);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createReceipt: createReceiptHandler,
  deleteReceipt: deleteReceiptHandler,
  getReceiptById,
  getMyReceipts,
  getReceiptsByUserId,
  listReceipts,
  updateReceipt: updateReceiptHandler,
};