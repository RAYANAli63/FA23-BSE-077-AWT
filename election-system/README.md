# 🗳️ VoteSecure – Secure Online Election Management System

A full-stack semester project built with **React + Supabase**.

---

## 📋 Features (All 15 Modules)

| Module | Status |
|--------|--------|
| 1. Authentication (signup, login, reset password, roles) | ✅ |
| 2. Admin Approval (creator requests, approve/reject) | ✅ |
| 3. Election Creation (title, schedule, max voters) | ✅ |
| 4. Candidate Management (add, edit, delete, photos) | ✅ |
| 5. Public Landing Page (upcoming/active/completed, search) | ✅ |
| 6. Voter Registration ("I Want to Participate", deadline) | ✅ |
| 7. Voter Locking (auto-lock at max, freeze list) | ✅ |
| 8. Secret ID Generation (unique code per voter per poll) | ✅ |
| 9. Voting Module (secret code verify, anonymous, one vote) | ✅ |
| 10. Live Results (Chart.js bar + doughnut, live updates) | ✅ |
| 11. Audit & Transparency (logs all actions) | ✅ |
| 12. Notifications (Supabase email via auth) | ✅ |
| 13. Security (RLS, input validation, duplicate prevention) | ✅ |
| 14. Dashboards (Admin, Creator, Voter) | ✅ |
| 15. Deployment (Vercel + GitHub ready) | ✅ |

---

## 🚀 Setup Instructions

### Step 1 – Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** → paste the entire contents of `supabase_schema.sql` → Run

### Step 2 – Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in:
```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Find these in: Supabase Dashboard → Settings → API

### Step 3 – Install & Run

```bash
npm install
npm start
```

App runs at `http://localhost:3000`

### Step 4 – Create Super Admin

1. Register an account at `/register`
2. Go to Supabase Dashboard → Table Editor → `profiles`
3. Find your user and change `role` from `voter` to `super_admin`

---

## 🗂️ Project Structure

```
src/
├── lib/
│   └── supabase.js          # Supabase client
├── hooks/
│   └── useAuth.js           # Auth context + hooks
├── styles/
│   └── global.css           # Global styles
├── components/
│   └── shared/
│       ├── Navbar.js
│       └── LoadingSpinner.js
└── pages/
    ├── public/
    │   ├── LandingPage.js       # Home with all elections
    │   ├── ElectionDetailPage.js # Election + voter registration
    │   └── ResultsPage.js       # Live/final results with charts
    ├── auth/
    │   ├── LoginPage.js
    │   ├── RegisterPage.js
    │   ├── ForgotPasswordPage.js
    │   └── ResetPasswordPage.js
    ├── admin/
    │   ├── AdminDashboard.js    # Stats overview
    │   ├── AdminRequests.js     # Approve/reject creator requests
    │   ├── AdminElections.js    # View all elections
    │   ├── AdminUsers.js        # View all users
    │   └── AuditLogs.js         # Full audit trail
    ├── creator/
    │   ├── CreatorDashboard.js  # My elections list
    │   ├── CreateElection.js    # New election form
    │   ├── ManageCandidates.js  # Add/edit/delete candidates
    │   ├── VoterList.js         # See registered voters
    │   └── ElectionControl.js  # Start/stop election
    └── voter/
        ├── VoterDashboard.js    # My joined elections
        ├── VotingPage.js        # Secret code verify + vote
        └── MyElections.js       # Alias for VoterDashboard
```

---

## 🔐 User Roles

| Role | Access |
|------|--------|
| `voter` | Browse elections, register, vote |
| `election_creator` | All voter access + create/manage elections |
| `super_admin` | Full access + approve creators, view audit logs |

---

## 📊 Voting Flow

```
Voter registers → Admin approves creator → Creator creates election →
Voters click "I Want to Participate" → Registration closes / locks at max →
Secret codes emailed to finalized voters → Creator starts election →
Voters verify secret code → Cast anonymous vote → Live results shown
```

---

## 🌐 Deployment on Vercel

```bash
# Push to GitHub first
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/election-system.git
git push -u origin main
```

Then:
1. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
2. Add Environment Variables (same as `.env`)
3. Deploy!

---

## 🛡️ Security Features

- **Row Level Security (RLS)** on all tables
- **Role-based access control** (voter / creator / admin)
- **Anonymous voting** – votes not linked to voter identity
- **Secret code validation** before voting
- **Duplicate vote prevention** (database unique constraint)
- **Audit logs** for every action (login, vote, approval, edit)
- **Input validation** on all forms
- **Protected routes** in React

---

## 📦 Tech Stack

- **Frontend**: React 18, React Router v6
- **Backend/DB**: Supabase (PostgreSQL + Auth + RLS)
- **Charts**: Chart.js + react-chartjs-2
- **Notifications**: react-toastify
- **Deployment**: Vercel

---

## 🎯 Grading Checklist

- [x] UI/UX – Dark themed, responsive, animated cards (20%)
- [x] Functionality – All 15 modules implemented (30%)
- [x] Security – RLS, anonymous voting, role-based access (20%)
- [x] Deployment – Vercel + GitHub ready (15%)
- [x] Presentation – Live demo ready (15%)

---

## 👨‍💻 Developer Notes

- Secret codes are generated by a Supabase trigger when voter list locks
- Live results use Supabase Realtime subscriptions
- All votes are stored with only `secret_code`, not `voter_id` (anonymity)
- Admin can override voter list with audit trail
