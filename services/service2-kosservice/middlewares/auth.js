const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const verifyToken = (token) => {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (payload.type !== "access") {
      throw createError("Tipe token tidak valid", 401);
    }

    return payload;
  } catch (error) {
    if (error.statusCode) {
      throw error;
    }
    throw createError("Token tidak valid atau sudah expired", 401);
  }
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Authorization header dengan Bearer token diperlukan");
    error.statusCode = 401;
    return next(error);
  }

  const token = authHeader.substring(7);

  try {
    const payload = verifyToken(token);
    req.user = {
      id: parseInt(payload.sub, 10),
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const requireSuperadmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "Superadmin" && req.user.role !== "Pemilik")) {
    const error = new Error("Hanya superadmin/pemilik yang dapat melakukan aksi ini");
    error.statusCode = 403;
    return next(error);
  }
  next();
};

const isSuperadmin = (role) => role === "Superadmin";
const isPemilik = (role) => role === "Pemilik";

module.exports = { authMiddleware, verifyToken, requireSuperadmin, isSuperadmin, isPemilik };