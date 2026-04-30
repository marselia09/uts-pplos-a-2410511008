const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const repository = require("./rent.repository.js");
const roomRepository = require("../room/room.repository.js");
const config = require("./rent.config.js");

const findRentById = async (id) => {
  const rent = await repository.findRentById(id);
  if (!rent) {
    throw createError(`${config.label} dengan ID ${id} tidak ditemukan`, 404);
  }
  return rent;
};

const findRentsByUserId = async (userId, limit, offset) => {
  return await repository.findRentsByUserIdPaginated(userId, limit, offset);
};

const countRentsByUserId = async (userId) => {
  return await repository.countRentsByUserId(userId);
};

const findRentsByRoomId = async (roomId) => {
  return await repository.findRentsByRoomId(roomId);
};

const createRent = async (payload, userId) => {
  const room = await roomRepository.findRoomById(payload.roomId);
  if (!room) {
    throw createError("Room tidak ditemukan", 404);
  }

  if (room.status !== "AVAILABLE") {
    throw createError("Room tidak tersedia untuk disewa", 400);
  }

  const activeRent = await repository.findActiveRentByRoomId(payload.roomId);
  if (activeRent) {
    throw createError("Room sedang aktif disewa oleh user lain", 400);
  }

  return await repository.createRent({
    ...payload,
    userId,
  });
};

const cancelRent = async (rentId, userId, userRole) => {
  const rent = await findRentById(rentId);
  
  const isSuperadmin = userRole === "Superadmin";
  const isOwner = rent.userId === userId;
  
  if (!isSuperadmin && !isOwner) {
    throw createError("Tidak berhak membatalkan rent ini", 403);
  }

  if (rent.status !== "ACTIVE") {
    throw createError("Hanya rent dengan status ACTIVE yang dapat dibatalkan", 400);
  }

  return await repository.updateRentStatus(rentId, "CANCELLED");
};

const completeRent = async (rentId, userRole) => {
  if (userRole !== "Superadmin") {
    throw createError("Hanya superadmin yang dapat menyelesaikan rent", 403);
  }

  const rent = await findRentById(rentId);
  
  if (rent.status !== "ACTIVE") {
    throw createError("Hanya rent dengan status ACTIVE yang dapat diselesaikan", 400);
  }

  return await repository.updateRentStatus(rentId, "COMPLETED");
};

const getMyRents = async (userId, limit, offset) => {
  return await repository.findRentsByUserIdPaginated(userId, limit, offset);
};

module.exports = {
  cancelRent,
  completeRent,
  countRentsByUserId,
  createRent,
  findRentById,
  findRentsByRoomId,
  findRentsByUserId,
  getMyRents,
};