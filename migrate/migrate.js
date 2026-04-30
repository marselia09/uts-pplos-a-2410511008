const mysql = require("mysql2/promise");

async function migrate() {
  const pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    waitForConnections: true,
    connectionLimit: 10,
  });

  const connection = await pool.getConnection();

  try {
    console.log("Creating database if not exists...");
    await connection.query("CREATE DATABASE IF NOT EXISTS sistem_koskosan_db");
    await connection.query("USE sistem_koskosan_db");

    console.log("Running migrations...");

    // Drop all tables (both old Prisma and new lowercase)
    console.log("Dropping existing tables...");
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    const tables = [
      "receipt",
      "Receipt",
      "payment",
      "Payment",
      "rent",
      "Rent",
      "room",
      "Room",
      "kos_facility",
      "KosFacility",
      "facility",
      "Facility",
      "kos",
      "Kos",
      "balance",
      "Balance",
      "ownerprofile",
      "OwnerProfile",
      "userprofile",
      "UserProfile",
      "refresh_token",
      "RefreshToken",
      "auth",
      "Auth",
      "role",
      "Role",
      "_prisma_migrations",
    ];
    for (const table of tables) {
      await connection.query(`DROP TABLE IF EXISTS ${table}`);
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // Create Role table
    console.log("Creating Role table...");
    await connection.query(`
      CREATE TABLE role (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Auth table
    console.log("Creating Auth table...");
    await connection.query(`
      CREATE TABLE auth (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        oauthProvider VARCHAR(50),
        oauthSubject VARCHAR(255),
        avatarUrl TEXT,
        roleId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (roleId) REFERENCES role(id)
      )
    `);

    // Create UserProfile table
    console.log("Creating UserProfile table...");
    await connection.query(`
      CREATE TABLE userprofile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        pictures TEXT,
        authId INT NOT NULL UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (authId) REFERENCES auth(id) ON DELETE CASCADE
      )
    `);

    // Create OwnerProfile table
    console.log("Creating OwnerProfile table...");
    await connection.query(`
      CREATE TABLE ownerprofile (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstname VARCHAR(255) NOT NULL,
        lastname VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        pictures TEXT,
        authId INT NOT NULL UNIQUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (authId) REFERENCES auth(id) ON DELETE CASCADE
      )
    `);

    // Create RefreshToken table
    console.log("Creating RefreshToken table...");
    await connection.query(`
      CREATE TABLE refreshtoken (
        id INT AUTO_INCREMENT PRIMARY KEY,
        authId INT NOT NULL,
        tokenHash VARCHAR(191) NOT NULL UNIQUE,
        userAgent VARCHAR(191),
        ipAddress VARCHAR(191),
        expiresAt DATETIME NOT NULL,
        revokedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (authId) REFERENCES auth(id) ON DELETE CASCADE
      )
    `);
    await connection.query(
      "CREATE INDEX idx_refresh_token_authId ON refreshtoken(authId)",
    );

    // Create Balance table
    console.log("Creating Balance table...");
    await connection.query(`
      CREATE TABLE balance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        balance BIGINT DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES auth(id) ON DELETE CASCADE
      )
    `);

    // Create Facility table
    console.log("Creating Facility table...");
    await connection.query(`
      CREATE TABLE facility (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        \`desc\` TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create Kos table
    console.log("Creating Kos table...");
    await connection.query(`
      CREATE TABLE kos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        enumGender ENUM('PRIA', 'WANITA', 'MIX') NOT NULL,
        pemilikId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (pemilikId) REFERENCES auth(id)
      )
    `);

    // Create KosFacility table
    console.log("Creating KosFacility table...");
    await connection.query(`
      CREATE TABLE kos_facility (
        id INT AUTO_INCREMENT PRIMARY KEY,
        kosId INT NOT NULL,
        facilityId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (kosId) REFERENCES kos(id) ON DELETE CASCADE,
        FOREIGN KEY (facilityId) REFERENCES facility(id) ON DELETE CASCADE,
        UNIQUE KEY unique_kos_facility (kosId, facilityId)
      )
    `);

    // Create Room table
    console.log("Creating Room table...");
    await connection.query(`
      CREATE TABLE room (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price BIGINT NOT NULL,
        capacity INT NOT NULL,
        enumStatus ENUM('AVAILABLE', 'FULL', 'MAINTENANCE') NOT NULL DEFAULT 'AVAILABLE',
        kosId INT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (kosId) REFERENCES kos(id) ON DELETE CASCADE
      )
    `);

    // Create Rent table
    console.log("Creating Rent table...");
    await connection.query(`
      CREATE TABLE rent (
        id INT AUTO_INCREMENT PRIMARY KEY,
        roomId INT NOT NULL,
        userId INT NOT NULL,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        enumStatus ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (roomId) REFERENCES room(id),
        FOREIGN KEY (userId) REFERENCES auth(id)
      )
    `);

    // Create Payment table
    console.log("Creating Payment table...");
    await connection.query(`
      CREATE TABLE payment (
        id INT AUTO_INCREMENT PRIMARY KEY,
        rentId INT NOT NULL,
        totalPrice BIGINT NOT NULL,
        enumMethod ENUM('CASH', 'TRANSFER', 'E_WALLET', 'BALANCE') NOT NULL,
        enumStatus ENUM('PENDING', 'PAID', 'FAILED') NOT NULL DEFAULT 'PENDING',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (rentId) REFERENCES rent(id)
      )
    `);

    // Create Receipt table
    console.log("Creating Receipt table...");
    await connection.query(`
      CREATE TABLE receipt (
        id INT AUTO_INCREMENT PRIMARY KEY,
        paymentId INT NOT NULL,
        amount BIGINT NOT NULL,
        description TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (paymentId) REFERENCES payment(id) ON DELETE CASCADE
      )
    `);

    console.log("");
    console.log("========================================");
    console.log("Migration completed successfully!");
    console.log("========================================");
    console.log("");
    console.log("Tables created:");
    console.log("  - role");
    console.log("  - auth");
    console.log("  - userprofile");
    console.log("  - ownerprofile");
    console.log("  - refresh_token");
    console.log("  - balance");
    console.log("  - facility");
    console.log("  - kos");
    console.log("  - kos_facility");
    console.log("  - room");
    console.log("  - rent");
    console.log("  - payment");
    console.log("  - receipt");
    console.log("");
    console.log("Now run: node prisma/add-test-data.js");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
