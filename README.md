# HealthConnect - Digital Healthcare Management Platform

HealthConnect is a comprehensive MERN (MongoDB, Express.js, React.js, Node.js) web application that helps patients manage their complete healthcare journey. The platform supports three user roles: **Patient**, **Doctor**, and **Admin**.

---

## Features Matrix

### Patient Module
* **Register & Login**: Dynamic role-based registration.
* **Find Doctors**: Search by name/bio or filter by specialization.
* **Doctor Profiles**: Detailed doctor biography, fees, ratings, and standard availability schedules.
* **Slot Booking**: Interactive calendar slot selection linked to live booking status.
* **My Appointments**: Live tracking and booking cancellation support.
* **Digital Medical Folders**: Secure document uploads (PDF, scan reports, images).
* **Treatment Timeline**: Automatic chronological history compiling visits, reports, prescriptions, and scheduled follow-ups.
* **E-Prescriptions**: Detailed medicine sheets with dosage details and mock-print support.

### Doctor Module
* **Clinician Dashboard**: Real-time counter of today's visits, pending requests, and schedule logs.
* **Appointments Manager**: Access to accept, decline, or consult appointments.
* **Consultation Workspace**: Input consultation summaries, prescribe multiple medicines, and schedule follow-up checkups.
* **Patient History Records**: Lookup patient list and review their comprehensive medical timeline.
* **Availability Builder**: Set and configure daily slots.

### Admin Module
* **Admin Dashboard**: System metrics (users count, verified/pending doctors, bookings distribution, specialities breakdown).
* **Doctor Verification Directory**: Review pending clinician sign ups, verify licenses, and approve listings.
* **Account Registry**: View and manage all user accounts.
* **Specialties Configuration**: Create and delete clinical categories.

---

## Directory Structure

```
/
├── backend/                # Express server and MongoDB config
│   ├── config/             # DB & Multer configs
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Security and guard filters
│   ├── models/             # Mongoose schemas
│   ├── routes/             # REST endpoints
│   ├── uploads/            # Local clinical files storage
│   ├── .env                # App environment keys
│   ├── seed.js             # Database populator script
│   └── server.js           # Server runner
└── frontend/               # Vite React client
    ├── src/
    │   ├── components/     # Layout shells (Navbar, Sidebar, ProtectedRoute)
    │   ├── context/        # Session store (AuthContext)
    │   ├── pages/          # Public, Patient, Doctor, and Admin screens
    │   └── utils/          # Axios HTTP instance
```

---

## Complete Setup & Execution Guide

### Prerequisites
Make sure you have [MongoDB Community Server](https://www.mongodb.com/try/download/community) installed and running locally on port `27017`.

### 1. Database & Backend Configuration

Navigate to the `backend` directory:
```bash
cd backend
```

Create a `.env` file in the `backend` folder (already prepared with defaults):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/healthconnect
JWT_SECRET=healthconnect_secret_123
```

Install packages:
```bash
npm install
```

### 2. Populate Database Seed Data
To populate the database with default specialties, patient accounts, verified doctors, and a system administrator, run:
```bash
npm run seed
```

This will create:
* **Admin Account**: `admin@healthconnect.com` / `admin123`
* **Patient Account**: `patient@healthconnect.com` / `patient123`
* **Verified Doctor**: `doctor@healthconnect.com` / `doctor123`
* **Pending Doctor**: `doctor2@healthconnect.com` / `doctor123`

### 3. Run Backend API Server
Start the Express server:
```bash
npm start
```
The backend server will list on `http://localhost:5000`.

### 4. Run Frontend Client
Open a new terminal shell and navigate to the `frontend` directory:
```bash
cd frontend
```

Install client packages:
```bash
npm install
```

Start Vite development server:
```bash
npm run dev
```
The React frontend client will start on `http://localhost:5173` (or the next available port).

---

## E2E Manual Verification Flow
1. Open the browser to `http://localhost:5173`.
2. **Login as Patient**: Log in with `patient@healthconnect.com` / `patient123`.
3. Go to **Find Doctors**, click **Dr. Sarah Connor**, select tomorrow's date, choose an available slot, input symptoms, and click **Book Slot**.
4. Log out.
5. **Login as Doctor**: Log in with `doctor@healthconnect.com` / `doctor123`.
6. Go to **Appointments**, look at the booking from John Doe, and click **Consult & Complete**.
7. Input **Consultation Notes**, click **Add Row** to prescribe a medicine (e.g., *Amoxicillin, 1-0-1, 5 days, after food*), choose a **Follow-Up Date**, and submit.
8. Log out.
9. **Login as Patient**: Log in with `patient@healthconnect.com` / `patient123`.
10. Check your **Dashboard**: review your **Health History Timeline** to see the completed consult details, prescription sheet, and follow-up alert. Click **View Full Prescription** to open the clinical receipt.
