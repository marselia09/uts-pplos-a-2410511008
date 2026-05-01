const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const repository = require("./receipt.repository.js");
const paymentRepository = require("../payment/payment.repository.js");
const { isSuperadmin, isPemilik } = require("../../middlewares/auth.js");
const config = require("./receipt.config.js");

const findReceiptById = async (id) => {
  const receipt = await repository.findReceiptById(id);
  if (!receipt) {
    throw createError(`${config.label} dengan ID ${id} tidak ditemukan`, 404);
  }
  return receipt;
};

const getReceiptsWithPagination = async (limit, offset) => {
  return await repository.findAllReceiptsPaginated(limit, offset);
};

const countReceipts = async () => {
  return await repository.countAllReceipts();
};

const createReceipt = async (payload, userId, userRole) => {
  if (!isSuperadmin(userRole)) {
    throw createError("Hanya superadmin yang dapat membuat receipt", 403);
  }

  const payment = await paymentRepository.findPaymentById(payload.paymentId);
  if (!payment) {
    throw createError("Payment dengan ID tersebut tidak ditemukan", 404);
  }

  return await repository.createReceipt({
    paymentId: payload.paymentId,
    amount: payload.amount,
    description: payload.description,
  });
};

const updateReceipt = async (id, payload, userId, userRole) => {
  if (!isSuperadmin(userRole)) {
    throw createError("Hanya superadmin yang dapat mengupdate receipt", 403);
  }

  const existingReceipt = await repository.findReceiptById(id);
  if (!existingReceipt) {
    throw createError(`${config.label} dengan ID ${id} tidak ditemukan`, 404);
  }

  return await repository.updateReceipt(id, {
    amount: payload.amount,
    description: payload.description,
  });
};

const deleteReceipt = async (id, userId, userRole) => {
  if (!isSuperadmin(userRole)) {
    throw createError("Hanya superadmin yang dapat menghapus receipt", 403);
  }

  const existingReceipt = await repository.findReceiptById(id);
  if (!existingReceipt) {
    throw createError(`${config.label} dengan ID ${id} tidak ditemukan`, 404);
  }

  const deleted = await repository.deleteReceipt(id);
  if (!deleted) {
    throw createError(`Gagal menghapus ${config.label.toLowerCase()}`, 500);
  }

  return { message: `${config.label} berhasil dihapus` };
};

const getReceiptsByPaymentId = async (paymentId) => {
  return await repository.findReceiptByPaymentId(paymentId);
};

const getMyReceipts = async (userId) => {
  return await repository.findReceiptsByUserId(userId, 1000, 0);
};

const getReceiptsByUserId = async (targetUserId, limit, offset) => {
  const receipts = await repository.findReceiptsByUserId(targetUserId, limit, offset);
  const total = await repository.countReceiptsByUserId(targetUserId);
  return { receipts, total };
};

const getReceiptsWithPaginationAdmin = async (limit, offset, userId, userRole) => {
  if (isSuperadmin(userRole)) {
    return await repository.findAllReceiptsPaginated(limit, offset);
  } else if (isPemilik(userRole)) {
    return await repository.findReceiptsByUserId(userId, limit, offset);
  }
  throw createError("Tidak berhak mengakses resource ini", 403);
};

const countReceiptsAdmin = async (userRole) => {
  if (isSuperadmin(userRole)) {
    return await repository.countAllReceipts();
  }
  return 0;
};

module.exports = {
  countReceipts,
  countReceiptsAdmin,
  createReceipt,
  deleteReceipt,
  findReceiptById,
  getMyReceipts,
  getReceiptsByPaymentId,
  getReceiptsByUserId,
  getReceiptsWithPagination,
  getReceiptsWithPaginationAdmin,
  updateReceipt,
};