const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateReceiptId = (value) => {
  const id = parseInt(value, 10);
  if (isNaN(id) || id <= 0) {
    throw createError("ID receipt tidak valid", 400);
  }
  return id;
};

const validateCreateReceipt = (data) => {
  if (!data.paymentId) {
    throw createError("paymentId wajib diisi", 400);
  }
  if (!data.amount && data.amount !== 0) {
    throw createError("amount wajib diisi", 400);
  }
  if (typeof data.amount !== "number" || data.amount < 0) {
    throw createError("amount harus berupa angka positif", 400);
  }

  return {
    paymentId: parseInt(data.paymentId, 10),
    amount: BigInt(data.amount),
    description: data.description || null,
  };
};

const validateUpdateReceipt = (data) => {
  const payload = {};

  if (data.amount !== undefined) {
    if (typeof data.amount !== "number" || data.amount < 0) {
      throw createError("amount harus berupa angka positif", 400);
    }
    payload.amount = BigInt(data.amount);
  }

  if (data.description !== undefined) {
    payload.description = data.description;
  }

  if (Object.keys(payload).length === 0) {
    throw createError("Minimal satu field harus diisi untuk update", 400);
  }

  return payload;
};

module.exports = {
  validateCreateReceipt,
  validateReceiptId,
  validateUpdateReceipt,
};