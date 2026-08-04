# Cafe Billing System

A full-stack DBMS college project — Node.js + Express backend, React (Vite) frontend, MySQL database.

## Team
- Backend: [your name]
- Frontend: Raghav
- [Sakshi's role here]

## Structure
```
backend/    Express API, MySQL queries, schema, triggers
frontend/   React (Vite) app
```

See `Cafe_Billing_System_Project_Plan.md` for the full API contract, ER model reasoning, and build order.

## Backend Setup
```bash
cd backend
npm install
cp .env.example .env      # fill in your MySQL credentials
mysql -u root -p < sql/schema.sql
npm run dev                # starts on http://localhost:5000
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev                 # starts on http://localhost:5173
```

Frontend dev server proxies `/api` calls to `http://localhost:5000` (see `vite.config.js`).

## API Contract
All endpoints documented in `Cafe_Billing_System_Project_Plan.md`, Section 3. Do not rename fields or routes without updating that doc and telling the team first — since we're using AI to generate code independently, this is what keeps everyone's output compatible.
