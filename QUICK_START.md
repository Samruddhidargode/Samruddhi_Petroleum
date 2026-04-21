# QUICK START GUIDE - Samruddhi Petroleum

## One-Command Setup (Recommended)

### Windows (PowerShell)
```powershell
# Run from project root directory
powershell -ExecutionPolicy Bypass -File setup.ps1
```

### Mac / Linux
```bash
# Run from project root directory
bash setup.sh
```

---

## Manual Setup (Step by Step)

### Backend Setup
```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend Setup (in new terminal)
```powershell
cd frontend
npm install
npm run dev
```

---

## Common Commands

### Development
```powershell
# Backend - Development mode with auto-reload
cd backend && npm run dev

# Frontend - Development server with HMR (Hot Module Reloading)
cd frontend && npm run dev

# Frontend - Build for production
cd frontend && npm run build

# Frontend - Preview production build
cd frontend && npm run preview
```

### Database
```powershell
# Create/update database schema from Prisma schema
cd backend && npm run prisma:migrate

# Generate Prisma client after schema changes
cd backend && npm run prisma:generate

# Reset database (CAUTION: deletes all data)
cd backend && npx prisma migrate reset
```

### Production
```powershell
# Backend - Production mode
cd backend && npm start

# Frontend - Build and serve
cd frontend && npm run build
# Then deploy the dist/ folder to your hosting
```

---

## Test Credentials

### Admin
```
Username: bhalchandrard
Password: Bhalchandra@74
```

### Manager
```
Username: manager1
Password: Manager@123
```

### DSM (Delivery Staff)
```
Username: DSM001
Password: DSM@123
```

---

## Port Reference

| Service | Port | URL |
|---------|------|-----|
| Frontend Dev | 5173/5174 | http://localhost:5174 |
| Backend API | 4000 | http://localhost:4000 |
| PostgreSQL | 5432 | localhost:5432 |

---

## Troubleshooting

### "Port already in use"
```powershell
# Find and kill Node processes
Get-Process node | Stop-Process -Force
```

### "npm: command not found"
- Restart PowerShell/Terminal after Node.js installation
- Or add npm to PATH manually

### "Cannot connect to PostgreSQL"
- Ensure PostgreSQL service is running
- Check connection: `psql -U postgres -h localhost`
- Verify database `samruddhi` exists

### "Frontend shows blank page"
- Check browser console (F12)
- Ensure backend is running on port 4000
- Clear browser cache and reload

### "Prisma migration failed"
```powershell
cd backend
npx prisma migrate reset
npm run prisma:generate
```

---

## Environment Configuration

**Backend (.env):**
```
DATABASE_URL=postgresql://postgres:root@localhost:5432/samruddhi
JWT_SECRET=your-secret-key
PORT=4000
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

**Frontend:**
- No .env needed
- API endpoint auto-configured to `http://localhost:4000`

---

## Project Structure

```
├── frontend/
│   ├── src/pages/          # All page components
│   ├── src/components/     # Reusable components
│   ├── src/animations/     # Motion definitions
│   └── package.json
├── backend/
│   ├── src/controllers/    # Business logic
│   ├── src/routes/         # API routes
│   ├── prisma/             # Database schema
│   └── package.json
├── requirements.txt        # All dependencies
├── SETUP.md               # Detailed setup guide
└── setup.ps1 / setup.sh   # Automated scripts
```

---

## File Checklist Before Running

- [ ] `backend/.env` exists with correct DATABASE_URL
- [ ] PostgreSQL running on localhost:5432
- [ ] Database `samruddhi` created
- [ ] Node.js v24+ installed
- [ ] npm v10+ installed

---

## First Run Checklist

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev` (new terminal)
3. Open: http://localhost:5174
4. Login with admin credentials
5. Navigate to Dashboard
6. Create test shift data
7. Verify all features working

---

## Useful Links

- Node.js: https://nodejs.org
- PostgreSQL: https://www.postgresql.org
- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- Prisma Docs: https://www.prisma.io/docs

---

**Need Help?**
- Check SETUP.md for detailed instructions
- Review browser console (F12) for errors
- Check terminal output for error messages
- Verify environment variables in .env

**Last Updated:** April 21, 2026
