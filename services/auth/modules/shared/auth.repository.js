const { handlequery, pool } = require("../../config/database.js");

const allowedProfileTables = new Set(["userprofile", "ownerprofile"]);

const assertProfileTable = (profileTable) => {
  if (!allowedProfileTables.has(profileTable)) {
    throw new Error("Profile table tidak valid");
  }
};

const publicUserColumns = `
  auth.id,
  auth.email,
  auth.username,
  auth.roleId,
  auth.oauthProvider,
  auth.oauthSubject,
  auth.avatarUrl,
  auth.createdAt,
  auth.updatedAt,
  role.name AS roleName
`;

const mapUser = (row) => {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    roleId: row.roleId,
    roleName: row.roleName,
    oauthProvider: row.oauthProvider,
    oauthSubject: row.oauthSubject,
    avatarUrl: row.avatarUrl,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
};

const findRoleByName = async (name) => {
  const rows = await handlequery(
    "SELECT id, name FROM role WHERE LOWER(name) = LOWER(?) LIMIT 1",
    [name],
  );
  return rows[0] || null;
};

const findByEmailWithPassword = async (emailOrUsername) => {
  const rows = await handlequery(
    `SELECT ${publicUserColumns}, auth.password
     FROM auth
     JOIN role ON role.id = auth.roleId
     WHERE auth.email = ? OR auth.username = ?
     LIMIT 1`,
    [emailOrUsername, emailOrUsername],
  );
  return rows[0] || null;
};

const findPublicById = async (id) => {
  const rows = await handlequery(
    `SELECT ${publicUserColumns}
     FROM auth
     JOIN role ON role.id = auth.roleId
     WHERE auth.id = ?
     LIMIT 1`,
    [id],
  );
  return mapUser(rows[0]);
};

const findByEmail = async (email) => {
  const rows = await handlequery(
    `SELECT ${publicUserColumns}
     FROM auth
     JOIN role ON role.id = auth.roleId
     WHERE auth.email = ?
     LIMIT 1`,
    [email],
  );
  return mapUser(rows[0]);
};

const findByUsername = async (username) => {
  const rows = await handlequery(
    "SELECT id, username FROM auth WHERE username = ? LIMIT 1",
    [username],
  );
  return rows[0] || null;
};

const findByOauthIdentity = async (provider, subject) => {
  const rows = await handlequery(
    `SELECT ${publicUserColumns}
     FROM auth
     JOIN role ON role.id = auth.roleId
     WHERE auth.oauthProvider = ? AND auth.oauthSubject = ?
     LIMIT 1`,
    [provider, subject],
  );
  return mapUser(rows[0]);
};

const createProfile = async (
  queryRunner,
  profileTable,
  { authId, firstname, lastname, phone, pictures },
) => {
  assertProfileTable(profileTable);

  await queryRunner.query(
    `INSERT INTO ${profileTable}
      (firstname, lastname, phone, pictures, authId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [firstname, lastname, phone || null, pictures || null, authId],
  );
};

const profileExists = async (profileTable, authId) => {
  assertProfileTable(profileTable);

  const rows = await handlequery(
    `SELECT id FROM ${profileTable} WHERE authId = ? LIMIT 1`,
    [authId],
  );
  return Boolean(rows[0]);
};

const ensureProfile = async ({
  profileTable,
  authId,
  firstname,
  lastname,
  phone,
  pictures,
}) => {
  if (await profileExists(profileTable, authId)) {
    return;
  }

  assertProfileTable(profileTable);
  await handlequery(
    `INSERT INTO ${profileTable}
      (firstname, lastname, phone, pictures, authId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [firstname, lastname, phone || null, pictures || null, authId],
  );
};

const createLocalAccount = async ({
  email,
  username,
  passwordHash,
  roleId,
  profileTable,
  profile,
}) => {
  assertProfileTable(profileTable);
  const connection = await pool.getConnection();

  let authId;
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO auth (email, username, password, roleId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
      [email, username, passwordHash, roleId],
    );
    authId = result.insertId;

    await createProfile(connection, profileTable, {
      authId,
      ...profile,
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findPublicById(authId);
};

const createOauthAccount = async ({
  email,
  username,
  roleId,
  provider,
  subject,
  avatarUrl,
  profileTable,
  profile,
}) => {
  assertProfileTable(profileTable);
  const connection = await pool.getConnection();

  let authId;
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO auth
        (email, username, password, roleId, oauthProvider, oauthSubject, avatarUrl, createdAt, updatedAt)
       VALUES (?, ?, NULL, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
      [email, username, roleId, provider, subject, avatarUrl || null],
    );
    authId = result.insertId;

    await createProfile(connection, profileTable, {
      authId,
      pictures: avatarUrl,
      ...profile,
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findPublicById(authId);
};

const linkOauthIdentity = async ({ userId, provider, subject, avatarUrl }) => {
  await handlequery(
    `UPDATE auth
     SET oauthProvider = ?, oauthSubject = ?, avatarUrl = ?, updatedAt = CURRENT_TIMESTAMP(3)
     WHERE id = ?`,
    [provider, subject, avatarUrl || null, userId],
  );
  return findPublicById(userId);
};

const createRefreshTokenSession = async ({
  authId,
  tokenHash,
  userAgent,
  ipAddress,
  expiresAt,
}) => {
  const result = await handlequery(
    `INSERT INTO refreshtoken
      (authId, tokenHash, userAgent, ipAddress, expiresAt, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP(3), CURRENT_TIMESTAMP(3))`,
    [authId, tokenHash, userAgent || null, ipAddress || null, expiresAt],
  );

  return result.insertId;
};

const findActiveRefreshTokenSession = async (tokenHash) => {
  const rows = await handlequery(
    `SELECT id, authId, tokenHash, userAgent, ipAddress, expiresAt, revokedAt
     FROM refreshtoken
     WHERE tokenHash = ?
       AND revokedAt IS NULL
       AND expiresAt > CURRENT_TIMESTAMP(3)
     LIMIT 1`,
    [tokenHash],
  );

  return rows[0] || null;
};

const revokeRefreshTokenSession = async (tokenHash) => {
  await handlequery(
    `UPDATE refreshtoken
     SET revokedAt = CURRENT_TIMESTAMP(3), updatedAt = CURRENT_TIMESTAMP(3)
     WHERE tokenHash = ? AND revokedAt IS NULL`,
    [tokenHash],
  );
};

const revokeAllRefreshTokenSessions = async (authId) => {
  await handlequery(
    `UPDATE refreshtoken
     SET revokedAt = CURRENT_TIMESTAMP(3), updatedAt = CURRENT_TIMESTAMP(3)
     WHERE authId = ? AND revokedAt IS NULL`,
    [authId],
  );
};

module.exports = {
  createLocalAccount,
  createOauthAccount,
  createRefreshTokenSession,
  ensureProfile,
  findActiveRefreshTokenSession,
  findByEmail,
  findByEmailWithPassword,
  findByOauthIdentity,
  findByUsername,
  findPublicById,
  findRoleByName,
  linkOauthIdentity,
  mapUser,
  revokeAllRefreshTokenSessions,
  revokeRefreshTokenSession,
};
