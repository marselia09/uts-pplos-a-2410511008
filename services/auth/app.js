const express = require("express");
const cors = require("cors");
const passport = require("passport");
const authRoutes = require("./modules/auth/auth.routes.js");
const { loginLimiter } = require("./middlewares/rateLimiter.js");
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(passport.initialize());
app.use("/", loginLimiter, authRoutes);

// Error handler untuk return JSON
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found: ' + req.originalUrl
  });
});

module.exports = app;
