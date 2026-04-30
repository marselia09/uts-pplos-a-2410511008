const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const assertPositiveInt = (val, name) => {
  const num = parseInt(val, 10);
  if (isNaN(num) || num < 0) {
    fail(`${name} harus angka non-negatif`);
  }
  return num;
};

const validateUpdateBalance = (body) => {
  const data = {};
  if (body.balance !== undefined) {
    data.balance = assertPositiveInt(body.balance, "Balance");
  }

  if (Object.keys(data).length === 0) {
    fail("Minimal satu field untuk diupdate");
  }

  return data;
};

const validateUserId = (id) => {
  const num = parseInt(id, 10);
  if (isNaN(num) || num <= 0) {
    fail("User ID harus angka positif");
  }
  return num;
};

module.exports = {
  fail,
  validateUpdateBalance,
  validateUserId,
};