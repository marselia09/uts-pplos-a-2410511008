const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fail = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  throw error;
};

const assertEmail = (email) => {
  if (!email || typeof email !== "string" || !emailRegex.test(email)) {
    fail("Email tidak valid");
  }
};

const assertPassword = (password) => {
  if (!password || typeof password !== "string" || password.length < 8) {
    fail("Password minimal 8 karakter");
  }
};

const validateRegister = (body) => {
  assertEmail(body.email);

  if (!body.username || typeof body.username !== "string") {
    fail("Username wajib diisi");
  }

  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(body.username)) {
    fail("Username hanya boleh huruf, angka, titik, underscore, atau dash (3-30 karakter)");
  }

  assertPassword(body.password);

  return {
    email: body.email.toLowerCase().trim(),
    username: body.username.trim(),
    password: body.password,
    firstname: (body.firstname || body.username).trim(),
    lastname: (body.lastname || "").trim(),
    phone: body.phone || null,
    pictures: body.pictures || null,
  };
};

const validateLogin = (body) => {
  if (!body.email || typeof body.email !== "string" || body.email.length < 3) {
    fail("Email atau username wajib diisi");
  }

  if (!body.password || typeof body.password !== "string" || body.password.length < 8) {
    fail("Password minimal 8 karakter");
  }

  return {
    email: body.email.toLowerCase().trim(),
    password: body.password,
  };
};

const validateGoogleOauth = (body) => {
  if (!body.idToken || typeof body.idToken !== "string") {
    fail("Google idToken wajib diisi");
  }

  return {
    idToken: body.idToken,
  };
};

const validateRefreshToken = (body) => {
  if (!body.refreshToken || typeof body.refreshToken !== "string") {
    fail("Refresh token wajib diisi");
  }

  return {
    refreshToken: body.refreshToken,
  };
};

const validateLogout = (body) => {
  return validateRefreshToken(body);
};

module.exports = {
  fail,
  validateGoogleOauth,
  validateLogin,
  validateLogout,
  validateRefreshToken,
  validateRegister,
};
