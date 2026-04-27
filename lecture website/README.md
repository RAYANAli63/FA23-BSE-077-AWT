# LearnHub - MERN Stack Lecture Platform

LearnHub is a production-ready EdTech platform inspired by Notion, built with the MERN stack. It transforms simple HTML lectures into a dynamic, animated, and interactive learning experience.

## ✨ Features
- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion (animated page transitions & micro-interactions).
- **Backend**: Node.js, Express, MongoDB with Mongoose.
- **State Management**: Redux Toolkit (Lectures, Auth states).
- **Admin Panel**: JWT Protected, Full CRUD functionality for lectures with rich text support.
- **User Experience**: 
  - Smooth dynamic sidebar navigation.
  - Dark mode toggle with `localStorage` persistence.
  - Automated progress tracking.
  - Search and filter lectures.

## 📂 Folder Structure

```
lecture-platform/
├── frontend/                  # React + Vite application
│   ├── src/
│   │   ├── api/               # Axios configuration
│   │   ├── components/        # Reusable UI (Header, Sidebar)
│   │   ├── layouts/           # App shells (MainLayout)
│   │   ├── pages/             # Route pages (Home, Lecture, Admin, 404)
│   │   ├── redux/             # Redux slices (auth, lectures)
│   │   ├── App.jsx            # Router and lazy-loading
│   │   ├── main.jsx           # App entry point
│   │   └── index.css          # Global Design tokens & Tailwind
│   ├── vercel.json            # Vercel deployment config
│   ├── package.json
│   └── vite.config.js         # Configured with proxy to backend
│
└── backend/                   # Node.js + Express application
    ├── config/                # Database connection
    ├── controllers/           # Route logic (auth, lectures)
    ├── middleware/            # JWT Auth & Error handlers
    ├── models/                # Mongoose schemas
    ├── routes/                # Express API routes
    ├── server.js              # Server entry point
    ├── .env                   # Environment variables
    └── package.json
```

## 🚀 Setup Instructions

### 1. Prerequisites
- [Node.js](https://nodejs.org/en/) (v18+)
- [MongoDB](https://www.mongodb.com/) (Local server or MongoDB Atlas)

### 2. Backend Setup
1. Open a terminal and navigate to the backend folder:
   ```bash
   cd "backend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update environment variables in `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://localhost:27017/lecture-platform
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd "frontend"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
4. Access the app at `http://localhost:5173`.

> **Note**: To create your first Admin account, you must send a `POST` request (via Postman) to `http://localhost:5000/api/auth/register` with `{ "name": "Admin", "email": "admin@test.com", "password": "password" }`. After creation, disable the route in `backend/routes/authRoutes.js` for security.

---

## 🌍 Deployment Steps

### Step 1: Deploy Backend (Render / Railway / Heroku)
1. Push your `backend/` code to a GitHub repository.
2. Sign up on [Render](https://render.com/) or [Railway](https://railway.app/).
3. Create a **New Web Service** and link your repo.
4. Set the Root Directory to `backend` (if using a monorepo approach) or deploy the backend repo directly.
5. Set the Start Command to: `npm start`.
6. Add your Environment Variables (`MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` pointing to your future Vercel domain).
7. Deploy and copy the provided backend URL (e.g., `https://my-backend.onrender.com`).

### Step 2: Deploy Frontend (Vercel)
1. In `frontend/vite.config.js`, remove or adjust the `proxy` setting since it is only meant for local development.
2. In `frontend/src/api/axios.js`, change the `baseURL` to point directly to your deployed backend. E.g.:
   ```javascript
   const API = axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'https://my-backend.onrender.com/api',
   });
   ```
3. Push your `frontend/` code to GitHub.
4. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
5. Import your frontend repository.
6. Make sure the Framework Preset is set to **Vite**.
7. Deploy. Vercel will automatically read the `vercel.json` file for proper React routing.
8. Update your Backend's `CLIENT_URL` to match your new Vercel domain to prevent CORS issues.

---

### 🎉 Bonus Features Implemented
- **Dark Mode**: Persists locally and uses deep slate colors for a premium look.
- **Search System**: Live debounced search available right in the sidebar.
- **Progress Tracking**: Automatic progress bar and checkmarks powered by local storage.
- **Dynamic Routing**: Instant route transitions orchestrated by Framer Motion.
