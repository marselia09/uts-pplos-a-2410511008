const { handlequery } = require("../../config/database.js");

const publicRoomColumns = `
  id, name, price, capacity, status, kosId, createdAt, updatedAt
`;

const mapRoom = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    capacity: row.capacity,
    status: row.status,
    kosId: row.kosId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const findAllRooms = async () => {
  const rows = await handlequery(
    `SELECT ${publicRoomColumns} FROM room ORDER BY createdAt DESC`,
  );
  return rows.map(mapRoom);
};

const findRoomsByKosId = async (kosId) => {
  const rows = await handlequery(
    `SELECT ${publicRoomColumns} FROM room WHERE kosId = ? ORDER BY createdAt DESC`,
    [kosId],
  );
  return rows.map(mapRoom);
};

const findRoomsByKosIdPaginated = async (kosId, limit, offset) => {
  const rows = await handlequery(
    `SELECT ${publicRoomColumns} FROM room WHERE kosId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [kosId, limit, offset],
  );
  return rows.map(mapRoom);
};

const countRoomsByKosId = async (kosId) => {
  const result = await handlequery(
    `SELECT COUNT(*) as total FROM room WHERE kosId = ?`,
    [kosId],
  );
  return result[0].total;
};

const findRoomById = async (id) => {
  const rows = await handlequery(
    `SELECT ${publicRoomColumns} FROM room WHERE id = ? LIMIT 1`,
    [id],
  );
  return mapRoom(rows[0]);
};

const createRoom = async ({ name, price, capacity, status, kosId }) => {
  const result = await handlequery(
    `INSERT INTO room (name, price, capacity, status, kosId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [name, price, capacity, status, kosId],
  );
  return findRoomById(result.insertId);
};

const updateRoom = async (id, updates) => {
  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id];
  const result = await handlequery(
    `UPDATE room SET ${setClause}, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?`,
    values,
  );
  if (result.affectedRows === 0) return null;
  return findRoomById(id);
};

const deleteRoom = async (id) => {
  const result = await handlequery(`DELETE FROM room WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

module.exports = {
  countRoomsByKosId,
  createRoom,
  deleteRoom,
  findAllRooms,
  findRoomById,
  findRoomsByKosId,
  findRoomsByKosIdPaginated,
  mapRoom,
  updateRoom,
};