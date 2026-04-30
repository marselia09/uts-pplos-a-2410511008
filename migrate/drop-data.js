const mysql = require('mysql2/promise');

async function dropAllData() {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    database: 'sistem_koskosan_db',
    user: 'root',
    password: '',
    waitForConnections: true,
    connectionLimit: 10,
  });

  const connection = await pool.getConnection();
  
  try {
    console.log('Dropping all data from database...');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    await connection.query('TRUNCATE TABLE receipt');
    await connection.query('TRUNCATE TABLE Payment');
    await connection.query('TRUNCATE TABLE Rent');
    await connection.query('TRUNCATE TABLE Room');
    await connection.query('TRUNCATE TABLE KosFacility');
    await connection.query('TRUNCATE TABLE Facility');
    await connection.query('TRUNCATE TABLE Kos');
    await connection.query('TRUNCATE TABLE Balance');
    await connection.query('TRUNCATE TABLE OwnerProfile');
    await connection.query('TRUNCATE TABLE UserProfile');
    await connection.query('TRUNCATE TABLE RefreshToken');
    await connection.query('TRUNCATE TABLE Auth');
    await connection.query('TRUNCATE TABLE Role');
    
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('All data dropped successfully!');
    console.log('');
    console.log('Database is now empty. You can start fresh:');
    console.log('1. Register a Pemilik -> Create Kos -> Create Rooms');
    console.log('2. Register a User -> Browse Kos -> Rent Room -> Make Payment');
    console.log('');
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

dropAllData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });