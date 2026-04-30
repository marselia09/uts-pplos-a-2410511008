const userConfig = {
  callbackUrl: "http://localhost:3001/callback/user",
  label: "user",
  profileTable: "user_profile",
  roleName: "User",
  strategyName: "google-user",
};

const ownerConfig = {
  callbackUrl: "http://localhost:3001/callback/pemilik",
  label: "pemilik",
  profileTable: "owner_profile",
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
