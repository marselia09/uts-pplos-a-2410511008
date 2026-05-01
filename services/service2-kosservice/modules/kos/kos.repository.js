const { handlequery } = require("../../config/database.js");

const publicKosColumns = `
  id,
  name,
  address,
  gender,
  pemilikId,
  createdAt,
  updatedAt
`;

const mapKos = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    gender: row.gender,
    pemilikId: row.pemilikId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const findAllKos = async () => {
  const rows = await handlequery(
    `SELECT ${publicKosColumns} FROM kos ORDER BY createdAt DESC`,
  );
  return rows.map(mapKos);
};

const findAllKosPaginated = async (limit, offset) => {
  const rows = await handlequery(
    `SELECT ${publicKosColumns} FROM kos ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows.map(mapKos);
};

const countKos = async () => {
  const result = await handlequery(`SELECT COUNT(*) as total FROM kos`);
  return result[0].total;
};

const findKosByPemilikId = async (pemilikId, limit, offset) => {
  const rows = await handlequery(
    `SELECT ${publicKosColumns} FROM kos WHERE pemilikId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [pemilikId, limit, offset],
  );
  return rows.map(mapKos);
};

const countKosByPemilikId = async (pemilikId) => {
  const result = await handlequery(
    `SELECT COUNT(*) as total FROM kos WHERE pemilikId = ?`,
    [pemilikId],
  );
  return result[0].total;
};

const findKosById = async (id) => {
  const rows = await handlequery(
    `SELECT ${publicKosColumns} FROM kos WHERE id = ? LIMIT 1`,
    [id],
  );
  return mapKos(rows[0]);
};

const createKos = async ({ name, address, gender, pemilikId }) => {
  const result = await handlequery(
    `INSERT INTO kos (name, address, gender, pemilikId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [name, address, gender, pemilikId],
  );
  return findKosById(result.insertId);
};

const updateKos = async (id, updates, pemilikId) => {
  const setClause = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = [...Object.values(updates), id, pemilikId];
  const result = await handlequery(
    `UPDATE kos SET ${setClause}, updatedAt = CURRENT_TIMESTAMP(3)
     WHERE id = ? AND pemilikId = ?`,
    values,
  );
  if (result.affectedRows === 0) return null;
  return findKosById(id);
};

const deleteKos = async (id, pemilikId) => {
  const result = await handlequery(
    `DELETE FROM kos WHERE id = ? AND pemilikId = ?`,
    [id, pemilikId],
  );
  return result.affectedRows > 0;
};

const deleteKosById = async (id) => {
  const result = await handlequery(
    `DELETE FROM kos WHERE id = ?`,
    [id],
  );
  return result.affectedRows > 0;
};

const getKosFacilities = async (kosId) => {
  const rows = await handlequery(
    `SELECT f.* FROM facility f
     INNER JOIN kos_facility kf ON f.id = kf.facilityId
     WHERE kf.kosId = ?
     ORDER BY f.name`,
    [kosId],
  );
  return rows;
};

module.exports = {
  countKos,
  countKosByPemilikId,
  createKos,
  deleteKos,
  deleteKosById,
  findAllKos,
  findAllKosPaginated,
  findKosById,
  findKosByPemilikId,
  getKosFacilities,
  mapKos,
  updateKos,
};
