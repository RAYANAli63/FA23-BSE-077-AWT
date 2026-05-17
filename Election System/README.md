# 🗳️ VoteSecure Pro — Secure Online Election Management System

> Production-grade, enterprise-level online voting platform built with **React + Vite + Tailwind CSS + Supabase**

---

## ✨ Features

### Authentication
- ✅ Sign Up / Sign In / Logout
- ✅ Email verification via Supabase
- ✅ Forgot / Reset password
- ✅ Role-based auth: Super Admin, Election Creator, Voter
- ✅ Protected routes
- ✅ Persistent sessions
- ✅ **Session User ID** — unique `VS-XXXXXXXX` per login shown to voter

### Admin Module
- ✅ Admin dashboard with live stats
- ✅ Review, approve, reject creator requests (with reason)
- ✅ Manage all elections
- ✅ User management (activate/deactivate)
- ✅ Complete audit logs — downloadable as CSV
- ✅ System status panel

### Election Management
- ✅ Create / Edit / Delete elections
- ✅ Category, title, description
- ✅ Start/end time + registration deadline
- ✅ Max voters limit
- ✅ Publish / Unpublish
- ✅ Status flow: draft → published → active → completed
- ✅ Countdown timers (live)
- ✅ Auto-lock when voter limit reached

### Candidate Management
- ✅ Add / Edit / Delete candidates
- ✅ Photo URL upload
- ✅ Manifesto / description
- ✅ Rich candidate cards

### Voter Registration System
- ✅ "I Want to Participate" flow
- ✅ Terms acceptance
- ✅ Duplicate prevention
- ✅ Auto-waitlist when full
- ✅ Registration deadline enforcement

### Voter Locking & Finalization
- ✅ Auto-lock at voter limit
- ✅ Finalize voter list when election starts
- ✅ Secret code generated per voter (format: `POLL-XXXX-0001`)
- ✅ Secret code sent via in-app notification

### Secure Voting
- ✅ Anonymous voting
- ✅ One voter = one vote (enforced at DB level)
- ✅ Secret ID validation before vote
- ✅ Voting timer displayed
- ✅ Confirmation page
- ✅ Duplicate vote prevention

### Live Results & Analytics
- ✅ Real-time charts (Chart.js — Bar + Doughnut)
- ✅ Candidate vote percentages
- ✅ Winner declaration with banner
- ✅ Voter turnout percentage
- ✅ Download results as PDF
- ✅ WebSocket live updates

### Session User ID System
- ✅ Every login generates unique `VS-XXXXXXXX` Session ID
- ✅ Shown in Voter Dashboard, Voting Page, Navbar
- ✅ Voter List shows Session ID of voters who voted
- ✅ Logged in audit for traceability
- ✅ New ID per session = privacy preserved

### Notification System
- ✅ In-app notification bell
- ✅ Election start alerts with secret code
- ✅ Approval / rejection notifications
- ✅ Vote confirmation notification
- ✅ Mark all read

### Security
- ✅ Supabase Row-Level Security (RLS)
- ✅ Anonymous votes (not linked to voter identity)
- ✅ Secret code validation
- ✅ Role-based access control
- ✅ Secure environment variables

### UI/UX
- ✅ Ultra-modern dark/light mode (toggle in navbar)
- ✅ Glassmorphism navbar with backdrop blur
- ✅ Tailwind CSS v3 design system
- ✅ Outfit + Syne + JetBrains Mono fonts
- ✅ Fully responsive — mobile, tablet, desktop
- ✅ Loading skeletons
- ✅ Toast notifications (react-hot-toast)
- ✅ Smooth animations & transitions
- ✅ QR code sharing
- ✅ PDF results download

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v6 |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Charts | Chart.js + react-chartjs-2 |
| State | React Context API |
| Animations | CSS transitions + Tailwind animate |
| Notifications | react-hot-toast |
| PDF Export | jsPDF + jspdf-autotable |
| Deployment | Vercel |

---

## 🚀 Installation & Setup

### 1. Clone and install
```bash
unzip votesecure-pro.zip
cd votesecure-pro
npm install
```

### 2. Supabase Setup
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** → Run the entire `supabase_schema.sql` file
4. Go to **Settings → API** → Copy your URL and anon key

### 3. Environment Variables
```bash
cp .env.example .env
# Edit .env and add your Supabase credentials
```

### 4. Run Development Server
```bash
npm run dev
# Opens at http://localhost:3000
```

### 5. Create Super Admin
After registering your first account, run in Supabase SQL Editor:
```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

---

## 📋 User Flows

### Super Admin
1. Login → Admin Dashboard
2. Review creator requests → Approve/Reject
3. Monitor all elections, users, audit logs

### Election Creator
1. Register → Apply for creator role
2. Admin approves → role upgraded
3. Create election → Add candidates → Publish
4. Start election → voters get secret codes
5. End election → winner declared automatically

### Voter
1. Register → Browse elections
2. Click "I Want to Participate" → Accept terms
3. Wait for election to start → receive secret code notification
4. Go to election → click "Vote Now" → enter secret code
5. Select candidate → confirm vote
6. View live results

---

## 🌐 Deployment (Vercel)

```bash
npm run build
# Push to GitHub then:
# 1. vercel.com → New Project → Import repo
# 2. Add environment variables in Vercel dashboard
# 3. Deploy!
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx      # Top navigation, theme toggle, notifications
│   │   └── Sidebar.jsx     # Side navigation with mobile drawer
│   └── ui/
│       └── index.jsx       # All reusable UI components
├── hooks/
│   └── useAuth.jsx         # Auth context with session ID
├── lib/
│   └── supabase.js         # Supabase client + helpers
├── pages/
│   ├── auth/               # Login, Register, Reset Password
│   ├── admin/              # Admin dashboard, requests, users, audit
│   ├── creator/            # Creator dashboard, election forms, voter list
│   ├── voter/              # Voter dashboard, voting page
│   └── public/             # Landing page, election detail, results
└── App.jsx                 # Routes + providers
```

---

## 🔐 Security Notes

- Never commit `.env` file
- All database operations use Supabase RLS
- Votes are stored without voter identity (only secret code)
- Session IDs are derived from user UUID — different display each session
- Secret codes generated server-side via PostgreSQL function

---

Built with ❤️ for university project by VoteSecure Team
