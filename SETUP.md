# SAMRUDDHI PETROLEUM - Complete Setup Guide

## Fresh Installation on New Laptop

This guide will help you set up the Samruddhi Petroleum DSM Shift Management System on a new laptop from scratch.

---

## STEP 1: Install System Dependencies

### 1.1 Install Node.js
- Download from: https://nodejs.org
- Choose **LTS version (v24.13.0 or higher)**
- Run the installer and follow prompts
- Verify installation:
  ```powershell
  node --version    # Should show v24.13.0 or higher
  npm --version     # Should show 10.x or higher
  ```

### 1.2 Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- Choose your operating system
- During installation:
  - Set password for `postgres` user to: `root`
  - Keep port as: `5432`
  - Verify installation by opening pgAdmin (comes with PostgreSQL)

### 1.3 Create Database
- Open **pgAdmin** (PostgreSQL administration tool)
- Create new database named: `samruddhi`
- Verify it appears in the databases list

---

## STEP 2: Clone and Setup Project

### 2.1 Clone Repository
```powershell
git clone https://github.com/Samruddhidargode/Samruddhi_Petroleum.git
cd "Samruddhi_Petroleum"
```

### 2.2 Setup Backend
```powershell
cd backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Setup database schema
npm run prisma:migrate

# Check if .env exists, if not, create from .env.example
# Windows PowerShell:
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

### 2.3 Setup Frontend
```powershell
cd ../frontend

# Install dependencies
npm install

# Build to verify everything compiles
npm run build
```

---

## STEP 3: Environment Configuration

### 3.1 Backend Configuration
In `backend/.env`, ensure these variables are set:

```env
# Database Connection
DATABASE_URL="postgresql://postgres:root@localhost:5432/samruddhi"

# JWT Secret (change to a strong random string in production)
JWT_SECRET="your-super-secret-key-change-this-in-production"

# Server Port
PORT=4000

# CORS Origins (allowed frontend URLs)
CORS_ORIGINS="http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174"
```

### 3.2 Frontend Configuration
No configuration needed - frontend reads from `environment.ts` and API endpoints.

---

## STEP 4: Run the Application

### Terminal 1 - Backend Server
```powershell
cd backend
npm run dev
# Should display: "API running on port 4000"
```

### Terminal 2 - Frontend Dev Server
```powershell
cd frontend
npm run dev
# Should display: "VITE v5.4.21 ready in ... ms"
# URL: http://localhost:5174 or http://localhost:5173
```

### 3. Open Browser
- Go to: `http://localhost:5174`
- You should see the Samruddhi Petroleum role selection page

---

## STEP 5: Test Login

### Test Credentials

**Admin User:**
- Username: `bhalchandrard`
- Password: `Bhalchandra@74`
- Role: ADMIN

**Manager User:**
- Username: `manager1`
- Password: `Manager@123`
- Role: MANAGER

**DSM User (Delivery Staff):**
- Username: `DSM001`
- Password: `DSM@123`
- Role: DSM

---

## TROUBLESHOOTING

### Issue: PostgreSQL Connection Refused
**Solution:**
- Ensure PostgreSQL service is running
- Check if password is correct: `root`
- Verify port 5432 is open
- In pgAdmin, verify database `samruddhi` exists

### Issue: npm command not found
**Solution:**
- Restart PowerShell/Terminal after Node.js installation
- Verify with: `npm --version`

### Issue: Frontend shows blank page
**Solution:**
- Check browser console for errors (F12)
- Ensure backend is running (check Terminal 1)
- Clear browser cache (Ctrl + Shift + Delete)

### Issue: Port 5173/5174 already in use
**Solution:**
```powershell
# Kill the process using the port (Windows PowerShell)
Get-Process | Where-Object {$_.Name -eq "node"} | Stop-Process -Force
```

### Issue: Prisma migration fails
**Solution:**
```powershell
cd backend
# Reset and recreate database
npx prisma migrate reset
npm run prisma:generate
```

---

## STEP 6: Production Build

### Build for Production
```powershell
cd frontend
npm run build

# Output will be in: frontend/dist/
```

### Run Production Backend
```powershell
cd backend
npm start  # Uses: node src/index.js
```

---

## Project Structure

```
Samruddhi_Petroleum/
├── frontend/                 # React 18 + Vite app
│   ├── src/
│   │   ├── pages/           # All page components
│   │   ├── components/      # Reusable components
│   │   ├── animations/      # Motion variants
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Custom middleware
│   │   ├── prisma/          # Database schema
│   │   └── index.js
│   ├── package.json
│   ├── .env                 # Environment variables
│   └── .env.example
└── requirements.txt         # All dependencies (this file)
```

---

## Key Ports & Endpoints

| Service | URL | Port |
|---------|-----|------|
| Frontend Dev | http://localhost:5174 | 5174 |
| Frontend Build | http://localhost:3000 | (production) |
| Backend API | http://localhost:4000 | 4000 |
| PostgreSQL | localhost | 5432 |

---

## Common API Endpoints

```
POST   /api/auth/login              # User login
GET    /api/analytics/dashboard     # Dashboard data
POST   /api/shifts/create           # Create shift
POST   /api/shifts/nozzle-draft     # Save nozzle data
POST   /api/shifts/submit           # Submit shift
GET    /api/shifts/draft/{id}       # Get shift draft
```

---

## Environment Variables Quick Reference

**Backend (.env):**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Backend server port (default: 4000)
- `CORS_ORIGINS` - Allowed frontend URLs

**Frontend:**
- No .env needed (reads from vite.config.js)
- API URL defaults to `http://localhost:4000`

---

## Next Steps

1. ✅ Verify both servers are running
2. ✅ Test login with provided credentials
3. ✅ Create test shift data
4. ✅ Review dashboard analytics
5. ✅ Customize for your deployment

---

## Support

For issues or questions:
1. Check TROUBLESHOOTING section above
2. Review error logs in terminal
3. Check browser console (F12)
4. Review `.env` configuration

---

**Last Updated:** April 21, 2026  
**Node Version Required:** v24.13.0+  
**Database:** PostgreSQL 13+  
**Status:** Production Ready
