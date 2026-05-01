# Tugas UTS PPLOS - Sistem Manajemen Kos

**Nama**: Marselia Yura Alinski  
**NIM**: 2410511008  
**Kelas**: A - Informatika

---

## Demo Video

## Silakanonton video demo sistem di: [YouTube Demo Video](https://youtube.com/watch?v=EXAMPLE_LINK)

---

## Overview

Sistem manajemen kos adalah aplikasi berbasis microservice yang mengelola data kos, kamar, penyewaan, dan pembayaran. Terdiri dari 3 service yang berkomunikasi melalui API Gateway.

---

## Arsitektur Sistem

```
┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Gateway   │
└─────────────┘     │   (3000)    │
                    └──────┬──────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   /service1   │   │   /service2   │   │   /service3   │
│  Auth Service │   │  User Service │   │   Kos Service │
│   (Node.js)   │   │     (PHP)     │   │   (Node.js)   │
│   Port 3001   │   │   Port 3002   │   │   Port 3003   │
└───────────────┘   └───────────────┘   └───────────────┘
```

### Access Through Gateway

| Service      | Gateway Path  | Direct Port | Description              |
| ------------ | ------------- | ----------- | ------------------------ |
| Auth Service | `/service1/*` | 3001        | Authentication & JWT     |
| User Service | `/service2/*` | 3002        | User profiles (PHP)      |
| Kos Service  | `/service3/*` | 3003        | Business logic (Node.js) |

---

## Default Test Data (After Seeding)

| Role           | Email                  | Password    | Balance        |
| -------------- | ---------------------- | ----------- | -------------- |
| Superadmin     | superadmin@example.com | password123 | Rp 100,000,000 |
| Pemilik        | pemilik@test.com       | password123 | Rp 50,000,000  |
| User (Penyewa) | testuser@example.com   | password123 | Rp 50,000,000  |

**Kos Available:**

- Kos Melati (Jakarta Selatan, MIX)
- Kos Mawar (Jakarta Barat, WANITA)
- Kos Sejuk (Jakarta Timur, PRIA)

**Rooms:** 13 rooms with prices Rp 400,000 - Rp 900,000

---

## API Endpoints

### 1. AUTH SERVICE (Gateway: `/service1`)

#### Authentication - Email/Password

| Method | Endpoint                     | Description                  | Auth |
| ------ | ---------------------------- | ---------------------------- | ---- |
| POST   | `/service1/register-user`    | Register user baru (Penyewa) | ❌   |
| POST   | `/service1/register-pemilik` | Register pemilik kos         | ❌   |
| POST   | `/service1/login`            | Login user                   | ❌   |
| POST   | `/service1/refresh`          | Refresh access token         | ❌   |
| POST   | `/service1/logout`           | Logout user                  | ❌   |
| POST   | `/service1/logout-all`       | Logout semua device          | ✅   |
| GET    | `/service1/me`               | Get current user             | ✅   |

#### Authentication - Google OAuth

| Method | Endpoint                                  | Description                          | Auth |
| ------ | ----------------------------------------- | ------------------------------------ | ---- |
| GET    | `/service1/google/user`                   | Get Google OAuth URL (User/Penyewa)  | ❌   |
| GET    | `/service1/google/pemilik`                | Get Google OAuth URL (Pemilik)       | ❌   |
| GET    | `/service1/callback/user`                 | OAuth callback (User)                | ❌   |
| GET    | `/service1/callback/pemilik`              | OAuth callback (Pemilik)             | ❌   |
| POST   | `/service1/register-user/oauth/google`    | Register user via Google ID Token    | ❌   |
| POST   | `/service1/register-pemilik/oauth/google` | Register pemilik via Google ID Token | ❌   |

---

### 2. USER SERVICE (Gateway: `/service2/api`)

#### Roles Module (`/role`)

| Method | Endpoint                 | Description                         | Auth |
| ------ | ------------------------ | ----------------------------------- | ---- |
| GET    | `/service2/api/role`     | List all roles (with pagination)    | ✅   |
| POST   | `/service2/api/role`     | Create new role (name, description) | ✅   |
| GET    | `/service2/api/role/:id` | Get role by ID                      | ✅   |
| PUT    | `/service2/api/role/:id` | Update role (name, description)     | ✅   |
| DELETE | `/service2/api/role/:id` | Delete role                         | ✅   |

#### User Profile Module (`/profile`)

| Method | Endpoint                    | Description                                                        | Auth |
| ------ | --------------------------- | ------------------------------------------------------------------ | ---- |
| GET    | `/service2/api/profile`     | List all user profiles (with pagination)                           | ✅   |
| POST   | `/service2/api/profile`     | Create user profile (firstname, lastname, authId, phone, pictures) | ✅   |
| GET    | `/service2/api/profile/:id` | Get user profile by ID                                             | ✅   |
| PUT    | `/service2/api/profile/:id` | Update user profile (firstname, lastname, phone, pictures)         | ✅   |
| DELETE | `/service2/api/profile/:id` | Delete user profile                                                | ✅   |

**Profile User Fields:**

- `firstname`: Nama depan (required)
- `lastname`: Nama belakang (required)
- `authId`: ID user dari tabel auth (required)
- `phone`: Nomor telepon (optional)
- `pictures`: URL gambar/avatar (optional)

#### Owner Profile Module (`/ownerprofile`)

| Method | Endpoint                         | Description                                                         | Auth |
| ------ | -------------------------------- | ------------------------------------------------------------------- | ---- |
| GET    | `/service2/api/ownerprofile`     | List all owner profiles (with pagination)                           | ✅   |
| POST   | `/service2/api/ownerprofile`     | Create owner profile (firstname, lastname, authId, phone, pictures) | ✅   |
| GET    | `/service2/api/ownerprofile/:id` | Get owner profile by ID                                             | ✅   |
| PUT    | `/service2/api/ownerprofile/:id` | Update owner profile (firstname, lastname, phone, pictures)         | ✅   |
| DELETE | `/service2/api/ownerprofile/:id` | Delete owner profile                                                | ✅   |

**Owner Profile Fields:**

- `firstname`: Nama depan (required)
- `lastname`: Nama belakang (required)
- `authId`: ID user dari tabel auth (required)
- `phone`: Nomor telepon (optional)
- `pictures`: URL gambar/avatar (optional)

---

### 3. KOS SERVICE (Gateway: `/service3`)

#### Kos Module (`/kos`)

| Method | Endpoint            | Description                    | Auth            |
| ------ | ------------------- | ------------------------------ | --------------- |
| GET    | `/service3/kos`     | List all kos (with pagination) | ❌              |
| GET    | `/service3/kos/my`  | List kos milik sendiri         | ✅              |
| GET    | `/service3/kos/:id` | Get kos by ID                  | ❌              |
| POST   | `/service3/kos`     | Create new kos                 | ✅ (Pemilik)    |
| PUT    | `/service3/kos/:id` | Update kos                     | ✅ (Pemilik)    |
| DELETE | `/service3/kos/:id` | Delete kos                     | ✅ (Superadmin) |

#### Room Module (`/room`)

| Method | Endpoint             | Description                      | Auth         |
| ------ | -------------------- | -------------------------------- | ------------ |
| GET    | `/service3/room`     | List all rooms (with pagination) | ❌           |
| GET    | `/service3/room/:id` | Get room by ID                   | ❌           |
| POST   | `/service3/room`     | Create new room                  | ✅ (Pemilik) |
| PUT    | `/service3/room/:id` | Update room                      | ✅ (Pemilik) |
| DELETE | `/service3/room/:id` | Delete room                      | ✅ (Pemilik) |

#### Balance Module (`/balance`)

| Method | Endpoint                         | Description                    | Auth            |
| ------ | -------------------------------- | ------------------------------ | --------------- |
| GET    | `/service3/balance`              | List all balances (Superadmin) | ✅              |
| GET    | `/service3/balance/me`           | Get my balance                 | ✅              |
| GET    | `/service3/balance/user/:userId` | Get balance by user ID         | ✅              |
| PUT    | `/service3/balance/user/:userId` | Update user balance            | ✅ (Superadmin) |

#### Rent Module (`/rent`)

| Method | Endpoint                      | Description     | Auth            |
| ------ | ----------------------------- | --------------- | --------------- |
| GET    | `/service3/rent/my`           | Get my rentals  | ✅              |
| GET    | `/service3/rent/:id`          | Get rent by ID  | ✅              |
| POST   | `/service3/rent`              | Create new rent | ✅              |
| PUT    | `/service3/rent/:id/cancel`   | Cancel rent     | ✅              |
| PUT    | `/service3/rent/:id/complete` | Complete rent   | ✅ (Superadmin) |

#### Payment Module (`/payment`)

| Method | Endpoint                    | Description        | Auth |
| ------ | --------------------------- | ------------------ | ---- |
| GET    | `/service3/payment/my`      | Get my payments    | ✅   |
| GET    | `/service3/payment/:id`     | Get payment by ID  | ✅   |
| POST   | `/service3/payment`         | Create new payment | ✅   |
| PUT    | `/service3/payment/:id/pay` | Process payment    | ✅   |

#### Receipt Module (`/receipt`)

| Method | Endpoint                         | Description                         | Auth            |
| ------ | -------------------------------- | ----------------------------------- | --------------- |
| GET    | `/service3/receipt`              | List all receipts (with pagination) | ✅              |
| GET    | `/service3/receipt/my`           | Get my receipts                     | ✅              |
| GET    | `/service3/receipt/user/:userId` | Get receipts by user ID             | ✅ (Superadmin) |
| GET    | `/service3/receipt/:id`          | Get receipt by ID                   | ✅              |
| POST   | `/service3/receipt`              | Create new receipt                  | ✅ (Superadmin) |
| PUT    | `/service3/receipt/:id`          | Update receipt                      | ✅ (Superadmin) |
| DELETE | `/service3/receipt/:id`          | Delete receipt                      | ✅ (Superadmin) |

---

## Database Schema

### Tables:

- `role` - User roles (Superadmin, Pemilik, User)
- `auth` - User authentication data
- `userprofile` - User profile information
- `ownerprofile` - Pemilik profile information
- `refreshtoken` - Refresh token sessions
- `balance` - User balance/wallet
- `facility` - Facility master data
- `kos` - Kos data
- `kos_facility` - Kos facilities junction
- `room` - Room data within kos
- `rent` - Rental transactions
- `payment` - Payment transactions
- `receipt` - Payment receipts

---

## Setup

### Prerequisites

- Node.js (v14+)
- PHP (v8.0+)
- MySQL (v8.0+)
- Composer (for PHP dependencies)

### Installation Steps

#### Step 1: Clone & Install Dependencies

```bash
# Clone repository
git clone https://github.com/your-repo/uts-pplos-a-2410511008.git
cd uts-pplos-a-2410511008

# Install Node.js dependencies
npm install
```

```bash
# Install PHP dependencies
cd services/service1-userservice
composer install
cd ../..
```

#### Step 2: Setup MySQL Database

Buka terminal/MySQL Workbench, lalu jalankan:

```sql
CREATE DATABASE sistem_koskosan_db;
```

#### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit file `.env` sesuaikan dengan credentials Anda:

```
DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=sistem_koskosan_db
DB_USERNAME=root        # sesuaikan
DB_PASSWORD=             # kosongkan jika tidak ada password

JWT_SECRET=your-secret-key
```

#### Step 4: Run Database Migration (Buat Tabel)

```bash
npm run db:migrate
```

Jika berhasil, output akan menampilkan daftar tabel yang dibuat:
- auth
- role
- userprofile
- ownerprofile
- refreshtoken
- balance
- facility
- kos
- kos_facility
- room
- rent
- payment
- receipt

#### Step 5: Add Test Data (Optional)

```bash
npm run db:seed
```

Ini akan membuat user test:
| Role | Email | Password |
|------|-------|----------|
| Superadmin | superadmin@example.com | password123 |
| Pemilik | pemilik@test.com | password123 |
| User | testuser@example.com | password123 |

#### Step 6: Start Services

```bash
npm run dev
```

Tunggu hingga semua service running:

```
[0] API Gateway is running on port 3000
[1] Service 1 (Auth Service) is running on port 3001
[2] PHP User Service running at http://0.0.0.0:3002
[3] Service 2 (Kos Service) is running on port 3003
```

#### Step 7: Test API

Buka terminal baru, lalu test endpoint:

```bash
# Test login
curl -X POST http://localhost:3000/service1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}'

# Atau buka di browser
http://localhost:3000/service3/kos
```

---

## Jika Terjadi Error

### Port sudah digunakan
```bash
# Cari process yang menggunakan port
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :3003

# Kill process
lsof -ti:3000 | xargs kill -9
```

### Database error
```bash
# Pastikan MySQL running
mysql.server start   # macOS
sudo systemctl start mysql   # Linux
```

### Reset database
```bash
npm run db:reset
```

---

## Cara Menggunakan API

### 1. Login untuk mendapatkan Access Token

```bash
curl -X POST http://localhost:3000/service1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}'
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1...",
    "refreshToken": "eyJhbGciOiJIUzI1...",
    "user": {...}
  }
}
```

### 2. Menggunakan Access Token

```bash
# Get all KOS
curl http://localhost:3000/service3/kos \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get my balance
curl http://localhost:3000/service3/balance/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Import ke Postman

1. Buka Postman
2. Import file `postman/POSTMAN_COLLECTION.json`
3. Buat environment dengan variable:
   - `base_url`: `http://localhost:3000`
   - `access_token`: `<token dari login>`
   - `refresh_token`: `<token dari login>`
4. Semua request akan otomatis menggunakan token jika sudah login di Postman

---

## Troubleshooting

### Port already in use
```bash
# Kill process on port
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
lsof -ti:3002 | xargs kill -9
lsof -ti:3003 | xargs kill -9
```

### Database connection error
- Pastikan MySQL running: `mysql.server start` (macOS) atau `sudo systemctl start mysql` (Linux)
- Cek credentials di file `.env`

### Clear database and reseed
```bash
npm run db:reset
```

### Scripts (package.json)

| Script               | Description                     |
| -------------------- | ------------------------------- |
| `npm start`          | Start API Gateway (port 3000)   |
| `npm run start-auth` | Start Auth Service (port 3001)  |
| `npm run start-user` | Start User Service (port 3002)  |
| `npm run start-kos`  | Start Kos Service (port 3003)   |
| `npm run dev`        | Start all services concurrently |
| `npm run db:migrate` | Run database migrations         |
| `npm run db:seed`    | Add test data to database       |
| `npm run db:reset`   | Reset database (migrate + seed) |

### Default Ports

- Gateway: 3000
- Auth Service: 3001
- User Service (PHP): 3002
- Kos Service: 3003

---

## API Usage Example

### Login (through gateway)

```bash
curl -X POST http://localhost:3000/service1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@example.com","password":"password123"}'
```

### Get My Kos (with token)

```bash
curl http://localhost:3000/service3/kos/my \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Get User Profiles (PHP Service)

```bash
curl http://localhost:3000/service2/api/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Technology Stack

- **Backend**: Node.js, Express.js, PHP
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token), Google OAuth
- **Architecture**: REST API Microservices
- **API Gateway**: http-proxy-middleware

---

## Postman Collection

Import file `POSTMAN_COLLECTION.json` ke Postman untuk testing lengkap semua endpoint.

**Collection Structure:**

1. **Auth Service** - Email/Password & Google OAuth authentication
2. **User Service** - CRUD Profile User, Owner Profile, Roles
3. **Kos Service** - CRUD Kos, Room, Balance, Rent, Payment, Receipt
4. **Demo Admin Flow** - Complete admin operations (Email/Password)
5. **Demo User Order Flow** - Complete user booking flow (Email/Password)
6. **Demo Google OAuth Flow** - OAuth login & register demonstration