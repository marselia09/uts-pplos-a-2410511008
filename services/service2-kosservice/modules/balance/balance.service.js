const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const repository = require("./balance.repository.js");
const config = require("./balance.config.js");

const findBalanceByUserId = async (userId) => {
  let balance = await repository.findBalanceByUserId(userId);
  if (!balance) {
    balance = await repository.createBalance(userId, 0);
  }
  return balance;
};

const findBalanceById = async (id) => {
  const balance = await repository.findBalanceById(id);
  if (!balance) {
    throw createError(`${config.label} dengan ID ${id} tidak ditemukan`, 404);
  }
  return balance;
};

const updateUserBalance = async (targetUserId, newBalance, adminUserId, adminRole) => {
  if (adminRole !== "Superadmin") {
    throw createError("Hanya superadmin yang dapat mengupdate balance", 403);
  }
  
  if (targetUserId === adminUserId) {
    throw createError("Tidak dapat mengupdate balance diri sendiri", 400);
  }
  
  return await repository.updateBalance(targetUserId, newBalance);
};

const getUserBalance = async (targetUserId, requesterId, requesterRole) => {
  if (requesterRole === "Superadmin") {
    return await findBalanceByUserId(targetUserId);
  }
  
  if (targetUserId !== requesterId) {
    throw createError("Tidak berhak melihat balance user lain", 403);
  }
  
  return await findBalanceByUserId(targetUserId);
};

const findAllBalancesPaginated = async (limit, offset) => {
  return await repository.findAllBalances(limit, offset);
};

const countAllBalances = async () => {
  return await repository.countAllBalances();
};

module.exports = {
  countAllBalances,
  findBalanceById,
  findBalanceByUserId,
  findAllBalancesPaginated,
  getUserBalance,
  updateUserBalance,
};