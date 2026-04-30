const { handlequery } = require("../../config/database.js");

const publicPaymentColumns = `
  id, rentId, totalPrice, paymentMethod, status, createdAt, updatedAt
`;

const publicReceiptColumns = `
  id, paymentId, amount, description, createdAt, updatedAt
`;

const mapPayment = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    rentId: row.rentId,
    totalPrice: row.totalPrice,
    paymentMethod: row.paymentMethod,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

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

const findPaymentById = async (id) => {
  const rows = await handlequery(
    `SELECT ${publicPaymentColumns} FROM payment WHERE id = ? LIMIT 1`,
    [id],
  );
  return mapPayment(rows[0]);
};

const findPaymentByRentId = async (rentId) => {
  const rows = await handlequery(
    `SELECT ${publicPaymentColumns} FROM payment WHERE rentId = ? ORDER BY createdAt DESC`,
    [rentId],
  );
  return rows.map(mapPayment);
};

const findReceiptByPaymentId = async (paymentId) => {
  const rows = await handlequery(
    `SELECT ${publicReceiptColumns} FROM receipt WHERE paymentId = ?`,
    [paymentId],
  );
  return rows.map(mapReceipt);
};

const createPayment = async ({ rentId, totalPrice, paymentMethod, status }) => {
  const result = await handlequery(
    `INSERT INTO payment (rentId, totalPrice, paymentMethod, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [rentId, totalPrice, paymentMethod, status],
  );
  return findPaymentById(result.insertId);
};

const updatePaymentStatus = async (id, status) => {
  const result = await handlequery(
    `UPDATE payment SET status = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE id = ?`,
    [status, id],
  );
  if (result.affectedRows === 0) return null;
  return findPaymentById(id);
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

module.exports = {
  createPayment,
  createReceipt,
  findPaymentById,
  findPaymentByRentId,
  findReceiptByPaymentId,
  mapPayment,
  mapReceipt,
  updatePaymentStatus,
};