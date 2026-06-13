# Doctor Hub — Supabase Production Migration

## 🚀 Setup in 5 Steps

### Step 1: Run SQL Migration
1. Go to **Supabase Dashboard → SQL Editor → New Query**
2. Copy entire contents of `supabase/migrations/001_complete_schema.sql`
3. Click **Run** — this creates ALL tables, RLS policies, triggers, storage buckets

### Step 2: Set Super Admin
After creating your first user via the app:
```sql
UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
```

### Step 3: Frontend Setup
```bash
cd frontend
# .env already configured with your Supabase URL and anon key
npm install
npm start
```

### Step 4: Backend Setup (only needed for admin staff creation)
```bash
cd backend
npm install
# Edit backend/.env — add your SUPABASE_SERVICE_ROLE_KEY
npm run dev
```

### Step 5: Vercel Deployment
**Root Directory:** `frontend`
**Build Command:** `npm install --legacy-peer-deps && npm run build`
**Output Directory:** `build`

**Environment Variables in Vercel:**
```
REACT_APP_SUPABASE_URL=https://cfxxafszneaireymkhjw.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sb_publishable_NaiagCPKIgZwy4Gi3hLVCw_DnJlqUZQ
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## 📁 Files Changed

| File | Change |
|------|--------|
| `frontend/src/lib/supabase.js` | **NEW** — Supabase client |
| `frontend/src/context/AuthContext.js` | **REPLACED** — Uses Supabase Auth |
| `frontend/src/services/api.js` | **REPLACED** — Direct Supabase queries |
| `frontend/src/pages/auth/LoginPage.js` | **UPDATED** — Supabase login |
| `frontend/src/pages/auth/RegisterPage.js` | **UPDATED** — Supabase register |
| `frontend/package.json` | **UPDATED** — Added @supabase/supabase-js |
| `backend/server.js` | **REPLACED** — Minimal, only for staff creation |
| `backend/package.json` | **UPDATED** — Removed mongoose, added supabase |
| `supabase/migrations/001_complete_schema.sql` | **NEW** — Complete schema |

## ✅ All Other Pages Work Without Changes
- PatientDashboard, DoctorDashboard, AdminDashboard, etc.
- All call the same api.js functions — just the implementation changed
- ProtectedRoute works same way (uses user.role)

---

## 🔒 Security Features
- RLS on every table
- Service role never exposed to frontend
- Immutable medical records (DB trigger blocks UPDATE/DELETE)
- Role-based access control via Supabase Auth JWT
- Storage buckets with per-role policies
- Audit logging on sensitive operations
