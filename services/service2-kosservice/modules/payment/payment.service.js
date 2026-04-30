const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const repository = require("./payment.repository.js");
const rentRepository = require("../rent/rent.repository.js");
const roomRepository = require("../room/room.repository.js");
const balanceRepository = require("../balance/balance.repository.js");
const config = require("./payment.config.js");

const findPaymentById = async (id) => {
  const payment = await repository.findPaymentById(id);
  if (!payment) {
    throw createError(`${config.label} dengan ID ${id} tidak ditemukan`, 404);
  }
  return payment;
};

const findPaymentByRentId = async (rentId) => {
  return await repository.findPaymentByRentId(rentId);
};

const calculateTotalPrice = async (rentId) => {
  const rent = await rentRepository.findRentById(rentId);
  if (!rent) {
    throw createError("Rent tidak ditemukan", 404);
  }

  const room = await roomRepository.findRoomById(rent.roomId);
  if (!room) {
    throw createError("Room tidak ditemukan", 404);
  }

  const startDate = new Date(rent.startDate);
  const endDate = new Date(rent.endDate);
  const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  
  return room.price * days;
};

const createPayment = async (payload, userId) => {
  const rent = await rentRepository.findRentById(payload.rentId);
  if (!rent) {
    throw createError("Rent tidak ditemukan", 404);
  }

  if (rent.userId !== userId) {
    throw createError("Tidak berhak membuat payment untuk rent ini", 403);
  }

  if (rent.status !== "ACTIVE") {
    throw createError("Rent harus berstatus ACTIVE untuk melakukan pembayaran", 400);
  }

  const totalPrice = await calculateTotalPrice(payload.rentId);

  return await repository.createPayment({
    rentId: payload.rentId,
    totalPrice,
    paymentMethod: payload.paymentMethod,
    status: "PENDING",
  });
};

const processPayment = async (paymentId, userId, userRole) => {
  const payment = await findPaymentById(paymentId);

  const rent = await rentRepository.findRentById(payment.rentId);
  const isOwner = rent.userId === userId;
  const isSuperadmin = userRole === "Superadmin";

  if (!isOwner && !isSuperadmin) {
    throw createError("Tidak berhak memproses payment ini", 403);
  }

  if (payment.status !== "PENDING") {
    throw createError("Payment sudah diproses", 400);
  }

  if (payment.paymentMethod === "BALANCE") {
    const userBalance = await balanceRepository.findBalanceByUserId(userId);
    if (!userBalance || userBalance.balance < payment.totalPrice) {
      await repository.updatePaymentStatus(paymentId, "FAILED");
      throw createError("Balance tidak mencukupi", 400);
    }

    await balanceRepository.updateBalance(userId, userBalance.balance - payment.totalPrice);
  }

  await repository.updatePaymentStatus(paymentId, "PAID");

  const receipt = await repository.createReceipt({
    paymentId,
    amount: payment.totalPrice,
    description: `Pembayaran sewa room untuk periode ${new Date(rent.startDate).toLocaleDateString()} - ${new Date(rent.endDate).toLocaleDateString()}`,
  });

  const fullPayment = await findPaymentById(paymentId);
  fullPayment.receipt = receipt;

  return fullPayment;
};

const getMyPayments = async (userId) => {
  const rents = await rentRepository.findRentsByUserId(userId);
  const payments = [];
  
  for (const rent of rents) {
    const rentPayments = await repository.findPaymentByRentId(rent.id);
    payments.push(...rentPayments);
  }
  
  return payments;
};

module.exports = {
  calculateTotalPrice,
  createPayment,
  findPaymentById,
  findPaymentByRentId,
  getMyPayments,
  processPayment,
};