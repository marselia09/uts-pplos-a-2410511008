const express = require("express");
const passport = require("passport");
const controller = require("./auth.controller.js");
const authService = require("./auth.service.js");
const { authConfig, ownerConfig, userConfig } = require("./auth.config.js");
const { requireAuth } = require("../shared/auth.middleware.js");

const router = express.Router();
authService.configureGoogleStrategy(passport, userConfig);
authService.configureGoogleStrategy(passport, ownerConfig);

router.post("/register-user", controller.registerUser);
router.post("/register-pemilik", controller.registerOwner);
router.post("/login", controller.login);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.post(
  "/logout-all",
  requireAuth(authConfig, authService),
  controller.logoutAll,
);
router.get("/me", requireAuth(authConfig, authService), controller.me);

router.post("/register-user/oauth/google", controller.googleOauthUser);
router.post("/register-pemilik/oauth/google", controller.googleOauthOwner);

router.get(
  "/google/user",
  (req, res, next) => {
    console.log('Google OAuth - User callback URL:', userConfig.callbackUrl);
    next();
  },
  passport.authenticate(userConfig.strategyName, {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/pemilik",
  (req, res, next) => {
    console.log('Google OAuth - Pemilik callback URL:', ownerConfig.callbackUrl);
    next();
  },
  passport.authenticate(ownerConfig.strategyName, {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/callback/user",
  passport.authenticate(userConfig.strategyName, {
    session: false,
    failureRedirect: "/auth/login",
  }),
  controller.googleCallback,
);

router.get(
  "/callback/pemilik",
  passport.authenticate(ownerConfig.strategyName, {
    session: false,
    failureRedirect: "/auth/login",
  }),
  controller.googleCallback,
);

// Debug route to check OAuth config
router.get("/debug/oauth-config", (req, res) => {
  res.json({
    userConfig: {
      callbackUrl: userConfig.callbackUrl,
      strategyName: userConfig.strategyName,
    },
    ownerConfig: {
      callbackUrl: ownerConfig.callbackUrl,
      strategyName: ownerConfig.strategyName,
    },
    env: {
      OAUTH_USER_CALLBACK_URL: process.env.OAUTH_USER_CALLBACK_URL,
      OAUTH_OWNER_CALLBACK_URL: process.env.OAUTH_OWNER_CALLBACK_URL,
    }
  });
});

module.exports = router;
