# Tugas UTS PPLOS - Sistem Manajemen Kos

**Nama**: Marselia Yura Alinski  
**NIM**: 2410511008  
**Kelas**: A - Informatika

---

## Overview

Sistem manajemen kos adalah aplikasi berbasis microservice yang mengelola data kos, kamar, penyewaan, dan pembayaran. Terdiri dari 3 service yang berkomunikasi melalui API Gateway.

**Video Demo**: [https://youtu.be/example](https://youtu.be/example)

---

## Arsitektur Sistem

```
┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Gateway   │
└─────────────┘     │   (3000)    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   Service 1   │   │   Service 2   │   │   Service 3   │
│     Auth      │   │     User      │   │      Kos      │
│  (Node.js)    │   │    (PHP)      │   │  (Node.js)    │
│   Port 3001   │   │   Port 3003   │   │   Port 3002   │
└───────────────┘   └───────────────┘   └───────────────┘
```

---

## Mengapa Dipisah Menjadi 3 Services?

Sistem ini menggunakan arsitektur **Microservices** dengan pemisahan berdasarkan tanggung jawab bisnis (*business domain*) yang berbeda:

### 1. Service Separation by Domain

| Service | Domain | Responsibilities |
|---------|--------|------------------|
| **Auth Service** | Authentication & Authorization | Login, register, JWT token management, role verification |
| **User Service** | User & Profile Management | User profiles, owner profiles, role management |
| **Kos Service** | Business Logic | Kos, rooms, rentals, payments, balances |

### 2. Technology Diversity

Setiap service menggunakan teknologi yang berbeda sesuai kebutuhan:

- **Auth & Kos Services**: Node.js + Express.js (menggunakan JWT, async operations)
- **User Service**: PHP (menunjukkan kemampuan multi-language microservices)

### 3. Benefits

| Benefit | Description |
|---------|-------------|
| **Scalability** | Setiap service bisa di-scale secara independen |
| **Maintainability** | Setiap tim bisa mengerjakan service berbeda tanpa konflik |
| **Fault Isolation** | Error di satu service tidak mempengaruhi service lain |
| **Technology Flexibility** |Setiap service bisa menggunakan teknologi berbeda sesuai kebutuhan |
| **Deployment Independence** | Setiap service bisa di-deploy secara terpisah |

---

## Services

### Service 1: Auth Service (Port 3001)
**Tech Stack**: Node.js + Express.js  
**Path**: `services/auth/`

Authentication dan Authorization service menggunakan JWT.

**Endpoints:**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/register-user` | Register user baru | ❌ |
| POST | `/register-pemilik` | Register pemilik kos | ❌ |
| POST | `/login` | Login user | ❌ |
| POST | `/refresh` | Refresh access token | ❌ |
| POST | `/logout` | Logout user | ❌ |
| POST | `/logout-all` | Logout semua device | ✅ |
| GET | `/me` | Get current user | ✅ |
| POST | `/register-user/oauth/google` | Register via Google (User) | ❌ |
| POST | `/register-pemilik/oauth/google` | Register via Google (Pemilik) | ❌ |

**Default Users (after seeding):**
- Superadmin: `superadmin@example.com` / `password123`
- Pemilik: `pemilik@test.com` / `password123`
- User: `testuser@example.com` / `password123`

---

### Service 2: User Service (Port 3003)
**Tech Stack**: PHP  
**Path**: `services/service1-userservice/`

Manages user profiles dan owner profiles.

**Endpoints - Roles Module (`/api/role`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all roles |
| POST | `/` | Create new role |
| GET | `/:id` | Get role by ID |
| PUT | `/:id` | Update role |
| DELETE | `/:id` | Delete role |

**Endpoints - User Profile Module (`/api/profile`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all user profiles |
| POST | `/` | Create new user profile |
| GET | `/:id` | Get user profile by ID |
| PUT | `/:id` | Update user profile |
| DELETE | `/:id` | Delete user profile |

**Endpoints - Owner Profile Module (`/api/ownerprofile`):**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | List all owner profiles |
| POST | `/` | Create new owner profile |
| GET | `/:id` | Get owner profile by ID |
| PUT | `/:id` | Update owner profile |
| DELETE | `/:id` | Delete owner profile |

---

### Service 3: Kos Service (Port 3002)
**Tech Stack**: Node.js + Express.js  
**Path**: `services/service2-kosservice/`

Manages kos, rooms, balances, rents, dan payments.

**Endpoints - Kos Module (`/kos`):**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all kos | ❌ |
| GET | `/my` | List kos milik sendiri | ✅ |
| GET | `/:id` | Get kos by ID | ❌ |
| POST | `/` | Create new kos | ✅ |
| PUT | `/:id` | Update kos | ✅ |
| DELETE | `/:id` | Delete kos | ✅ |

**Endpoints - Room Module (`/room`):**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all rooms | ❌ |
| GET | `/:id` | Get room by ID | ❌ |
| POST | `/` | Create new room | ✅ |
| PUT | `/:id` | Update room | ✅ |
| DELETE | `/:id` | Delete room | ✅ |

**Endpoints - Balance Module (`/balance`):**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | List all balances | ✅ |
| GET | `/me` | Get my balance | ✅ |
| GET | `/user/:userId` | Get balance by user ID | ✅ |
| PUT | `/user/:userId` | Update user balance | ✅ |

**Endpoints - Rent Module (`/rent`):**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/my` | Get my rentals | ✅ |
| GET | `/:id` | Get rent by ID | ✅ |
| POST | `/` | Create new rent | ✅ |
| PUT | `/:id/cancel` | Cancel rent | ✅ |
| PUT | `/:id/complete` | Complete rent | ✅ |

**Endpoints - Payment Module (`/payment`):**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/my` | Get my payments | ✅ |
| GET | `/:id` | Get payment by ID | ✅ |
| POST | `/` | Create new payment | ✅ |
| PUT | `/:id/pay` | Process payment | ✅ |

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

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   cd services/service1-userservice && composer install
   ```

2. **Setup database**:
   ```bash
   npm run db:reset
   ```

### Scripts (package.json)

| Script | Description |
|--------|-------------|
| `npm start` | Start API Gateway (port 3000) |
| `npm run start-auth` | Start Auth Service (port 3001) |
| `npm run start-user` | Start User Service (port 3003) |
| `npm run start-kos` | Start Kos Service (port 3002) |
| `npm run dev` | Start all services concurrently |
| `npm run start-dev` | Start gateway with nodemon |
| `npm run start-auth-dev` | Start auth with nodemon |
| `npm run start-user-dev` | Start user service with nodemon |
| `npm run start-kos-dev` | Start kos service with nodemon |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Add test data to database |
| `npm run db:reset` | Reset database (migrate + seed) |

### Running Services

**Option 1: Start all services:**
```bash
npm run dev
```

**Option 2: Start individually:**
```bash
npm run start-auth    # Port 3001
npm run start-kos     # Port 3002
npm run start-user    # Port 3003
npm start             # Gateway - Port 3000
```

### Default Ports
- Gateway: 3000
- Auth Service: 3001
- Kos Service: 3002
- User Service: 3003

---

## API Usage Example

### Login
```bash
curl -X POST http://localhost:3001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pemilik@test.com","password":"password123"}'
```

### Get My Kos (with token)
```bash
curl http://localhost:3002/kos/my \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create New Kos
```bash
curl -X POST http://localhost:3002/kos \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Kos Baru","address":"Jl. Baru No.1","gender":"PRIA"}'
```

### Get User Profiles (PHP Service)
```bash
curl http://localhost:3003/api/profile
```

---

## Technology Stack

- **Backend**: Node.js, Express.js, PHP
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Architecture**: REST API Microservices