const validator = require("./room.validator.js");
const roomService = require("./room.service.js");
const config = require("./room.config.js");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const sendSuccess = (res, statusCode, message, data, meta = null) => {
  const response = { success: true, message, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
};

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server",
  });
};

const listRooms = async (req, res) => {
  try {
    const kosId = req.query.kosId ? validator.validateKosId(req.query.kosId) : null;
    
    if (kosId) {
      const page = parseInt(req.query.page) || DEFAULT_PAGE;
      const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
      const offset = (page - 1) * limit;

      const result = await roomService.findRoomsByKosIdPaginated(kosId, limit, offset);
      const total = await roomService.countRoomsByKosId(kosId);
      const meta = { page, limit, total, totalPages: Math.ceil(total / limit) };

      sendSuccess(res, 200, `Daftar ${config.label.toLowerCase()} berhasil diambil`, result, meta);
    } else {
      const rooms = await roomService.findAllRooms();
      sendSuccess(res, 200, `Daftar ${config.label.toLowerCase()} berhasil diambil`, rooms);
    }
  } catch (error) {
    handleError(res, error);
  }
};

const getRoom = async (req, res) => {
  try {
    const id = validator.validateRoomId(req.params.id);
    const room = await roomService.findRoomById(id);
    sendSuccess(res, 200, `${config.label} berhasil diambil`, room);
  } catch (error) {
    handleError(res, error);
  }
};

const createRoomHandler = async (req, res) => {
  try {
    const payload = validator.validateCreateRoom(req.body);
    const pemilikId = req.user.id;
    const room = await roomService.createRoom(payload, pemilikId);
    sendSuccess(res, 201, `${config.label} baru berhasil dibuat`, room);
  } catch (error) {
    handleError(res, error);
  }
};

const updateRoomHandler = async (req, res) => {
  try {
    const id = validator.validateRoomId(req.params.id);
    const payload = validator.validateUpdateRoom(req.body);
    const pemilikId = req.user.id;
    const room = await roomService.updateRoom(id, payload, pemilikId);
    sendSuccess(res, 200, `${config.label} berhasil diupdate`, room);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteRoomHandler = async (req, res) => {
  try {
    const id = validator.validateRoomId(req.params.id);
    const pemilikId = req.user.id;
    await roomService.deleteRoom(id, pemilikId);
    sendSuccess(res, 200, `${config.label} berhasil dihapus`, null);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createRoom: createRoomHandler,
  deleteRoom: deleteRoomHandler,
  getRoom,
  listRooms,
  updateRoom: updateRoomHandler,
};