const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { globalLimiter } = require("./middlewares/rateLimiter.js");
const app = express();

app.use(globalLimiter);
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/auth": "",
    },
  }),
);

app.use(
  "/users",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: {
      "^/users": "",
    },
  }),
);

app.use(
  "/kos",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
    pathRewrite: {
      "^/kos": "",
    },
  }),
);

module.exports = app;
