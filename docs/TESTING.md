# Testing Instructions

This project doesn't include an automated test suite (Jest/Cypress) — the spec's scope was already very large, so this file gives you a **manual smoke-test checklist** that exercises every major flow, plus notes on where to add automated tests if you want them.

## 1. First-time setup sanity check
```bash
cd backend && npm install && npm run seed && npm run dev
# in a second terminal
cd frontend && npm install && npm run dev
```
Visit `http://localhost:5173` — the homepage should load with categories and product rails (seeded data).

## 2. Auth flow
- [ ] Register a new account → should auto-login and show your name in the navbar
- [ ] Logout → navbar shows "Login"
- [ ] Login with the seeded customer (`customer@shopmern.com` / `Customer@123`)
- [ ] Forgot password → check your SMTP inbox (e.g. Mailtrap) for the reset email, click the link, set a new password

## 3. Shopping flow
- [ ] Browse `/products`, use search, category filter, price filter, and sort — results should update
- [ ] Open a product, zoom the image, switch thumbnails, add a review (requires login)
- [ ] Add to wishlist (heart icon) — appears on `/wishlist`
- [ ] Add to cart, change quantity, apply coupon `SAVE10` — total should update
- [ ] Checkout → fill address → pay with Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC → should land on the order success page
- [ ] Also test **Cash on Delivery** checkout on a second order

## 4. Order tracking
- [ ] `/orders` shows both orders
- [ ] Open an order → tracking stepper shows "Processing"
- [ ] Cancel an order → status becomes "Cancelled", stock is restored (verify in admin product list)

## 5. Admin flow
Login as `admin@shopmern.com` / `Admin@12345`, visit `/admin`.
- [ ] Dashboard shows correct totals and a sales bar chart (place at least one paid order first)
- [ ] Products: create a product with 2+ images, edit it, delete it
- [ ] Categories: create/edit/delete a category
- [ ] Orders: change an order's status through each stage, refund a paid order
- [ ] Users: block a non-admin user, confirm that user can no longer log in, then unblock
- [ ] Reviews: delete a review from the moderation list

## 6. Security spot-checks
- [ ] Hitting an admin API route (e.g. `POST /api/products`) without a token → `401`
- [ ] Hitting it as a logged-in non-admin user → `403`
- [ ] Spamming `/api/auth/login` quickly → eventually rate-limited (`429`)

## Adding automated tests (optional next step)
- **Backend:** `jest` + `supertest` + `mongodb-memory-server` for API integration tests against each controller.
- **Frontend:** `vitest` + `@testing-library/react` for component tests; `Playwright` or `Cypress` for the end-to-end flows above.
