# ShopMERN — Full-Stack MERN E-Commerce Platform

A complete e-commerce web application built with **MongoDB, Express, React (Vite), and Node.js**, featuring a customer storefront and a separate admin dashboard.

> 📌 **Honesty note on scope:** this is a real, working full-stack app covering every core flow end-to-end (auth, catalog, cart, wishlist, checkout with Stripe, orders/tracking, reviews, and a full admin CRUD dashboard). A couple of "nice-to-have" items from a large feature wishlist are intentionally simplified rather than faked — see **"What's simplified"** below — so you get code you can actually trust and extend, not silent placeholders.

---

## ✨ Features

### Customer
Home page (hero, categories, featured/new/best-seller rails), full product catalog with search/filter/sort/pagination, product details with gallery zoom + related products, reviews, wishlist, cart with coupon codes, Stripe **or** Cash-on-Delivery checkout, order history + step tracker + cancellation, profile with multiple saved addresses, dark mode, toast notifications, loading skeletons, responsive mobile menu, breadcrumbs, recently-viewed products, newsletter signup.

### Admin (`/admin`, requires `role: admin`)
Dashboard (users/products/orders/revenue + 14-day sales chart), full product CRUD with multi-image upload to Cloudinary, category CRUD, order management (status updates, cancel, refund), user management (block/unblock, delete), review moderation.

---

## 🧱 Tech Stack
| Layer | Tech |
|---|---|
| Frontend | React 18 (Vite), React Router v6, Axios, Tailwind CSS, react-hot-toast, react-icons |
| Backend | Node.js, Express.js, Mongoose |
| Auth | JWT (httpOnly cookie + Bearer header), bcrypt |
| Images | Cloudinary (uploaded as base64 from the client) |
| Payments | Stripe (PaymentIntents + Elements) |
| Email | Nodemailer (password reset) |

---

## 📁 Project Structure
```
ecommerce/
├── backend/
│   ├── config/          # db.js, cloudinary.js
│   ├── models/           # User, Product, Category, Cart, Wishlist, Order (with embedded reviews)
│   ├── controllers/      # business logic, one file per resource
│   ├── routes/           # Express routers, one file per resource
│   ├── middleware/        # auth (JWT), admin guard, multer, error handler
│   ├── utils/             # generateToken, sendEmail, ApiFeatures (search/filter/sort/paginate)
│   ├── seed/seedData.js  # sample admin/customer/categories/products
│   └── server.js
├── frontend/
│   └── src/
│       ├── api/axios.js           # shared Axios instance w/ interceptors
│       ├── context/                # Auth, Cart, Wishlist, Theme (Context API)
│       ├── hooks/                  # useDebounce, useRecentlyViewed
│       ├── components/             # Navbar, Footer, ProductCard, Modal, Pagination, etc.
│       ├── pages/                  # storefront pages
│       └── pages/admin/            # admin dashboard pages + layout
└── docs/                            # API docs, deployment guide, testing guide, Postman collection
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- A MongoDB connection string (local `mongod` or [MongoDB Atlas](https://www.mongodb.com/atlas))
- Free accounts (optional, for full functionality): [Cloudinary](https://cloudinary.com), [Stripe](https://stripe.com) (test mode), an SMTP provider like [Mailtrap](https://mailtrap.io) for email testing

### 2. Backend setup
```bash
cd backend
npm install
cp .env.example .env      # then fill in your MONGO_URI, JWT_SECRET, Cloudinary, Stripe, SMTP keys
npm run seed               # creates an admin user, a demo customer, categories & sample products
npm run dev                 # starts the API on http://localhost:5000
```

### 3. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env       # add your Stripe publishable key
npm run dev                  # starts the app on http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000` (see `vite.config.js`), so no CORS config is needed locally.

### 4. Login
After seeding:
- **Admin:** `admin@shopmern.com` / `Admin@12345` → visit `/admin`
- **Customer:** `customer@shopmern.com` / `Customer@123`

---

## 🔐 Security measures implemented
JWT auth (httpOnly cookie + Bearer header support), bcrypt password hashing, route-level `protect`/`admin` middleware, Helmet, CORS locked to `CLIENT_URL`, express-rate-limit on all `/api` routes, Mongoose schema validation, centralized error handler that never leaks stack traces in production, `.env`-based secrets (never committed).

---

## ⚠️ What's simplified (be aware before treating this as "done")
Being upfront about where this diverges from the literal "everything, perfectly, with no placeholders" spec:

- **Coupons** are a small hardcoded map (`SAVE10`, `SAVE20`, `WELCOME5`) in `cartController.js` rather than their own database-backed model with expiry/usage-limits — trivial to extend into a `Coupon` model if you need that.
- **Infinite scroll** was explicitly marked optional in the spec — pagination is implemented instead (also more accessible and easier to deep-link).
- **Sales chart** is a lightweight dependency-free CSS bar chart rather than a charting library — swap in `recharts` or `chart.js` if you want richer chart types.
- **Stripe webhook handling** (for async payment confirmation) isn't wired up — the current flow confirms payment client-side via `confirmCardPayment` and creates the order immediately after, which works for the test flow but a production system should also verify via a `/webhook` endpoint using `STRIPE_WEBHOOK_SECRET` (env var is already scaffolded for this).
- **Email templates** are plain inline HTML strings (functional, not designed) — swap in a template engine or MJML if you want branded emails.
- I have not run `npm install` / a live server in this environment (no network access here), so while every file passed a syntax check (`node --check` on the backend, `tsc --noEmit` across all frontend files), you should run through **Testing Instructions** in `docs/TESTING.md` after your first `npm install` to catch anything a static check can't, like a typo'd Mongoose ref or an env var name mismatch.

---

## 📚 More docs
- [`docs/API.md`](docs/API.md) — full REST API reference
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — deploying to Vercel + Render + Atlas
- [`docs/TESTING.md`](docs/TESTING.md) — manual test checklist
- [`docs/postman_collection.json`](docs/postman_collection.json) — importable Postman collection

## License
MIT — free to use and modify for personal or commercial projects.
