const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function addTestData() {
  const pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    database: "sistem_koskosan_db",
    user: "root",
    password: "",
    waitForConnections: true,
    connectionLimit: 10,
  });

  const connection = await pool.getConnection();

  try {
    console.log("Adding test data...");

    const now = new Date();

    // 1. Create Roles
    console.log("Creating roles...");
    await connection.query(
      `INSERT INTO role (name, description, createdAt, updatedAt) VALUES 
      ('Superadmin', 'Super Administrator', ?, ?),
      ('Pemilik', 'Pemilik Kos', ?, ?),
      ('User', 'Penyewa Kos', ?, ?)`,
      [now, now, now, now, now, now],
    );

    // 2. Create Users with hashed passwords
    console.log("Creating users...");
    const hashedPassword = await bcrypt.hash("password123", 10);

    await connection.query(
      `INSERT INTO auth (email, username, password, roleId, createdAt, updatedAt) VALUES 
      (?, ?, ?, 1, ?, ?)`,
      ["superadmin@example.com", "superadmin", hashedPassword, now, now],
    );
    await connection.query(
      `INSERT INTO auth (email, username, password, roleId, createdAt, updatedAt) VALUES 
      (?, ?, ?, 2, ?, ?)`,
      ["pemilik@test.com", "pemilik", hashedPassword, now, now],
    );
    await connection.query(
      `INSERT INTO auth (email, username, password, roleId, createdAt, updatedAt) VALUES 
      (?, ?, ?, 3, ?, ?)`,
      ["testuser@example.com", "testuser", hashedPassword, now, now],
    );

    // 3. Create Balances - More balance for testing
    console.log("Creating balances...");
    await connection.query(
      `INSERT INTO balance (userId, balance, createdAt, updatedAt) VALUES (1, 100000000, ?, ?)`,
      [now, now],
    );
    await connection.query(
      `INSERT INTO balance (userId, balance, createdAt, updatedAt) VALUES (2, 50000000, ?, ?)`,
      [now, now],
    );
    await connection.query(
      `INSERT INTO balance (userId, balance, createdAt, updatedAt) VALUES (3, 50000000, ?, ?)`,
      [now, now],
    );

    // 4. Create Profiles
    console.log("Creating profiles...");
    await connection.query(
      `INSERT INTO userprofile (firstname, lastname, phone, authId, createdAt, updatedAt) VALUES (?, ?, ?, 3, ?, ?)`,
      ["Test", "User", "+6281234567890", now, now],
    );
    await connection.query(
      `INSERT INTO ownerprofile (firstname, lastname, phone, authId, createdAt, updatedAt) VALUES (?, ?, ?, 2, ?, ?)`,
      ["Pemilik", "Kos", "+6289876543210", now, now],
    );
    await connection.query(
      `INSERT INTO ownerprofile (firstname, lastname, phone, authId, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)`,
      ["Super", "Admin", "+6281111111111", now, now],
    );

    // 5. Create Facilities
    console.log("Creating facilities...");
    const facilities = [
      ["WiFi", "Internet broadband"],
      ["AC", "Air conditioner"],
      ["Kamar Mandi Dalam", "Private bathroom"],
      ["TV", "Television"],
      ["Laundry", "Cuci pakaian"],
      ["Parkiran", "Area parkir"],
      ["Dapur", "Dapur bersama"],
    ];
    for (const [name, desc] of facilities) {
      await connection.query(
        `INSERT INTO facility (name, \`desc\`, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
        [name, desc, now, now],
      );
    }

    // 6. Create Kos entries
    console.log("Creating kos entries...");
    await connection.query(
      `INSERT INTO kos (name, address, enumGender, pemilikId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Kos Melati", "Jl. Melati No. 15, Jakarta Selatan", "MIX", 2, now, now],
    );
    await connection.query(
      `INSERT INTO kos (name, address, enumGender, pemilikId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
      ["Kos Mawar", "Jl. Mawar No. 8, Jakarta Barat", "WANITA", 2, now, now],
    );
    await connection.query(
      `INSERT INTO kos (name, address, enumGender, pemilikId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "Kos Sejuk",
        "Jl. Sejuk Raya No. 22, Jakarta Timur",
        "PRIA",
        1,
        now,
        now,
      ],
    );

    // 7. Add facilities to kos
    console.log("Adding facilities to kos...");
    const kosFacilities = [
      [1, 1],
      [1, 2],
      [1, 3],
      [1, 6],
      [2, 1],
      [2, 3],
      [2, 5],
      [3, 1],
      [3, 2],
      [3, 7],
    ];
    for (const [kosId, facilityId] of kosFacilities) {
      await connection.query(
        `INSERT INTO kos_facility (kosId, facilityId, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
        [kosId, facilityId, now, now],
      );
    }

    // 8. Create Rooms - Cheaper prices
    console.log("Creating rooms...");
    const rooms = [
      ["Kamar 101", 500000, 1, "AVAILABLE", 1],
      ["Kamar 102", 600000, 2, "AVAILABLE", 1],
      ["Kamar 103", 700000, 2, "AVAILABLE", 1],
      ["Kamar 201", 800000, 2, "AVAILABLE", 1],
      ["Kamar 202", 900000, 3, "AVAILABLE", 1],
      ["Kamar A1", 450000, 1, "AVAILABLE", 2],
      ["Kamar A2", 450000, 1, "AVAILABLE", 2],
      ["Kamar B1", 550000, 2, "AVAILABLE", 2],
      ["Kamar B2", 550000, 2, "AVAILABLE", 2],
      ["Kamar 001", 400000, 1, "AVAILABLE", 3],
      ["Kamar 002", 400000, 1, "AVAILABLE", 3],
      ["Kamar 003", 500000, 2, "AVAILABLE", 3],
      ["Kamar 004", 500000, 2, "AVAILABLE", 3],
    ];
    for (const [name, price, capacity, enumStatus, kosId] of rooms) {
      await connection.query(
        `INSERT INTO room (name, price, capacity, enumStatus, kosId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [name, price, capacity, enumStatus, kosId, now, now],
      );
    }

    console.log("");
    console.log("========================================");
    console.log("Test data added successfully!");
    console.log("========================================");
    console.log("");
    console.log("Users:");
    console.log(
      "  - Superadmin: superadmin@example.com / password123 (Balance: Rp 100,000,000)",
    );
    console.log(
      "  - Pemilik:    pemilik@test.com / password123 (Balance: Rp 50,000,000)",
    );
    console.log(
      "  - User:       testuser@example.com / password123 (Balance: Rp 50,000,000)",
    );
    console.log("");
    console.log("Kos (3): Kos Melati, Kos Mawar, Kos Sejuk");
    console.log("Rooms: 13 rooms (Rp 400k - 900k)");
    console.log("");
    console.log("Ready for testing!");
  } catch (error) {
    console.error("Error:", error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

addTestData().catch((e) => {
  console.error(e);
  process.exit(1);
});
