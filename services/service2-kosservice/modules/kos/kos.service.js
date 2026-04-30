const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const repository = require("./kos.repository.js");
const config = require("./kos.config.js");

const findAllKos = async () => {
  return await repository.findAllKos();
};

const findAllKosPaginated = async (limit, offset) => {
  return await repository.findAllKosPaginated(limit, offset);
};

const countKos = async () => {
  return await repository.countKos();
};

const findKosByPemilikId = async (pemilikId, limit, offset) => {
  return await repository.findKosByPemilikId(pemilikId, limit, offset);
};

const countKosByPemilikId = async (pemilikId) => {
  return await repository.countKosByPemilikId(pemilikId);
};

const findKosById = async (id) => {
  const kos = await repository.findKosById(id);
  if (!kos) {
    throw createError(`${config.label} dengan ID ${id} tidak ditemukan`, 404);
  }
  return kos;
};

const createKos = async (payload, pemilikId) => {
  const kos = await repository.createKos({
    ...payload,
    pemilikId,
  });
  return kos;
};

const updateKos = async (id, payload, pemilikId) => {
  const existing = await findKosById(id);
  if (existing.pemilikId != pemilikId) {
    throw createError("Tidak berhak mengedit kos ini", 403);
  }
  const kos = await repository.updateKos(id, payload, pemilikId);
  if (!kos) {
    throw createError("Gagal update, kos mungkin sudah dihapus", 404);
  }
  return kos;
};

const deleteKos = async (id, pemilikId, userRole) => {
  const existing = await findKosById(id);
  const isSuperadmin = userRole === "Superadmin" || userRole === "Pemilik";
  
  if (!isSuperadmin && existing.pemilikId != pemilikId) {
    throw createError("Tidak berhak menghapus kos ini", 403);
  }
  
  const success = await repository.deleteKosById(id);
  if (!success) {
    throw createError("Gagal hapus, kos mungkin sudah dihapus", 404);
  }
  return true;
};

module.exports = {
  countKos,
  countKosByPemilikId,
  createKos,
  deleteKos,
  findAllKos,
  findAllKosPaginated,
  findKosById,
  findKosByPemilikId,
  updateKos,
};
