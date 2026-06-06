# 🏥 Doctor Hub – Healthcare Consultation & Patient History Management System

> **Semester Project** | BCS 5th Semester | Full-Stack Web Application

---

## 📋 Project Overview

Doctor Hub is a production-style healthcare consultation platform where patients can search doctors by disease and treatment type (Allopathic, Homeopathic, Herbal), book appointments, upload payment screenshots, and manage their complete medical history.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js 18, React Router v6, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (JSON Web Tokens) + Role-Based Access Control |
| File Uploads | Multer |
| State Management | React Context API |
| HTTP Client | Axios |
| Notifications | React Hot Toast |

---

## 👥 User Roles & Access

| Role | Capabilities |
|------|-------------|
| **Patient** | Register, search/filter doctors, book appointments, upload payments, view medical history & prescriptions |
| **Doctor** | Manage profile & clinics, view appointments, add immutable medical history & prescriptions |
| **Assistant** | Verify/reject payment screenshots, confirm appointments |
| **Admin** | Manage all users, verify doctors, view system stats |
| **Super Admin** | Full system control, create staff accounts (doctors/assistants/admins) |

---

## 🔒 Key Business Rules

- **Medical history is IMMUTABLE** — Doctors can only ADD new records, never edit/delete
- **Prescriptions are IMMUTABLE** — Written by doctors, cannot be modified by anyone
- **Appointment workflow**: Book → Payment Pending → Upload Screenshot → Assistant Verifies → Confirmed
- **Doctor accounts** are created by Admin/Super Admin only (not self-registration)
- **Patients** self-register; verified through the platform

---

## 📁 Folder Structure

```
doctor-hub/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, create staff
│   │   ├── doctorController.js    # Doctor CRUD, search, verify
│   │   ├── appointmentController.js
│   │   ├── paymentController.js
│   │   ├── historyController.js   # Medical history + prescriptions
│   │   └── adminController.js     # Dashboard stats, user management
│   ├── middleware/
│   │   ├── auth.js                # JWT protect + RBAC authorize
│   │   ├── errorHandler.js        # Global error handler
│   │   └── upload.js              # Multer file upload config
│   ├── models/
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   ├── Patient.js
│   │   ├── Appointment.js
│   │   ├── Payment.js
│   │   ├── MedicalHistory.js
│   │   └── Prescription.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── doctors.js
│   │   ├── appointments.js
│   │   ├── payments.js
│   │   ├── history.js
│   │   └── admin.js
│   ├── utils/
│   │   └── seed.js                # Dummy data seeder
│   ├── uploads/                   # Auto-created for file uploads
│   ├── server.js                  # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── ProtectedRoute.js
    │   │   └── layout/
    │   │       └── Navbar.js
    │   ├── context/
    │   │   └── AuthContext.js     # Global auth state
    │   ├── pages/
    │   │   ├── LandingPage.js
    │   │   ├── DoctorsPage.js     # Search + filter doctors
    │   │   ├── DoctorDetailPage.js
    │   │   ├── Unauthorized.js
    │   │   ├── auth/
    │   │   │   ├── LoginPage.js
    │   │   │   └── RegisterPage.js
    │   │   ├── patient/
    │   │   │   ├── PatientDashboard.js
    │   │   │   ├── PatientAppointments.js
    │   │   │   ├── BookAppointment.js
    │   │   │   ├── PaymentUploadPage.js
    │   │   │   └── MedicalHistoryPage.js
    │   │   ├── doctor/
    │   │   │   ├── DoctorDashboard.js
    │   │   │   ├── DoctorProfile.js
    │   │   │   ├── DoctorPrescriptions.js
    │   │   │   └── AddMedicalRecord.js
    │   │   ├── assistant/
    │   │   │   └── AssistantDashboard.js
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.js
    │   │   │   └── CreateStaff.js
    │   │   └── superadmin/
    │   │       └── SuperAdminDashboard.js
    │   ├── services/
    │   │   └── api.js             # All Axios API calls
    │   ├── App.js                 # React Router setup
    │   ├── index.js
    │   └── index.css              # Tailwind + Google Fonts
    ├── .env
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm

---

### Step 1 — Clone & Setup Backend

```bash
cd doctor-hub/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/doctorhub
JWT_SECRET=doctor_hub_super_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

---

### Step 2 — Seed Dummy Data

```bash
npm run seed
```

This creates all test accounts:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@doctorhub.com | password123 |
| Admin | admin@doctorhub.com | password123 |
| Doctor (Allopathic) | dr.ahmad@doctorhub.com | password123 |
| Doctor (Homeopathic) | dr.sara@doctorhub.com | password123 |
| Doctor (Herbal) | dr.bilal@doctorhub.com | password123 |
| Assistant | assistant@doctorhub.com | password123 |
| Patient | patient@doctorhub.com | password123 |

---

### Step 3 — Start Backend

```bash
npm run dev
# Server runs at http://localhost:5000
```

---

### Step 4 — Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install
```

The `.env` file is pre-configured:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### Step 5 — Start Frontend

```bash
npm start
# App runs at http://localhost:3000
```

---

## 🌐 REST API Documentation

### Auth Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Patient self-registration |
| POST | `/api/auth/login` | Public | Login any role |
| GET | `/api/auth/me` | Private | Get current user |
| POST | `/api/auth/create-staff` | Admin+ | Create doctor/assistant/admin |

### Doctor Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/doctors` | Public | List/search/filter doctors |
| GET | `/api/doctors/:id` | Public | Doctor detail |
| GET | `/api/doctors/me` | Doctor | Own profile |
| PUT | `/api/doctors/profile` | Doctor | Update profile |
| POST | `/api/doctors/clinic` | Doctor | Add clinic |
| PUT | `/api/doctors/:id/verify` | Admin+ | Verify/unverify doctor |

### Appointment Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/appointments` | Patient | Book appointment |
| GET | `/api/appointments/my` | Patient | Own appointments |
| GET | `/api/appointments/doctor` | Doctor | Doctor's appointments |
| GET | `/api/appointments/pending` | Assistant | Payment-uploaded appointments |
| GET | `/api/appointments` | Admin+ | All appointments |
| PUT | `/api/appointments/:id/confirm` | Assistant | Confirm after payment |
| PUT | `/api/appointments/:id/cancel` | Patient/Doctor/Admin | Cancel |
| PUT | `/api/appointments/:id/complete` | Doctor | Mark completed |

### Payment Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/payments` | Patient | Upload payment screenshot |
| GET | `/api/payments/pending` | Assistant | Pending payments |
| GET | `/api/payments/my` | Patient | Own payments |
| PUT | `/api/payments/:id/verify` | Assistant | Verify or reject |

### Medical History Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/history` | Doctor | Add history record (immutable) |
| GET | `/api/history` | Patient/Doctor/Admin | Get history |
| POST | `/api/history/prescription` | Doctor | Add prescription (immutable) |
| GET | `/api/history/prescriptions` | Patient/Doctor/Admin | Get prescriptions |

### Admin Endpoints
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/stats` | Admin+ | Dashboard statistics |
| GET | `/api/admin/users` | Admin+ | All users with role filter |
| PUT | `/api/admin/users/:id/toggle` | Admin+ | Activate/deactivate user |
| GET | `/api/admin/doctors/unverified` | Admin+ | Unverified doctors |

---

## 🗄️ Database Schema (ER Summary)

```
User (1) ──── (1) Doctor
User (1) ──── (1) Patient
User (1) ──── (M) Appointment [as patient]
User (1) ──── (M) Appointment [as doctor]
Appointment (1) ──── (1) Payment
Appointment (1) ──── (M) MedicalHistory
Appointment (1) ──── (M) Prescription
Doctor (1) ──── (M) Clinic [embedded]
Doctor (M) ──── (M) User [assistants]
```

---

## 🔐 Security Features

- **JWT Authentication** — Stateless token-based auth, 7-day expiry
- **bcryptjs** — Passwords hashed with salt rounds of 12
- **RBAC Middleware** — Every route protected by role checks
- **Multer file validation** — Only jpg/png/pdf, max 5MB
- **Immutable medical records** — No PUT/DELETE on history or prescriptions
- **Protected uploads** — Files served statically, not executable

---

## 🚀 Appointment Workflow (Step by Step)

```
1. Patient searches doctor by disease/city/treatment type
2. Patient clicks "Book Now" on doctor card
3. Patient selects clinic, date, time slot, describes symptoms
4. Appointment created with status: payment_pending
5. Patient uploads JazzCash/EasyPaisa screenshot
6. Appointment status → payment_uploaded
7. Assistant logs in → sees pending payments
8. Assistant views screenshot → clicks "Verify"
9. Payment status → verified, Appointment status → confirmed
10. Doctor sees confirmed appointment in dashboard
11. Doctor marks appointment completed after visit
12. Doctor adds immutable Medical History & Prescription
13. Patient can view all records forever in My History
```

---

## 🔮 Future Enhancements

- [ ] AI disease prediction from symptoms
- [ ] Video consultation (WebRTC)
- [ ] WhatsApp notifications (Twilio)
- [ ] E-prescription PDF generation
- [ ] Doctor ratings & reviews
- [ ] SMS appointment reminders
- [ ] Advanced analytics dashboard

---

## 👨‍💻 Developer Notes

- Run `npm run seed` to reset and repopulate test data anytime
- The `uploads/` folder is auto-created on first file upload
- Frontend proxy is configured to `http://localhost:5000` in `package.json`
- All API errors return `{ success: false, message: "..." }` format
- All API success responses return `{ success: true, data... }` format

---

*Doctor Hub — Semester Project | Built with React + Node.js + MongoDB*
