const validator = require("./balance.validator.js");
const balanceService = require("./balance.service.js");
const config = require("./balance.config.js");

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

const getMyBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const balance = await balanceService.findBalanceByUserId(userId);
    sendSuccess(res, 200, `${config.label} Anda berhasil diambil`, balance);
  } catch (error) {
    handleError(res, error);
  }
};

const getBalanceByUserId = async (req, res) => {
  try {
    const targetUserId = validator.validateUserId(req.params.userId || req.query.userId);
    const requesterId = req.user.id;
    const requesterRole = req.user.role;
    
    const balance = await balanceService.getUserBalance(targetUserId, requesterId, requesterRole);
    sendSuccess(res, 200, `${config.label} user berhasil diambil`, balance);
  } catch (error) {
    handleError(res, error);
  }
};

const updateBalanceHandler = async (req, res) => {
  try {
    const targetUserId = validator.validateUserId(req.params.userId);
    const payload = validator.validateUpdateBalance(req.body);
    const adminUserId = req.user.id;
    const adminRole = req.user.role;
    
    const balance = await balanceService.updateUserBalance(
      targetUserId, 
      payload.balance, 
      adminUserId, 
      adminRole
    );
    sendSuccess(res, 200, `${config.label} user berhasil diupdate`, balance);
  } catch (error) {
    handleError(res, error);
  }
};

const listAllBalances = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const result = await balanceService.findAllBalancesPaginated(limit, offset);
    const total = await balanceService.countAllBalances();

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

module.exports = {
  getMyBalance,
  getBalanceByUserId,
  listAllBalances,
  updateBalance: updateBalanceHandler,
};