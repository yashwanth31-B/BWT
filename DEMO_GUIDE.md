# AaharShare — Hackathon Demo Guide & Pitch Script

> **Problem Statement**: Build a web application connecting restaurants, hotels, and caterers with charitable NGOs to reduce food wastage and streamline surplus food redistribution.

- 🌐 **Live Frontend Application**: [https://client-wine-tau.vercel.app](https://client-wine-tau.vercel.app)
- ⚙️ **Live Backend API**: [https://server-ten-smoky-53.vercel.app/api](https://server-ten-smoky-53.vercel.app/api)
- 📦 **GitHub Repository**: [https://github.com/yashwanth31-B/BWT.git](https://github.com/yashwanth31-B/BWT.git)

---

## 1. Project Overview & Technology Stack

**AaharShare** is a full-stack MERN web application built specifically for student hackathons. It eliminates food waste by providing restaurants, banquets, and caterers with a real-time donation dispatch workflow, while giving verified charitable NGOs instant visibility into surplus meals with an interactive 4-digit pickup handover verification system.

- **Frontend**: Vite + React 18, React Router v6, Axios, Lucide React icons, Responsive CSS Design System (Green & White palette).
- **Backend**: Node.js, Express.js (v5), Mongoose ODM, JWT Authentication with RBAC (`donor`, `ngo`, `admin`), bcrypt password hashing (salt 10).
- **Database**: MongoDB Atlas cloud cluster (with automatic local in-memory fallback cluster for zero-fail hackathon resilience).

---

## 2. Exact Commands to Run

### Start Backend Server
```powershell
cd "C:\Users\yashwanthteja\Desktop\bwt internal\server"
npm start
```
*Backend runs on: **`http://localhost:5000`***

### Start Frontend Client
```powershell
cd "C:\Users\yashwanthteja\Desktop\bwt internal\client"
npm run dev
```
*Frontend runs on: **`http://localhost:5173`***

---

## 3. Pre-Configured Demo Credentials

Use the **1-Click Demo Buttons** (`Donor | NGO | Admin`) in the top navigation bar, or enter these credentials manually:

| Persona | Organization Name | Email | Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Donor 1** | Grand Palace Hotel & Banquets | `grandpalace@donor.com` | `password123` | `donor` |
| **Donor 2** | Royal Delight Caterers | `delightcaterers@donor.com` | `password123` | `donor` |
| **NGO 1** | Helping Hands Community Foundation | `helpinghands@ngo.org` | `password123` | `ngo` |
| **NGO 2** | Feed The City Relief Care | `feedthecity@ngo.org` | `password123` | `ngo` |
| **Admin** | AaharShare Moderation Board | `admin@foodshare.org` | `adminpassword123` | `admin` |

---

## 4. 3–5 Minute Live Hackathon Demo Script (Judges Flow)

### Step 1: Opening & The Problem Statement (30 seconds)
1. Open the landing page: **`http://localhost:5173`**.
2. **What to say**:
   > *"Good morning judges. Every night, banquet halls and restaurants discard hundreds of fresh, nutritious meals simply because they lack an immediate, verified logistics bridge to shelters. AaharShare connects food donors with verified charities in real time."*
3. **What to show**:
   - The headline *"Bridge Surplus Food to Those Who Need It Most"*.
   - The live impact counters (*Meals Rescued, Active Donors, Partner NGOs*).
   - The 4-step workflow sequence (*Donor Posts → NGO Claims → Donor Accepts → OTP Handover*).
   - The **"API Online"** status indicator in the header confirming live database connectivity.

---

### Step 2: Donor Experience — Post Surplus Food (45 seconds)
1. Click **Demo: Donor** button in the header (or log in as `grandpalace@donor.com`).
2. Redirects directly to the **Donor Dashboard**. Show the 4 metric cards (*Total Donations, Active Listings, Pending Claims, Completed Pickups*).
3. Click **"Donate Food"** (or navigate to `/add-listing`).
4. Fill in a quick realistic listing:
   - **Food Title**: `Vegetarian Dinner Buffet (Jeera Pulao, Paneer Curry, Roti)`
   - **Category**: `Cooked Meals`
   - **Dietary Type**: `Veg`
   - **Quantity**: `60 servings`
   - **Safe Use-By Window**: `Within 4 Hours (Standard Buffet)`
   - **Pickup City**: `Bangalore`
   - **Contact Phone**: `+91 9811122233`
   - **Notes**: `Stored under warmers in clean stainless steel containers.`
5. Click **"Publish Food Donation"**.
6. **Expected Result**: Success banner appears; listing is instantly published and displayed under "My Food Listings".

---

### Step 3: NGO Experience — Discover & Claim Food (45 seconds)
1. Click **Demo: NGO** button in the header (or open an Incognito tab / sign in as `helpinghands@ngo.org`).
2. Navigate to **"Available Food"** (`/available-food`).
3. **What to show**:
   - The newly posted listing from Grand Palace Hotel appears at the top of the live community feed.
   - Filter by `Veg` or `Cooked Meals` to demonstrate real-time client-side search.
4. Click **"Claim Food"** on the card.
5. In the Request Modal:
   - Select Arrival ETA: `30 - 45 minutes`.
   - Add Volunteer Note: `Volunteer team arriving in white insulated van.`
   - Click **"Send Request"**.
6. **Expected Result**: Green toast notification confirms request sent. Navigate to **"My Requests"** (`/my-requests`) showing status as **"Pending Approval"**.

---

### Step 4: Donor Accepts Claim & Generates 4-Digit Pickup OTP (45 seconds)
1. Switch back to **Donor** persona (Click **Demo: Donor**).
2. Go to the **Donor Dashboard** (`/donor`).
3. Under the **"Incoming NGO Claims"** tab, notice the new pending request from *Helping Hands Community Foundation*.
4. Click **"Accept"**.
5. **Expected Result**:
   - The listing status changes to **"Reserved"**.
   - The backend atomically generates a unique random **4-digit numeric OTP** (e.g., `5821`).
   - The action button transforms into a green **"Verify Handover OTP"** button.

---

### Step 5: Secure Handover Verification (45 seconds)
1. Switch to **NGO** persona (Click **Demo: NGO**).
2. Go to **"My Requests"** (`/my-requests`).
3. **What to show**:
   - Status has transitioned to **"Accepted / Ready"**.
   - Highlight the prominent green dashed box: **`Pickup Verification Code: [ 4-Digit OTP ]`** with the instruction *"Present to donor at handover"*.
4. Switch to **Donor** persona (Click **Demo: Donor**).
5. Click **"Verify Handover OTP"** on the claim.
6. In the modal:
   - Enter an incorrect code (e.g., `0000`) and click Confirm → Show that invalid OTP is rejected with clear error feedback.
   - Enter the correct 4-digit code and click Confirm.
7. **Expected Result**:
   - Modal closes with a celebration banner: *"🎉 Pickup verified successfully! Food donation marked as completed."*
   - Status transitions to **"Completed"**.

---

### Step 6: Platform Impact & Admin Moderation (30 seconds)
1. Switch to **Admin** persona (Click **Demo: Admin**).
2. Go to **Admin Panel** (`/admin`).
3. **What to show**:
   - Aggregated platform metrics: Total Meals Saved, Total Active Listings, Completed Handover Claims.
   - Show the **User Management Directory**.
   - Demonstrate the **"Verify Organization"** toggle for unverified NGOs (e.g. *Feed The City Relief Care*), showing real-time administrative trust badge updates.
4. Conclude presentation with the food safety & inspection notice at the bottom of the footer.

---

## 5. Troubleshooting & Demo Recovery Guide

| Scenario | Potential Cause | Instant Recovery Action |
| :--- | :--- | :--- |
| **"API Offline" badge appears in header** | Backend server is not running | Run `node server.js` inside `server/` directory. Check port 5000 is not blocked. |
| **Wrong credentials error on manual login** | Typing typo | Use the **Demo buttons** in the navbar to log in with 1 click. |
| **Duplicate claim error when clicking "Claim"** | NGO already requested this listing | Select a different available listing or log in as a second NGO (`feedthecity@ngo.org`). |
| **Handover modal shows "Invalid code"** | Typo in the 4-digit OTP | Switch to the NGO's **"My Requests"** tab to read the exact 4-digit code. |
| **Port 5000 / 5173 busy** | Previous process still open | Run `taskkill /F /IM node.exe` in PowerShell, then restart `npm start` and `npm run dev`. |

---

## 6. Known Limitations (What to tell judges if asked)

1. **SMS/WhatsApp Notifications**: In this prototype, communication occurs via the web interface and pickup codes. In production, Twilio SMS or WhatsApp webhooks would be added to notify drivers.
2. **Geographical Coordinates**: Physical addresses and cities are currently used for discovery. Integrating GPS radius search with Google Maps/Mapbox is planned for the post-hackathon phase.
3. **Food Safety Responsibility**: AaharShare operates as a matching and dispatch platform. Receiving charities are required to perform visual and thermal inspections before distributing food.
