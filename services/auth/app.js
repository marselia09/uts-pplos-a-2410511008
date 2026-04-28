const express = require("express");
// const routes = require("./routes.js")
const { loginLimiter } = require("./middlewares/rateLimiter.js");
const router = express.Router();
const app = express();

app.use(loginLimiter);
app.use(express.json());
app.use(router);

module.exports = app;
