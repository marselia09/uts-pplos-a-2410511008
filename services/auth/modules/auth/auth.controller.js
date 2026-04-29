const validator = require("../shared/auth.validator.js");
const authService = require("./auth.service.js");
const { authConfig, ownerConfig, userConfig } = require("./auth.config.js");

const sendSuccess = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const handleError = (res, error) => {
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Terjadi kesalahan pada server",
  });
};

const getSessionMeta = (req) => ({
  userAgent: req.headers["user-agent"] || null,
  ipAddress: req.ip || req.socket?.remoteAddress || null,
});

const registerWithConfig = (config) => async (req, res) => {
  try {
    const payload = validator.validateRegister(req.body);
    const result = await authService.register(config, payload, getSessionMeta(req));
    sendSuccess(res, 201, `Register ${config.label} berhasil`, result);
  } catch (error) {
    handleError(res, error);
  }
};

const googleOauthWithConfig = (config) => async (req, res) => {
  try {
    const payload = validator.validateGoogleOauth(req.body);
    const result = await authService.loginOrRegisterWithGoogle(
      config,
      payload,
      getSessionMeta(req),
    );
    sendSuccess(res, 200, `Login Google ${config.label} berhasil`, result);
  } catch (error) {
    handleError(res, error);
  }
};

const login = async (req, res) => {
  try {
    const payload = validator.validateLogin(req.body);
    const result = await authService.login(authConfig, payload, getSessionMeta(req));
    sendSuccess(res, 200, "Login berhasil", result);
  } catch (error) {
    handleError(res, error);
  }
};

const refresh = async (req, res) => {
  try {
    const payload = validator.validateRefreshToken(req.body);
    const result = await authService.refreshAccessToken(authConfig, payload);
    sendSuccess(res, 200, "Refresh token berhasil", result);
  } catch (error) {
    handleError(res, error);
  }
};

const logout = async (req, res) => {
  try {
    const payload = validator.validateLogout(req.body);
    await authService.logout(payload);
    sendSuccess(res, 200, "Logout berhasil", null);
  } catch (error) {
    handleError(res, error);
  }
};

const logoutAll = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    await authService.logoutAll(authConfig, token);
    sendSuccess(res, 200, "Logout semua session berhasil", null);
  } catch (error) {
    handleError(res, error);
  }
};

const me = (req, res) => {
  sendSuccess(res, 200, "Data auth berhasil diambil", req.user);
};

const googleCallback = (req, res) => {
  sendSuccess(res, 200, "Login Google berhasil", req.user);
};

module.exports = {
  googleCallback,
  googleOauthOwner: googleOauthWithConfig(ownerConfig),
  googleOauthUser: googleOauthWithConfig(userConfig),
  login,
  logout,
  logoutAll,
  me,
  refresh,
  registerOwner: registerWithConfig(ownerConfig),
  registerUser: registerWithConfig(userConfig),
};
