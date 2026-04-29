const validator = require("./auth.validator.js");

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

const createAuthController = (config, authService) => ({
  register: async (req, res) => {
    try {
      const payload = validator.validateRegister(req.body);
      const result = await authService.register(config, payload, getSessionMeta(req));
      sendSuccess(res, 201, `Register ${config.label} berhasil`, result);
    } catch (error) {
      handleError(res, error);
    }
  },

  login: async (req, res) => {
    try {
      const payload = validator.validateLogin(req.body);
      const result = await authService.login(config, payload, getSessionMeta(req));
      sendSuccess(res, 200, `Login ${config.label} berhasil`, result);
    } catch (error) {
      handleError(res, error);
    }
  },

  googleOauth: async (req, res) => {
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
  },

  googleCallback: (req, res) => {
    sendSuccess(res, 200, `Login Google ${config.label} berhasil`, req.user);
  },

  refresh: async (req, res) => {
    try {
      const payload = validator.validateRefreshToken(req.body);
      const result = await authService.refreshAccessToken(config, payload);
      sendSuccess(res, 200, `Refresh token ${config.label} berhasil`, result);
    } catch (error) {
      handleError(res, error);
    }
  },

  me: (req, res) => {
    sendSuccess(res, 200, `Data ${config.label} berhasil diambil`, req.user);
  },

  logout: async (req, res) => {
    try {
      const payload = validator.validateLogout(req.body);
      await authService.logout(payload);
      sendSuccess(res, 200, `Logout ${config.label} berhasil`, null);
    } catch (error) {
      handleError(res, error);
    }
  },

  logoutAll: async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      await authService.logoutAll(config, token);
      sendSuccess(res, 200, `Logout semua session ${config.label} berhasil`, null);
    } catch (error) {
      handleError(res, error);
    }
  },
});

module.exports = createAuthController;
