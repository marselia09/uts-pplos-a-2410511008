const { handlequery } = require("../../config/database.js");

const publicRentColumns = `
  id, roomId, userId, startDate, endDate, status, createdAt, updatedAt
`;

const mapRent = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    roomId: row.roomId,
    userId: row.userId,
    startDate: row.startDate,
    endDate: row.endDate,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const findRentById = async (id) => {
  const rows = await handlequery(
    `SELECT ${publicRentColumns} FROM rent WHERE id = ? LIMIT 1`,
    [id],
  );
  return mapRent(rows[0]);
};

const findRentsByUserId = async (userId) => {
  const rows = await handlequery(
    `SELECT ${publicRentColumns} FROM rent WHERE userId = ? ORDER BY createdAt DESC`,
    [userId],
  );
  return rows.map(mapRent);
};

const findRentsByUserIdPaginated = async (userId, limit, offset) => {
  const rows = await handlequery(
    `SELECT ${publicRentColumns} FROM rent WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );
  return rows.map(mapRent);
};

const countRentsByUserId = async (userId) => {
  const result = await handlequery(
    `SELECT COUNT(*) as total FROM rent WHERE userId = ?`,
    [userId],
  );
  return result[0].total;
};

const findRentsByRoomId = async (roomId) => {
  const rows = await handlequery(
    `SELECT ${publicRentColumns} FROM rent WHERE roomId = ? ORDER BY createdAt DESC`,
    [roomId],
  );
  return rows.map(mapRent);
};

const findActiveRentByRoomId = async (roomId) => {
  const rows = await handlequery(
    `SELECT ${publicRentColumns} FROM rent WHERE roomId = ? AND status = 'ACTIVE' LIMIT 1`,
    [roomId],
  );
  return mapRent(rows[0]);
};

const createRent = async ({ roomId, userId, startDate, endDate }) => {
  const result = await handlequery(
    `INSERT INTO rent (roomId, userId, startDate, endDate, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, 'ACTIVE', CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [roomId, userId, startDate, endDate],
  );
  return findRentById(result.insertId);
};

const updateRentStatus = async (id, status) => {
  const result = await handlequery(
    `UPDATE rent SET status = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?`,
    [status, id],
  );
  if (result.affectedRows === 0) return null;
  return findRentById(id);
};

const deleteRent = async (id) => {
  const result = await handlequery(
    `DELETE FROM rent WHERE id = ?`,
    [id],
  );
  return result.affectedRows > 0;
};

module.exports = {
  countRentsByUserId,
  createRent,
  deleteRent,
  findActiveRentByRoomId,
  findRentById,
  findRentsByRoomId,
  findRentsByUserId,
  findRentsByUserIdPaginated,
  mapRent,
  updateRentStatus,
};