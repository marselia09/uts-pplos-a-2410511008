const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const nameMaxLen = 191;
const validStatuses = new Set(["AVAILABLE", "OCCUPIED", "FULL", "MAINTENANCE"]);

const assertString = (val, name, maxLen) => {
  if (!val || typeof val !== "string" || val.trim().length === 0 || val.length > maxLen) {
    fail(`${name} wajib string 1-${maxLen} karakter`);
  }
  return val.trim();
};

const assertPositiveInt = (val, name) => {
  const num = parseInt(val, 10);
  if (isNaN(num) || num <= 0) {
    fail(`${name} harus angka positif`);
  }
  return num;
};

const assertStatus = (status) => {
  if (!validStatuses.has(status)) {
    fail(`Status harus salah satu: ${[...validStatuses].join(", ")}`);
  }
  return status.toUpperCase();
};

const validateCreateRoom = (body) => {
  const name = assertString(body.name, "Nama", nameMaxLen);
  const price = assertPositiveInt(body.price, "Harga");
  const capacity = assertPositiveInt(body.kapasitas, "Kapasitas");
  const status = body.status ? assertStatus(body.status) : "AVAILABLE";
  const kosId = assertPositiveInt(body.kosId, "Kos ID");

  return { name, price, capacity, status, kosId };
};

const validateUpdateRoom = (body) => {
  const data = {};
  if (body.name !== undefined) data.name = assertString(body.name, "Nama", nameMaxLen);
  if (body.price !== undefined) data.price = assertPositiveInt(body.price, "Harga");
  if (body.kapasitas !== undefined) data.kapasitas = assertPositiveInt(body.kapasitas, "Kapasitas");
  if (body.status !== undefined) data.status = assertStatus(body.status);

  if (Object.keys(data).length === 0) {
    fail("Minimal satu field untuk diupdate");
  }

  return data;
};

const validateRoomId = (id) => assertPositiveInt(id, "Room ID");
const validateKosId = (id) => assertPositiveInt(id, "Kos ID");

module.exports = {
  fail,
  validateCreateRoom,
  validateUpdateRoom,
  validateRoomId,
  validateKosId,
};