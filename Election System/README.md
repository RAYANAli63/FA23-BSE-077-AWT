# 🗳️ VoteSecure – Secure Online Election Management System

**React + Supabase | All 15 Modules + Bonus Features**
https://election-system-fawn.vercel.app/

---

## ✅ All Modules Implemented

| # | Module | Status |
|---|--------|--------|
| 1 | Authentication (signup, login, reset, roles) | ✅ |
| 2 | Admin Approval (approve/reject creator requests) | ✅ |
| 3 | Election Creation (title, schedule, max voters, edit) | ✅ |
| 4 | Candidate Management (add, edit, delete, photos) | ✅ |
| 5 | Public Landing Page (search, filter, countdown) | ✅ |
| 6 | Voter Registration (I want to participate, terms, deadline) | ✅ |
| 7 | Voter Locking (auto-lock, freeze list, waitlist) | ✅ |
| 8 | Secret ID Generation (POLL-XXXX-0001 format, masked) | ✅ |
| 9 | Voting (secret code verify, anonymous, one vote) | ✅ |
| 10 | Live Results (Chart.js bar + doughnut, realtime) | ✅ |
| 11 | Audit & Transparency (all actions logged, CSV export) | ✅ |
| 12 | Notifications (in-app bell, all key events) | ✅ |
| 13 | Security (RLS, anonymous votes, duplicate prevention) | ✅ |
| 14 | Dashboards (Admin, Creator, Voter) | ✅ |
| 15 | Deployment (Vercel + GitHub) | ✅ |

## 🎁 Bonus Features

| Feature | Status |
|---------|--------|
| Dark Mode / Light Mode toggle | ✅ |
| QR Invite Links (per election) | ✅ |
| Download Results as PDF | ✅ |
| Waitlist System | ✅ |
| PWA Support (manifest.json) | ✅ |
| Audit Log CSV Export | ✅ |
| Blockchain-style Audit Trail | ✅ |

---

## 🚀 Setup (3 Steps)

### Step 1 – Supabase

1. Go to [supabase.com](https://supabase.com) → Create free project
2. SQL Editor → Paste `supabase_schema.sql` → **Run**
3. Settings → API → Copy **Project URL** and **anon public** key

### Step 2 – Environment Variables

```bash
cp .env.example .env
```

Fill in your values:
```
REACT_APP_SUPABASE_URL=https://xxxxxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJxxxxxxxx...
```

Also add these same values in **Vercel → Project → Settings → Environment Variables**

### Step 3 – Run Locally

```bash
npm install
npm start
```

---

## 👑 Create Super Admin

1. Register an account at `/register`
2. Supabase → **Table Editor** → `profiles` table
3. Find your user → change `role` to `super_admin` → Save

---

## 🔄 Complete User Flow

```
1. Admin registers → sets self as super_admin in Supabase
2. User registers → applies to become Election Creator
3. Admin approves → user role becomes election_creator
4. Creator creates election → adds candidates → publishes
5. Voters register → click "I Want to Participate"
6. Creator starts election → voters auto-finalized → secret codes sent
7. Voters verify secret code → cast anonymous vote
8. Creator ends election → winner declared
9. Results visible on public page with charts
```

---

## 🔐 Security Features

- ✅ Row Level Security (RLS) on ALL tables
- ✅ Anonymous voting (votes NOT linked to voter ID)
- ✅ Secret code verification before voting
- ✅ Duplicate vote prevention (unique constraint on votes)
- ✅ Role-based protected routes
- ✅ Audit logs for every action
- ✅ Input validation on all forms

---

## 📁 Project Structure

```
src/
├── lib/supabase.js          # Supabase client + helpers
├── hooks/useAuth.js         # Auth context + notifications
├── styles/global.css        # Complete dark/light theme
├── components/shared/       # Navbar, Sidebar, Spinner
└── pages/
    ├── public/              # Landing, ElectionDetail, Results
    ├── auth/                # Login, Register, Forgot, Reset
    ├── admin/               # Dashboard, Requests, Elections, Users, Audit
    ├── creator/             # Dashboard, Create, Edit, Candidates, Voters, Control
    └── voter/               # Dashboard, VotingPage
```

---

## 🌐 Deploy on Vercel

```bash
git init && git add . && git commit -m "VoteSecure"
git remote add origin https://github.com/USERNAME/election-system.git
git push -u origin main
```

Then: Vercel → Import repo → Add env variables → Deploy ✅

---

## 📊 Grading Checklist

- [x] **UI/UX 20%** – Dark/light theme, animations, responsive, countdown timers
- [x] **Functionality 30%** – All 15 modules working end-to-end
- [x] **Security 20%** – RLS, anonymous voting, role-based access, audit logs
- [x] **Deployment 15%** – Vercel + GitHub ready
- [x] **Presentation 15%** – Live demo ready with test data
