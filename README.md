# Samruddhi Petroleum DSM Shift & MDU Management System

Full-stack monorepo with:
- frontend: React + Tailwind (Vite)
- backend: Node.js + Express + Prisma
- database: PostgreSQL (configure via DATABASE_URL)

## Setup

### 1) Backend

- Copy backend/.env.example to backend/.env and set DATABASE_URL and JWT_SECRET.
- Install dependencies:
  - npm install (inside backend)
- Prisma:
  - npx prisma generate
  - npx prisma migrate dev --name init
- Run:
  - npm run dev

### 2) Frontend

- Install dependencies:
  - npm install (inside frontend)
- Run:
  - npm run dev

## Notes

- Image upload is expected to be handled by Cloudinary/S3; backend accepts URLs.
- Excel export is stubbed for now.
- i18n scaffolding is included; translations can be expanded.

## Default Admin Login

- Username: bhalchandrard
- Password: Bhalchandra@74

Admin can create DSM/Manager users via the API:
- POST /api/admin/users
- GET /api/admin/users
