const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const repository = require("./room.repository.js");
const kosRepository = require("../kos/kos.repository.js");
const config = require("./room.config.js");

const findAllRooms = async () => {
  return await repository.findAllRooms();
};

const findAllRoomsPaginated = async (limit, offset) => {
  return await repository.findAllRoomsPaginated(limit, offset);
};

const countRooms = async () => {
  return await repository.countRooms();
};

const findRoomsByKosId = async (kosId) => {
  return await repository.findRoomsByKosId(kosId);
};

const findRoomsByKosIdPaginated = async (kosId, limit, offset) => {
  return await repository.findRoomsByKosIdPaginated(kosId, limit, offset);
};

const countRoomsByKosId = async (kosId) => {
  return await repository.countRoomsByKosId(kosId);
};

const findRoomById = async (id) => {
  const room = await repository.findRoomById(id);
  if (!room) {
    throw createError(`${config.label} dengan ID ${id} tidak ditemukan`, 404);
  }
  return room;
};

const verifyKosOwnership = async (kosId, pemilikId) => {
  const kos = await kosRepository.findKosById(kosId);
  if (!kos) {
    throw createError(`Kos dengan ID ${kosId} tidak ditemukan`, 404);
  }
  if (kos.pemilikId != pemilikId) {
    throw createError("Tidak berhak mengelola room di kos ini", 403);
  }
  return kos;
};

const verifyRoomOwnership = async (roomId, pemilikId) => {
  const room = await findRoomById(roomId);
  await verifyKosOwnership(room.kosId, pemilikId);
  return room;
};

const createRoom = async (payload, pemilikId) => {
  await verifyKosOwnership(payload.kosId, pemilikId);
  return await repository.createRoom(payload);
};

const updateRoom = async (id, payload, pemilikId) => {
  await verifyRoomOwnership(id, pemilikId);
  const room = await repository.updateRoom(id, payload);
  if (!room) {
    throw createError("Gagal update, room mungkin sudah dihapus", 404);
  }
  return room;
};

const deleteRoom = async (id, pemilikId) => {
  await verifyRoomOwnership(id, pemilikId);
  const success = await repository.deleteRoom(id);
  if (!success) {
    throw createError("Gagal hapus, room mungkin sudah dihapus", 404);
  }
  return true;
};

module.exports = {
  countRooms,
  countRoomsByKosId,
  createRoom,
  deleteRoom,
  findAllRooms,
  findAllRoomsPaginated,
  findRoomById,
  findRoomsByKosId,
  findRoomsByKosIdPaginated,
  updateRoom,
};