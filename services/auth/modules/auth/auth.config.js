const userConfig = {
  callbackUrl:
    process.env.OAUTH_USER_CALLBACK_URL ||
    "http://localhost:3001/auth/callback/user",
  label: "user",
  profileTable: "userprofile",
  roleName: "User",
  strategyName: "google-user",
};

const ownerConfig = {
  callbackUrl:
    process.env.OAUTH_OWNER_CALLBACK_URL ||
    "http://localhost:3001/auth/callback/pemilik",
  label: "pemilik",
  profileTable: "ownerprofile",
  roleName: "Pemilik",
  strategyName: "google-owner",
};

const authConfig = {
  label: "auth",
};

module.exports = {
  authConfig,
  ownerConfig,
  userConfig,
};
