const mysql = require("mysql2/promise");
require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});

const pool = mysql.createPool({
  host: process.env.DB.HOST || "localhost",
  port: process.env.DB.PORT || 3306,
  database: process.env.DB.NAME || "apigateway_db",
  user: process.env.DB.USER || "root",
  password: process.env.DB.PASS || "",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  typeCast: function (field, next) {
    if (field.type === "VARSTRING") {
      return field.string();
    }
    return next();
  },
});

const handlequery = async (query, params) => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query(query, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  } finally {
    connection.release();
  }
};
module.exports = { handlequery };
