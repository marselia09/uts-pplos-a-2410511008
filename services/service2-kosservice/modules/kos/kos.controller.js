const validator = require("./kos.validator.js");
const kosService = require("./kos.service.js");
const config = require("./kos.config.js");

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const sendSuccess = (res, statusCode, message, data, meta = null) => {
  const response = {
    success: true,
    message,
    data,
  };
  if (meta) {
    response.meta = meta;
  }
  res.status(statusCode).json(response);
};

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server",
  });
};

const listKos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;

    const result = await kosService.findAllKosPaginated(limit, offset);
    const total = await kosService.countKos();

    const totalPages = Math.ceil(total / limit);
    const meta = {
      page,
      limit,
      total,
      totalPages,
    };

    sendSuccess(
      res,
      200,
      `Daftar ${config.label.toLowerCase()} berhasil diambil`,
      result,
      meta,
    );
  } catch (error) {
    handleError(res, error);
  }
};

const getMyKos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || DEFAULT_PAGE;
    const limit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const offset = (page - 1) * limit;
    const pemilikId = req.user.id;

    const result = await kosService.findKosByPemilikId(pemilikId, limit, offset);
    const total = await kosService.countKosByPemilikId(pemilikId);

    const totalPages = Math.ceil(total / limit);
    const meta = {
      page,
      limit,
      total,
      totalPages,
    };

    sendSuccess(
      res,
      200,
      `Daftar ${config.label.toLowerCase()} saya berhasil diambil`,
      result,
      meta,
    );
  } catch (error) {
    handleError(res, error);
  }
};

const getKos = async (req, res) => {
  try {
    const id = validator.validateKosId(req.params.id);
    const kos = await kosService.findKosById(id);
    sendSuccess(res, 200, `${config.label} berhasil diambil`, kos);
  } catch (error) {
    handleError(res, error);
  }
};

const createKosHandler = async (req, res) => {
  try {
    const payload = validator.validateCreateKos(req.body);
    const pemilikId = req.user.id;
    const kos = await kosService.createKos(payload, pemilikId);
    sendSuccess(res, 201, `${config.label} baru berhasil dibuat`, kos);
  } catch (error) {
    handleError(res, error);
  }
};

const updateKosHandler = async (req, res) => {
  try {
    const id = validator.validateKosId(req.params.id);
    const payload = validator.validateUpdateKos(req.body);
    const pemilikId = req.user.id;
    const kos = await kosService.updateKos(id, payload, pemilikId);
    sendSuccess(res, 200, `${config.label} berhasil diupdate`, kos);
  } catch (error) {
    handleError(res, error);
  }
};

const deleteKosHandler = async (req, res) => {
  try {
    const id = validator.validateKosId(req.params.id);
    const pemilikId = req.user.id;
    const userRole = req.user.role;
    await kosService.deleteKos(id, pemilikId, userRole);
    sendSuccess(res, 200, `${config.label} berhasil dihapus`, null);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports = {
  createKos: createKosHandler,
  deleteKos: deleteKosHandler,
  getKos,
  getMyKos,
  listKos,
  updateKos: updateKosHandler,
};
