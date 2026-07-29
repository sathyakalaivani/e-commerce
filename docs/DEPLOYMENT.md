# Deployment Guide

## Overview
- **Frontend** → Vercel
- **Backend** → Render
- **Database** → MongoDB Atlas
- **Images** → Cloudinary
- **Payments** → Stripe (live keys)
- **Email** → any SMTP provider (e.g. SendGrid, Mailgun, Postmark)

---

## 1. MongoDB Atlas
1. Create a free cluster at https://cloud.mongodb.com.
2. Database Access → add a user with a strong password.
3. Network Access → allow access from anywhere (`0.0.0.0/0`) or Render's IPs.
4. Copy the connection string — this is your `MONGO_URI`.

## 2. Backend on Render
1. Push this repo to GitHub.
2. On https://render.com, click **New → Web Service**, connect the repo, and set **Root Directory** to `backend`.
3. Build command: `npm install`. Start command: `npm start`.
4. Add environment variables from `backend/.env.example` (use your real Atlas URI, a long random `JWT_SECRET`, Cloudinary/Stripe/SMTP keys, and set `CLIENT_URL` to your Vercel frontend URL once deployed).
5. Deploy. Note the resulting URL, e.g. `https://shopmern-api.onrender.com`.
6. Run the seed script once via Render's shell tab: `npm run seed`.

## 3. Frontend on Vercel
1. On https://vercel.com, **New Project**, import the repo, set **Root Directory** to `frontend`.
2. Framework preset: Vite. Build command: `npm run build`. Output directory: `dist`.
3. Add environment variable `VITE_STRIPE_PUBLISHABLE_KEY`.
4. Since Vite's dev proxy only works locally, add a rewrite so `/api/*` calls reach Render. Create `frontend/vercel.json`:
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "https://shopmern-api.onrender.com/api/:path*" }
     ]
   }
   ```
5. Deploy. Copy the resulting URL and set it as `CLIENT_URL` in Render's env vars (then redeploy the backend so CORS allows it).

## 4. Stripe (going live)
Switch to live API keys in the Stripe dashboard, update `STRIPE_SECRET_KEY` (backend) and `VITE_STRIPE_PUBLISHABLE_KEY` (frontend). Configure a webhook endpoint pointing to your backend (e.g. `/api/orders/webhook`, which you'll need to add) using `STRIPE_WEBHOOK_SECRET` for production-grade async payment confirmation — the included flow uses client-side confirmation, which is fine for testing/demo but a webhook is recommended for production reliability.

## 5. Post-deploy checklist
- [ ] Visit `/api/health` on the Render URL — should return `{ success: true }`
- [ ] Register a test account on the live frontend
- [ ] Place a test order with Stripe test card `4242 4242 4242 4242`
- [ ] Confirm the order appears in `/admin/orders` when logged in as the seeded admin
- [ ] Update the seeded admin password immediately after first login in production
