# AdFlow Pro - Setup & Running Guide

AdFlow Pro is a full-stack application for managing and listing advertisements with payment integration, moderation, and analytics.

## Project Structure

```
adflow-pro/
├── client/              # Next.js frontend
├── server/              # Express.js backend
├── shared/              # Shared types, schemas, and constants
├── package.json         # Root package.json with scripts
└── tsconfig.json        # Root TypeScript config
```

## Prerequisites

- **Node.js** v18+ 
- **npm** v10+
- **Environment Variables** (.env files)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for both client and server from the root package.json.

## Environment Variables

Create `.env` file in the root directory with the following variables:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here

# Database (Supabase)
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Client Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Environment Variable Notes:
- `JWT_SECRET`: Use a strong random string for JWT signing
- `SUPABASE_URL` & `SUPABASE_KEY`: Get these from your Supabase project
- `NEXT_PUBLIC_API_URL`: Must start with `NEXT_PUBLIC_` to be accessible in the browser

## Running the Project

### Development Mode (Both Client & Server)

Run both frontend and backend concurrently with hot reload:

```bash
npm run dev
```

This will start:
- **Frontend**: Next.js dev server on `http://localhost:3000`
- **Backend**: Express server on `http://localhost:5000`

### Development Mode (Separate)

If you prefer to run them separately:

```bash
# Terminal 1: Start Backend
npm run dev:server

# Terminal 2: Start Frontend
npm run dev:client
```

### Production Build

Build both frontend and backend:

```bash
npm run build
```

### Start Production Server

After building:

```bash
npm start
```

## API Endpoints

Once the server is running, you can access:

- **Health Check**: `GET http://localhost:5000/api/health`
- **Authentication**: `POST http://localhost:5000/api/auth/register|login`
- **Ads**: `GET/POST http://localhost:5000/api/ads`
- **Payments**: `POST http://localhost:5000/api/payments`
- **Admin**: `GET http://localhost:5000/api/admin`
- **Moderation**: `POST http://localhost:5000/api/moderation`

## Project Features

### Frontend (Next.js)
- ✅ User authentication (login/register)
- ✅ Ad browsing and creation
- ✅ Payment processing
- ✅ User dashboards (client, moderator, admin)
- ✅ Real-time notifications
- ✅ Analytics charts

### Backend (Express.js)
- ✅ User management with JWT authentication
- ✅ Ad management with approval workflow
- ✅ Payment verification
- ✅ Role-based access control (RBAC)
- ✅ Content moderation
- ✅ Scheduled tasks (cron jobs)
- ✅ Error handling middleware

### Shared
- ✅ TypeScript schemas with Zod validation
- ✅ Shared types and interfaces
- ✅ Constants (ad status, package types, roles)

## Key Libraries

### Frontend
- **Next.js 16** - React framework
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **Chart.js** - Analytics visualization
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

### Backend
- **Express 5** - Web framework
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Zod** - Schema validation
- **Node Cron** - Scheduled tasks
- **Supabase.js** - Database client

## TypeScript Configuration

The project uses a monorepo structure with shared TypeScript configuration:

```json
{
  "baseUrl": ".",
  "paths": {
    "@shared/*": ["shared/*"],
    "@client/*": ["client/src/*"]
  }
}
```

This allows importing with these aliases:
```typescript
import { AdStatus } from '@shared/constants/adStatus';
import { normalizeMediaUrl } from '@client/utils/mediaNormalizer';
```

## Troubleshooting

### Port Already in Use
If port 5000 or 3000 is already in use:
```bash
# Change port for server
PORT=5001 npm run dev:server

# Change port for client (in client folder)
cd client && next dev -p 3001
```

### Module Resolution Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check your Supabase project status
- Ensure database tables are created

### TypeScript Errors
Ensure all imports use the path aliases:
- ❌ `import from '../../shared/types/ad'`
- ✅ `import from '@shared/types/ad'`

## Development Tips

### Hot Reload
- **Frontend**: Changes auto-reload in browser
- **Backend**: Changes auto-restart with ts-node-dev

### Database Debugging
Use Supabase Studio to:
- View and edit data
- Run SQL queries
- Monitor API logs

### API Testing
Test endpoints using:
- **Postman** (desktop app)
- **Thunder Client** (VS Code extension)
- **curl** (command line)

Example:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

## License

ISC

---

**Need help?** Check the specific component documentation or reach out to the development team.
