const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const assertPositiveInt = (val, name) => {
  const num = parseInt(val, 10);
  if (isNaN(num) || num <= 0) {
    fail(`${name} harus angka positif`);
  }
  return num;
};

const assertDate = (val, name) => {
  if (!val) {
    fail(`${name} wajib diisi`);
  }
  const date = new Date(val);
  if (isNaN(date.getTime())) {
    fail(`${name} harus format tanggal yang valid`);
  }
  return val;
};

const assertStatus = (status, allowedStatuses) => {
  if (status && !allowedStatuses.includes(status)) {
    fail(`Status harus salah satu: ${allowedStatuses.join(", ")}`);
  }
  return status;
};

const validateCreateRent = (body) => {
  const roomId = assertPositiveInt(body.roomId, "Room ID");
  const startDate = assertDate(body.startDate, "Start Date");
  const endDate = assertDate(body.endDate, "End Date");

  if (new Date(startDate) >= new Date(endDate)) {
    fail("End date harus lebih besar dari start date");
  }

  return { roomId, startDate, endDate };
};

const validateUpdateRentStatus = (body) => {
  const validStatuses = ["ACTIVE", "COMPLETED", "CANCELLED"];
  const status = body.status ? assertStatus(body.status.toUpperCase(), validStatuses) : null;

  if (!status) {
    fail("Status wajib diisi");
  }

  return { status };
};

const validateRentId = (id) => assertPositiveInt(id, "Rent ID");
const validateRoomId = (id) => assertPositiveInt(id, "Room ID");

module.exports = {
  fail,
  validateCreateRent,
  validateRentId,
  validateRoomId,
  validateUpdateRentStatus,
};