# 🚀 AdFlow Pro - Quick Start Guide

## 5-Minute Setup

### Step 1: Clone & Install (2 minutes)
```bash
# Install all dependencies
npm install
```

### Step 2: Configure Environment (1 minute)
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your values:
# - JWT_SECRET: Random string (minimum 32 characters)
# - SUPABASE_URL: Your Supabase project URL
# - SUPABASE_KEY: Your Supabase anon key
```

**Get Supabase credentials:**
1. Go to https://supabase.com
2. Create a project
3. Go to Settings → API
4. Copy `Project URL` and `anon public key`

### Step 3: Run the Project (2 minutes)
```bash
# Start both frontend and backend
npm run dev

# Frontend: http://localhost:3000
# Backend:  http://localhost:5000
```

---

## Available Commands

```bash
# Development
npm run dev              # Run both client & server with hot reload
npm run dev:server      # Run only backend
npm run dev:client      # Run only frontend

# Production
npm run build           # Build both client & server
npm start               # Start production server
```

---

## Project URL

Once running, visit:
- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:5000/api/health

---

## Troubleshooting

### ❌ Port 3000 or 5000 in use
```bash
# Change backend port
PORT=5001 npm run dev:server

# Or kill the process using the port
# macOS/Linux: lsof -ti:5000 | xargs kill -9
# Windows: netstat -ano | findstr :5000
```

### ❌ Module not found errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

### ❌ Database connection error
- Check your `.env` file has correct Supabase credentials
- Verify internet connection
- Check Supabase project status at https://supabase.com

### ❌ Cannot find 'next' command
```bash
# Reinstall dependencies
npm install
```

---

## Next Steps

1. ✅ Register a new account at http://localhost:3000/register
2. ✅ Create your first ad
3. ✅ Explore the dashboard
4. ✅ Check admin panel (if you have admin role)

---

## Need More Help?

See [README.md](./README.md) for detailed documentation.

---

**Last Updated**: March 31, 2026  
**Version**: 1.0.0
