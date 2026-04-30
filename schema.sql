-- =========================================
-- DATABASE
-- mysql -u root -p < schema.sql
-- =========================================
CREATE DATABASE IF NOT EXISTS sistem_koskosan_db;
USE sistem_koskosan_db;

-- =========================================
-- ROLE
-- =========================================
CREATE TABLE Role (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- AUTH
-- =========================================
CREATE TABLE Auth (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    username VARCHAR(191) NOT NULL UNIQUE,
    password VARCHAR(191),
    oauthProvider VARCHAR(50),
    oauthSubject VARCHAR(191),
    avatarUrl VARCHAR(255),

    roleId INT NOT NULL,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_oauth (oauthProvider, oauthSubject),

    CONSTRAINT fk_auth_role FOREIGN KEY (roleId) REFERENCES Role(id)
);

-- =========================================
-- REFRESH TOKEN
-- =========================================
CREATE TABLE RefreshToken (
    id INT AUTO_INCREMENT PRIMARY KEY,
    authId INT NOT NULL,
    tokenHash VARCHAR(255) NOT NULL UNIQUE,
    userAgent VARCHAR(255),
    ipAddress VARCHAR(100),
    expiresAt DATETIME NOT NULL,
    revokedAt DATETIME,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_authId (authId),
    CONSTRAINT fk_refresh_auth FOREIGN KEY (authId) REFERENCES Auth(id)
);

-- =========================================
-- USER PROFILE
-- =========================================
CREATE TABLE UserProfile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    phone VARCHAR(50),
    pictures VARCHAR(255),

    authId INT UNIQUE,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_auth FOREIGN KEY (authId) REFERENCES Auth(id)
);

-- =========================================
-- OWNER PROFILE
-- =========================================
CREATE TABLE OwnerProfile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    phone VARCHAR(50),
    pictures VARCHAR(255),

    authId INT UNIQUE,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_owner_auth FOREIGN KEY (authId) REFERENCES Auth(id)
);

-- =========================================
-- KOS
-- =========================================
CREATE TABLE Kos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191),
    address VARCHAR(255),
    gender ENUM('PRIA','WANITA','MIX'),

    pemilikId INT NOT NULL,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_kos_owner FOREIGN KEY (pemilikId) REFERENCES Auth(id)
);

-- =========================================
-- ROOM
-- =========================================
CREATE TABLE Room (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191),
    price INT,
    capacity INT,
    status ENUM('AVAILABLE','FULL','MAINTENANCE'),

    kosId INT NOT NULL,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_room_kos FOREIGN KEY (kosId) REFERENCES Kos(id)
);

-- =========================================
-- FACILITY
-- =========================================
CREATE TABLE Facility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(191),
    `desc` VARCHAR(255),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =========================================
-- KOS FACILITY (MANY TO MANY)
-- =========================================
CREATE TABLE KosFacility (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kosId INT,
    facilityId INT,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY unique_kos_facility (kosId, facilityId),

    CONSTRAINT fk_kf_kos FOREIGN KEY (kosId) REFERENCES Kos(id),
    CONSTRAINT fk_kf_facility FOREIGN KEY (facilityId) REFERENCES Facility(id)
);

-- =========================================
-- RENT
-- =========================================
CREATE TABLE Rent (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roomId INT,
    userId INT,

    startDate DATETIME,
    endDate DATETIME,
    status ENUM('ACTIVE','COMPLETED','CANCELLED'),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_rent_room FOREIGN KEY (roomId) REFERENCES Room(id),
    CONSTRAINT fk_rent_user FOREIGN KEY (userId) REFERENCES Auth(id)
);

-- =========================================
-- BALANCE
-- =========================================
CREATE TABLE Balance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT UNIQUE,
    balance INT,

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_balance_user FOREIGN KEY (userId) REFERENCES Auth(id)
);

-- =========================================
-- PAYMENT
-- =========================================
CREATE TABLE Payment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rentId INT,
    totalPrice INT,

    paymentMethod ENUM('CASH','TRANSFER','E_WALLET','BALANCE'),
    status ENUM('PENDING','PAID','FAILED'),

    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_payment_rent FOREIGN KEY (rentId) REFERENCES Rent(id)
);

-- =========================================
-- INSERT ROLE DATA
-- =========================================
INSERT INTO Role (name, description) VALUES
('USER', 'User biasa'),
('OWNER', 'Pemilik kos'),
('SUPER_ADMIN', 'Admin sistem');