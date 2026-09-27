# 🌱 Green Acres Farm — Farm-to-Customer Marketplace (MERN)

Production-ready farm-to-home ordering platform. Customer store + Admin dashboard + realtime orders.

## Structure
- `backend/` — Express + MongoDB + Socket.IO + Razorpay + Cloudinary (see `backend/.env.example`)
- `frontend/` — React + Vite + Tailwind + Redux Toolkit + Persist + Socket.IO client

## Quick start
### Backend
```bash
cd backend
cp .env.example .env   # fill MONGO_URI, JWT_SECRET, CLIENT_URL, Cloudinary, Razorpay
npm install
npm run seed           # creates admin@farm.com / admin123 + categories + products
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

## Test flow (required)
1. Register as customer → login → browse `/shop`
2. Add to cart → checkout → add address → COD → place order
3. Login as admin (`admin@farm.com / admin123`) → Dashboard shows 🔔 New Order realtime
4. Admin: pending → confirmed → preparing → out_for_delivery → delivered
5. Customer order page updates live (no refresh) via Socket.IO
6. Online pay: choose UPI/Card → Razorpay checkout → signature verified on backend

## Deploy
1. Push to GitHub: `git init; git add .; git commit -m "Farm marketplace"; git branch -M main; git remote add origin <repo-url>; git push -u origin main`
2. Atlas → Network Access → add `0.0.0.0/0` (Render needs it).
3. Render → New + → Blueprint → select repo (`render.yaml` at root deploys `backend/`). Fill `MONGO_URI`, `CLIENT_URL` (after step 4), Cloudinary + Razorpay keys. Note the `https://<api>.onrender.com` URL.
4. Vercel → Add New Project → select repo, Root Directory = `frontend`. Env: `VITE_API_URL=https://<api>.onrender.com/api`. Deploy, note the `https://<store>.vercel.app` URL.
5. Render → set `CLIENT_URL=https://<store>.vercel.app` → redeploy (cookie + CORS + Socket.IO origins).
6. Verify: `/api/health` → register → order → admin status flow on the live URLs.
- Local dev keeps using the same Atlas DB (already seeded: `admin@farm.com / admin123`).

## Security notes
- JWT in HTTP-only cookie (+ optional Bearer for sockets), bcrypt hashing, role guard on `/admin/*` APIs, rate-limit, helmet, mongo-sanitize, backend recalculates totals & atomically decrements stock.
