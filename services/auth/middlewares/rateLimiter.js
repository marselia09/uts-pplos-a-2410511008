const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  // windowMs: 10 * 60 * 1000, // 10 menit
  // max: 5, // max 5 kali login
  // message: {
  //   message: "Too many login attempts. Try again in 10 minutes",
  // },
});

module.exports = { loginLimiter };
