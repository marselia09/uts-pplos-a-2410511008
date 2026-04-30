const { handlequery } = require("../../config/database.js");

const publicBalanceColumns = `
  id, userId, balance, createdAt, updatedAt
`;

const mapBalance = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.userId,
    balance: row.balance,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const findBalanceByUserId = async (userId) => {
  const rows = await handlequery(
    `SELECT ${publicBalanceColumns} FROM balance WHERE userId = ? LIMIT 1`,
    [userId],
  );
  return mapBalance(rows[0]);
};

const findBalanceById = async (id) => {
  const rows = await handlequery(
    `SELECT ${publicBalanceColumns} FROM balance WHERE id = ? LIMIT 1`,
    [id],
  );
  return mapBalance(rows[0]);
};

const findAllBalances = async (limit, offset) => {
  const rows = await handlequery(
    `SELECT ${publicBalanceColumns} FROM balance ORDER BY id DESC LIMIT ? OFFSET ?`,
    [limit, offset],
  );
  return rows.map(mapBalance);
};

const countAllBalances = async () => {
  const result = await handlequery(`SELECT COUNT(*) as total FROM balance`);
  return result[0].total;
};

const createBalance = async (userId, initialBalance = 0) => {
  const result = await handlequery(
    `INSERT INTO balance (userId, balance, createdAt, updatedAt)
     VALUES (?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [userId, initialBalance],
  );
  return findBalanceByUserId(userId);
};

const updateBalance = async (userId, balance) => {
  const existing = await findBalanceByUserId(userId);
  if (!existing) {
    return createBalance(userId, balance);
  }
  
  const result = await handlequery(
    `UPDATE balance SET balance = ?, updatedAt = CURRENT_TIMESTAMP(3) WHERE userId = ?`,
    [balance, userId],
  );
  return findBalanceByUserId(userId);
};

const deleteBalance = async (userId) => {
  const result = await handlequery(
    `DELETE FROM balance WHERE userId = ?`,
    [userId],
  );
  return result.affectedRows > 0;
};

module.exports = {
  countAllBalances,
  createBalance,
  deleteBalance,
  findAllBalances,
  findBalanceById,
  findBalanceByUserId,
  mapBalance,
  updateBalance,
};