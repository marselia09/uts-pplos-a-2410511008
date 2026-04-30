const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { globalLimiter } = require("./middlewares/rateLimiter.js");
const app = express();
const port = 3000;
app.use(
  "/service1",
  createProxyMiddleware({
    target: "http://localhost:3001",
    changeOrigin: true,
    pathRewrite: {
      "^/service1": "",
    },
  }),
);
app.use(
  "/service2",
  createProxyMiddleware({
    target: "http://localhost:3002",
    changeOrigin: true,
    pathRewrite: {
      "^/service2": "",
    },
  }),
);
app.use(
  "/service3",
  createProxyMiddleware({
    target: "http://localhost:3003",
    changeOrigin: true,
    pathRewrite: {
      "^/service3": "",
    },
  }),
);

module.exports = app;
