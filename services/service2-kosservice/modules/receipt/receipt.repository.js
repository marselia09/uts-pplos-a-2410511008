const { handlequery } = require("../../config/database.js");

const publicReceiptColumns = `
  id, paymentId, amount, description, createdAt, updatedAt
`;

const mapReceipt = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    paymentId: row.paymentId,
    amount: row.amount,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const findReceiptById = async (id) => {
  const rows = await handlequery(
    `SELECT ${publicReceiptColumns} FROM receipt WHERE id = ? LIMIT 1`,
    [id],
  );
  return mapReceipt(rows[0]);
};

const findReceiptByPaymentId = async (paymentId) => {
  const rows = await handlequery(
    `SELECT ${publicReceiptColumns} FROM receipt WHERE paymentId = ?`,
    [paymentId],
  );
  return rows.map(mapReceipt);
};

const findAllReceiptsPaginated = async (limit, offset) => {
  const rows = await handlequery(
    `SELECT ${publicReceiptColumns} FROM receipt ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows.map(mapReceipt);
};

const countAllReceipts = async () => {
  const rows = await handlequery(`SELECT COUNT(*) as total FROM receipt`);
  return rows[0].total;
};

const createReceipt = async ({ paymentId, amount, description }) => {
  const result = await handlequery(
    `INSERT INTO receipt (paymentId, amount, description, createdAt, updatedAt)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [paymentId, amount, description],
  );
  const rows = await handlequery(
    `SELECT ${publicReceiptColumns} FROM receipt WHERE id = ?`,
    [result.insertId],
  );
  return mapReceipt(rows[0]);
};

const updateReceipt = async (id, { amount, description }) => {
  const result = await handlequery(
    `UPDATE receipt SET amount = ?, description = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?`,
    [amount, description, id],
  );
  if (result.affectedRows === 0) return null;
  return findReceiptById(id);
};

const deleteReceipt = async (id) => {
  const result = await handlequery(`DELETE FROM receipt WHERE id = ?`, [id]);
  return result.affectedRows > 0;
};

const findReceiptsByUserId = async (userId, limit, offset) => {
  const rows = await handlequery(
    `SELECT r.id, r.paymentId, r.amount, r.description, r.createdAt, r.updatedAt
     FROM receipt r
     JOIN payment p ON r.paymentId = p.id
     JOIN rent rt ON p.rentId = rt.id
     WHERE rt.userId = ?
     ORDER BY r.createdAt DESC
     LIMIT ? OFFSET ?`,
    [userId, limit, offset],
  );
  return rows.map(mapReceipt);
};

const countReceiptsByUserId = async (userId) => {
  const rows = await handlequery(
    `SELECT COUNT(*) as total
     FROM receipt r
     JOIN payment p ON r.paymentId = p.id
     JOIN rent rt ON p.rentId = rt.id
     WHERE rt.userId = ?`,
    [userId],
  );
  return rows[0].total;
};

module.exports = {
  countAllReceipts,
  countReceiptsByUserId,
  createReceipt,
  deleteReceipt,
  findAllReceiptsPaginated,
  findReceiptById,
  findReceiptByPaymentId,
  findReceiptsByUserId,
  mapReceipt,
  updateReceipt,
};