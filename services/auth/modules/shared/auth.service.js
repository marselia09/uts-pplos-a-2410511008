const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const repository = require("./auth.repository.js");

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";
const JWT_ACCESS_TOKEN_EXPIRES_IN =
  process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || "15m";
const JWT_REFRESH_TOKEN_EXPIRES_IN =
  process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || "7d";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const signToken = (user, tokenType, expiresIn) => {
  return jwt.sign(
    {
      email: user.email,
      username: user.username,
      role: user.roleName,
      type: tokenType,
    },
    JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn,
      subject: String(user.id),
    },
  );
};

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const getTokenExpiresAt = (token) => {
  const decoded = jwt.decode(token);
  return new Date(decoded.exp * 1000);
};

const authPayload = async (user, session = {}) => {
  const accessToken = signToken(user, "access", JWT_ACCESS_TOKEN_EXPIRES_IN);
  const refreshToken = signToken(user, "refresh", JWT_REFRESH_TOKEN_EXPIRES_IN);
  const refreshTokenExpiresAt = getTokenExpiresAt(refreshToken);

  await repository.createRefreshTokenSession({
    authId: user.id,
    tokenHash: hashToken(refreshToken),
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    expiresAt: refreshTokenExpiresAt,
  });

  return {
    user,
    token: accessToken,
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    accessTokenExpiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
    refreshTokenExpiresAt,
  };
};

const isRole = (user, roleName) =>
  !roleName || user?.roleName?.toLowerCase() === roleName.toLowerCase();

const getRoleId = async (roleName) => {
  const role = await repository.findRoleByName(roleName);
  if (!role) {
    throw createError(`Role '${roleName}' tidak ditemukan`, 400);
  }
  return role.id;
};

const createUsernameFromEmail = async (email) => {
  const base =
    email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, "")
      .slice(0, 24) || "user";

  let username = base;
  let suffix = 1;

  while (await repository.findByUsername(username)) {
    username = `${base}${suffix}`;
    suffix += 1;
  }

  return username;
};

const splitDisplayName = (displayName, fallback) => {
  const parts = (displayName || fallback || "User").trim().split(/\s+/);
  return {
    firstname: parts.shift() || "User",
    lastname: parts.join(" "),
  };
};

const register = async (config, payload, session) => {
  const [existingEmail, existingUsername] = await Promise.all([
    repository.findByEmail(payload.email),
    repository.findByUsername(payload.username),
  ]);

  if (existingEmail) {
    throw createError("Email sudah terdaftar", 409);
  }

  if (existingUsername) {
    throw createError("Username sudah digunakan", 409);
  }

  const roleId = await getRoleId(config.roleName);
  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = await repository.createLocalAccount({
    email: payload.email,
    username: payload.username,
    passwordHash,
    roleId,
    profileTable: config.profileTable,
    profile: {
      firstname: payload.firstname,
      lastname: payload.lastname,
      phone: payload.phone,
      pictures: payload.pictures,
    },
  });

  await createInitialBalance(user.id);

  return authPayload(user, session);
};

const createInitialBalance = async (userId) => {
  const { handlequery } = require("../../config/database.js");
  try {
    await handlequery(
      `INSERT INTO balance (userId, balance, createdAt, updatedAt) VALUES (?, 0, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
      [userId],
    );
  } catch (error) {
    console.error("Failed to create initial balance:", error);
  }
};

const login = async (config, { email, password }, session) => {
  const user = await repository.findByEmailWithPassword(email);
  if (!user || !user.password || !isRole(user, config.roleName)) {
    throw createError("Email atau password salah", 401);
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw createError("Email atau password salah", 401);
  }

  return authPayload(repository.mapUser(user), session);
};

const verifyToken = (token, expectedType = "access") => {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (payload.type !== expectedType) {
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

const getAuthenticatedUser = async (config, token) => {
  const payload = verifyToken(token, "access");
  const user = await repository.findPublicById(payload.sub);

  if (!user || !isRole(user, config?.roleName)) {
    throw createError("Token tidak valid untuk role ini", 401);
  }

  return user;
};

const refreshAccessToken = async (config, { refreshToken }) => {
  const payload = verifyToken(refreshToken, "refresh");
  const session = await repository.findActiveRefreshTokenSession(
    hashToken(refreshToken),
  );

  if (!session || String(session.authId) !== String(payload.sub)) {
    throw createError("Refresh token tidak valid atau sudah logout", 401);
  }

  const user = await repository.findPublicById(payload.sub);

  if (!user || !isRole(user, config?.roleName)) {
    throw createError("Refresh token tidak valid untuk role ini", 401);
  }

  await repository.revokeRefreshTokenSession(hashToken(refreshToken));
  return authPayload(user, {
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
  });
};

const buildGoogleUserProfile = (profile) => {
  const email = profile.email || profile.emails?.[0]?.value?.toLowerCase();
  const avatarUrl = profile.avatarUrl || profile.photos?.[0]?.value || null;
  const displayName =
    typeof profile.name === "string" ? profile.name : profile.displayName;
  const profileName = splitDisplayName(
    displayName,
    email?.split("@")[0],
  );

  return {
    subject: profile.subject || profile.id,
    email,
    avatarUrl,
    firstname: profile.givenName || profile.name?.givenName || profileName.firstname,
    lastname: profile.familyName || profile.name?.familyName || profileName.lastname,
  };
};

const loginOrRegisterWithGoogleProfile = async (config, googleProfile) => {
  const profile = buildGoogleUserProfile(googleProfile);
  if (!profile.email || !profile.subject) {
    throw createError("Data akun Google tidak lengkap", 401);
  }

  const profileData = {
    firstname: profile.firstname,
    lastname: profile.lastname,
    phone: null,
    pictures: profile.avatarUrl,
  };

  const existingOauthUser = await repository.findByOauthIdentity(
    "google",
    profile.subject,
  );

  if (existingOauthUser) {
    if (!isRole(existingOauthUser, config.roleName)) {
      throw createError("Akun Google sudah terdaftar pada role lain", 409);
    }

    await repository.ensureProfile({
      profileTable: config.profileTable,
      authId: existingOauthUser.id,
      ...profileData,
    });
    return authPayload(existingOauthUser, config.session);
  }

  const existingEmailUser = await repository.findByEmail(profile.email);
  if (existingEmailUser) {
    if (!isRole(existingEmailUser, config.roleName)) {
      throw createError("Email sudah terdaftar pada role lain", 409);
    }

    const linkedUser = await repository.linkOauthIdentity({
      userId: existingEmailUser.id,
      provider: "google",
      subject: profile.subject,
      avatarUrl: profile.avatarUrl,
    });

    await repository.ensureProfile({
      profileTable: config.profileTable,
      authId: linkedUser.id,
      ...profileData,
    });

    return authPayload(linkedUser, config.session);
  }

  const roleId = await getRoleId(config.roleName);
  const username = await createUsernameFromEmail(profile.email);
  const user = await repository.createOauthAccount({
    email: profile.email,
    username,
    roleId,
    provider: "google",
    subject: profile.subject,
    avatarUrl: profile.avatarUrl,
    profileTable: config.profileTable,
    profile: profileData,
  });

  return authPayload(user, config.session);
};

const verifyGoogleIdToken = async (idToken) => {
  if (!GOOGLE_CLIENT_ID) {
    throw createError("GOOGLE_CLIENT_ID belum dikonfigurasi", 500);
  }

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
  );

  if (!response.ok) {
    throw createError("Google token tidak valid", 401);
  }

  const payload = await response.json();
  if (payload.aud !== GOOGLE_CLIENT_ID) {
    throw createError("Google token audience tidak sesuai", 401);
  }

  if (payload.email_verified !== "true" && payload.email_verified !== true) {
    throw createError("Email Google belum terverifikasi", 401);
  }

  return {
    subject: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name,
    givenName: payload.given_name,
    familyName: payload.family_name,
    avatarUrl: payload.picture,
  };
};

const loginOrRegisterWithGoogle = async (config, { idToken }, session) => {
  const profile = await verifyGoogleIdToken(idToken);
  return loginOrRegisterWithGoogleProfile({ ...config, session }, profile);
};

const logout = async ({ refreshToken }) => {
  verifyToken(refreshToken, "refresh");
  await repository.revokeRefreshTokenSession(hashToken(refreshToken));
  return true;
};

const logoutAll = async (config, token) => {
  const payload = verifyToken(token, "access");
  const user = await repository.findPublicById(payload.sub);

  if (!user || !isRole(user, config?.roleName)) {
    throw createError("Token tidak valid untuk role ini", 401);
  }

  await repository.revokeAllRefreshTokenSessions(user.id);
  return true;
};

const configureGoogleStrategy = (passport, config) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return;
  }

  passport.use(
    config.strategyName,
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: config.callbackUrl,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const result = await loginOrRegisterWithGoogleProfile(config, profile);
          done(null, result);
        } catch (error) {
          done(error);
        }
      },
    ),
  );
};

module.exports = {
  configureGoogleStrategy,
  getAuthenticatedUser,
  login,
  loginOrRegisterWithGoogle,
  logout,
  logoutAll,
  refreshAccessToken,
  register,
};
