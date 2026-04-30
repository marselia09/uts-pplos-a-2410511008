const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const validPaymentMethods = new Set(["CASH", "TRANSFER", "E_WALLET", "BALANCE"]);
const validStatuses = new Set(["PENDING", "PAID", "FAILED"]);

const assertPositiveInt = (val, name) => {
  const num = parseInt(val, 10);
  if (isNaN(num) || num <= 0) {
    fail(`${name} harus angka positif`);
  }
  return num;
};

const assertPaymentMethod = (method) => {
  if (!method || !validPaymentMethods.has(method.toUpperCase())) {
    fail(`Payment method harus salah satu: ${[...validPaymentMethods].join(", ")}`);
  }
  return method.toUpperCase();
};

const validateCreatePayment = (body) => {
  const rentId = assertPositiveInt(body.rentId, "Rent ID");
  const paymentMethod = assertPaymentMethod(body.paymentMethod);

  return { rentId, paymentMethod };
};

const validatePaymentStatus = (body) => {
  const status = body.status?.toUpperCase();
  if (!status || !validStatuses.has(status)) {
    fail(`Status harus salah satu: ${[...validStatuses].join(", ")}`);
  }
  return status;
};

module.exports = {
  fail,
  validateCreatePayment,
  validatePaymentStatus,
};