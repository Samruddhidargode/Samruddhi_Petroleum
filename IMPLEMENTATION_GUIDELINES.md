# 🧭 Samruddhi Petroleum — Implementation & Quality Guidelines

## 🎯 Objective

Build the DSM Shift & MDU Management System **exactly as per PRD** with:

* Clean, attractive UI
* Correct business logic
* Fully working backend ↔ frontend integration
* Tested APIs
* Production-ready deployment

No shortcuts. No mock data. No broken flows.

---

## 🧱 1. Mandatory Tech Stack

| Layer         | Tech                 |
| ------------- | -------------------- |
| Frontend      | React + Tailwind CSS |
| Backend       | Node.js + Express    |
| Database      | PostgreSQL           |
| ORM           | Prisma               |
| Image Storage | Cloudinary           |
| Charts        | Recharts             |
| Excel Export  | SheetJS              |
| Auth          | JWT                  |

Do not change stack.

---

## 📐 2. Follow PRD Strictly

All features must map to PRD:

* Section A (Nozzle + Pump Test + Own Use)
* Section B (Cash Drops anytime)
* Section C (QR, Card, Fleet, Party Credit with receipts)
* Shift reconciliation logic
* MDU as separate module
* Admin/Manager dashboards
* Language toggle

If a screen/logic is not in PRD → do not invent.

---

## 🎨 3. Frontend Requirements

* Card-based layout
* Mobile-first responsive design
* Big inputs for DSM
* Step wizard flow:

  ```
  Start → Sales → Cash → Payments → Summary
  ```
* Language toggle (EN / Marathi / Hindi)
* Live running totals everywhere
* Color indicators for difference (green/red)
* Clean, modern UI (no clutter)

DSM should be able to use this without training.

---

## 🔌 4. Backend API Rules

* RESTful APIs
* Proper status codes
* Input validation on every endpoint
* Error handling middleware
* JWT authentication middleware
* Role-based access (DSM / Manager / Admin)

---

## 🗄 5. Database Rules (Prisma)

* Proper relations between tables
* Use migrations (no manual DB edits)
* Timestamps on all records
* No image blobs in DB — store URLs only

---

## 🧪 6. API Testing (Mandatory)

Every API must be tested using:

* Postman or Thunder Client

Test cases required:

* Create shift
* Add nozzle entries
* Add drops
* Add payments
* Submit shift
* Fetch shift (manager/admin)
* MDU flow
* Image upload

No endpoint should be untested.

---

## 🔗 7. Frontend ↔ Backend Integration Checks

Before marking complete:

* All forms actually save to DB
* Data fetched correctly in dashboards
* Receipts visible after upload
* Reconciliation values correct
* Admin edit reflects in DB

No hardcoded values.

---

## 🔐 8. Authentication & Security

* Passwords hashed (bcrypt)
* JWT expiry
* Protected routes
* Role middleware

---

## 📊 9. Dashboard & Analytics

Admin/Manager dashboard must show:

* Sales by shift
* Fuel split (HSD/MS)
* Payment mode split
* Point-wise sales
* DSM mismatch history
* MDU stats

Charts must use real DB data.

---

## 📤 10. Excel Export

* Export shift data by date range
* Export MDU data
* Proper column headers

---

## ☁️ 11. Production Readiness

* `.env` for secrets
* Cloudinary keys in env
* Database URL in env
* Build scripts
* No console logs
* Proper folder structure

---

## 🚀 12. Deployment Target

* Frontend → Vercel / Netlify
* Backend → Render / Railway
* Database → Supabase / Neon (Postgres)

App should run live without local setup.

---

## ✅ 13. Definition of Done (DoD)

Project is complete only if:

* DSM can complete a full shift without errors
* Admin can see it in dashboard
* Receipts open correctly
* Difference calculation is correct
* MDU EOD works
* All APIs tested
* App deployed and live

---

## ❌ What is NOT acceptable

* UI that looks like a form dump
* Broken calculations
* Manual DB edits
* Unused endpoints
* Dummy dashboards
* Hardcoded data

---

## 🧠 Guiding Principle

> This is an accounting system. Accuracy > speed.
