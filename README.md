# AaharShare — Food Donation & Surplus Distribution Platform

A responsive, full-stack MERN web application built for student hackathons that connects restaurants, hotels, caterers, and food providers (Donors) with charitable organizations and NGOs (Recipients) to eliminate food waste and fight hunger.

- 🌐 **Live Frontend Application**: [https://client-wine-tau.vercel.app](https://client-wine-tau.vercel.app)
- ⚙️ **Live Backend API**: [https://server-ten-smoky-53.vercel.app/api](https://server-ten-smoky-53.vercel.app/api)
- 📦 **GitHub Repository**: [https://github.com/yashwanth31-B/BWT.git](https://github.com/yashwanth31-B/BWT.git)

---

## 🌟 Architecture & Key Features

1. **Decoupled MERN Stack Architecture**:
   - **Frontend**: Vite + React 18, React Router v6, Axios, Lucide React, and responsive green-and-white theme.
   - **Backend**: Node.js, Express.js (v5), MongoDB / Mongoose, JWT authentication with RBAC (`donor`, `ngo`, `admin`), bcryptjs password hashing.
2. **Dual Database Mode (Zero-Config Hackathon Resilience)**:
   - **MongoDB Atlas**: Connect effortlessly by adding `MONGODB_URI` to `server/.env`.
   - **In-Memory Fallback Cluster**: If Atlas credentials aren't set, the backend automatically initializes an in-memory MongoDB replica and auto-seeds ready-to-test accounts and listings, guaranteeing a 100% fail-safe demo!
3. **Interactive 4-Digit Pickup Handover OTP**:
   - When a Donor accepts a claim, a 4-digit code (e.g., `4829`) is generated and delivered to the NGO's dashboard.
   - At physical collection, the Donor inputs this code to verify handover and complete the donation.
4. **1-Click Live Persona Switcher**:
   - The top navigation bar includes instant demo buttons (`Donor`, `NGO`, `Admin`) that authenticate directly through the backend API.
5. **Live API Connectivity Indicator**:
   - Real-time "API Online / Offline" status pill displayed in the header.

---

## 🔑 Demo Accounts (Pre-Seeded & Ready)

| Role | Email | Password | Organization |
| :--- | :--- | :--- | :--- |
| **Donor 1** | `grandpalace@donor.com` | `password123` | Grand Palace Hotel & Banquets |
| **Donor 2** | `delightcaterers@donor.com` | `password123` | Royal Delight Caterers |
| **NGO 1** | `helpinghands@ngo.org` | `password123` | Helping Hands Community Foundation |
| **NGO 2** | `feedthecity@ngo.org` | `password123` | Feed The City Relief Care |
| **Admin** | `admin@foodshare.org` | `adminpassword123` | AaharShare Moderation Board |

---

## 🚀 Exact Steps to Run

### Step 1: Backend Setup
```bash
cd server
npm install
npm start       # or npm run dev
```
> The API server runs at **`http://localhost:5000`**.

### Step 2: Frontend Setup
```bash
cd client
npm install
npm run dev
```
> The React client runs at **`http://localhost:5173`**.

### Step 3: Run Tests
```bash
# Backend unit & model verification:
cd server
npm test

# Full End-to-End integration test (registers users, posts food, claims, generates OTP, verifies pickup, tests admin):
node test-integration.js
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
# MongoDB Atlas Connection URI (leave blank to use auto-seeded local memory database)
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/food_donation_db?retryWrites=true&w=majority
JWT_SECRET=super_secret_hackathon_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints Connected

- `POST /api/auth/register` — Donor / NGO registration
- `POST /api/auth/login` — Authentication & JWT issuance
- `GET /api/auth/me` — Authenticated profile verification
- `GET /api/listings` — Public & NGO search with filters (`city`, `foodType`, `dietaryType`, `status`)
- `GET /api/listings/:id` — Single listing details
- `POST /api/listings` — Create surplus food listing (*Donor only*)
- `GET /api/listings/my-listings` — View donor's listings (*Donor only*)
- `POST /api/requests` — Submit donation claim request (*NGO only*)
- `GET /api/requests/donor` — View incoming claims (*Donor only*)
- `GET /api/requests/ngo` — View claimed donations & retrieve pickup OTP (*NGO only*)
- `PATCH /api/requests/:id/accept` — Accept claim & generate 4-digit pickup code (*Donor only*)
- `PATCH /api/requests/:id/reject` — Decline claim (*Donor only*)
- `POST /api/requests/:id/verify-pickup` — Validate 4-digit OTP and complete donation (*Donor only*)
- `GET /api/admin/metrics` — Platform impact analytics (*Admin only*)
- `GET /api/admin/users` — User management directory (*Admin only*)
- `PATCH /api/admin/verify-user/:id` — Verify / revoke NGO credentials (*Admin only*)
- `GET /api/health` — Service health monitor
