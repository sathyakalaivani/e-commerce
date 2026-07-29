# API Documentation

Base URL (local): `http://localhost:5000/api`

Authenticated requests: send `Authorization: Bearer <token>` header (token is returned on register/login and also set as an httpOnly cookie). Admin-only routes additionally require `role: "admin"` on the user.

All responses are JSON: `{ success: boolean, message?, ...data }`. Errors return an appropriate 4xx/5xx status with `{ success: false, message }`.

---

## Auth — `/api/auth`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/register` | — | `{ name, email, password }` → creates user, returns `{ token, user }` |
| POST | `/login` | — | `{ email, password }` → returns `{ token, user }` |
| POST | `/logout` | — | Clears auth cookie |
| POST | `/forgot-password` | — | `{ email }` → emails a reset link |
| POST | `/reset-password/:token` | — | `{ password }` → sets new password, logs in |

## Products — `/api/products`
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/` | — | Query: `keyword, category, brand, price[gte], price[lte], rating[gte], sort, page, limit` |
| GET | `/:id` | — | Returns `{ product, relatedProducts }` |
| POST | `/` | admin | `{ title, description, category, brand, price, discountPrice, stock, featured, images: [base64...] }` |
| PUT | `/:id` | admin | Same fields; `newImages: [base64...]` appends more images |
| DELETE | `/:id` | admin | Deletes product + its Cloudinary images |
| GET | `/featured/list` | — | Up to 8 featured products |
| GET | `/new-arrivals/list` | — | Latest 8 products |
| GET | `/best-sellers/list` | — | Top 8 by units sold |

## Categories — `/api/categories`
Standard CRUD: `GET /`, `GET /:id`, `POST /` (admin), `PUT /:id` (admin), `DELETE /:id` (admin). Body: `{ name, description, image: base64 }`.

## Cart — `/api/cart` (all routes require auth)
| Method | Route | Description |
|---|---|---|
| GET | `/` | Get current user's cart |
| POST | `/` | `{ productId, quantity }` — add/increment item |
| PUT | `/:productId` | `{ quantity }` — set exact quantity (0 removes) |
| DELETE | `/:productId` | Remove item |
| DELETE | `/clear` | Empty the cart |
| POST | `/coupon` | `{ code }` — applies `SAVE10`, `SAVE20`, or `WELCOME5` |

## Wishlist — `/api/wishlist` (auth required)
`GET /`, `POST /` (`{ productId }`), `DELETE /:productId`.

## Orders — `/api/orders` (auth required)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/create-payment-intent` | user | Creates a Stripe PaymentIntent for the current cart, returns `clientSecret` + price breakdown |
| POST | `/` | user | `{ shippingAddress, paymentMethod: "stripe"|"cod", stripePaymentIntentId? }` → creates order, decrements stock, clears cart |
| GET | `/my-orders` | user | Current user's orders |
| GET | `/` | admin | All orders |
| GET | `/:id` | owner/admin | Single order |
| PUT | `/:id/status` | admin | `{ status, note }` — one of `Processing, Shipped, Out for Delivery, Delivered, Cancelled` |
| PUT | `/:id/cancel` | owner/admin | Cancels + restocks items |
| PUT | `/:id/refund` | admin | Marks payment as refunded |

## Users — `/api/users` (auth required)
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/profile` | user | Current user |
| PUT | `/profile` | user | `{ name, phone, avatar }` |
| PUT | `/change-password` | user | `{ currentPassword, newPassword }` |
| POST | `/addresses` | user | Add address |
| PUT | `/addresses/:addressId` | user | Update address |
| DELETE | `/addresses/:addressId` | user | Delete address |
| GET | `/` | admin | List all users |
| DELETE | `/:id` | admin | Delete user |
| PUT | `/:id/block` | admin | Toggle block status |

## Reviews — `/api/reviews`
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/:productId` | user | `{ rating, comment }` — one review per user per product |
| PUT | `/:productId/:reviewId` | owner | Update own review |
| DELETE | `/:productId/:reviewId` | owner/admin | Delete a review |
| GET | `/` | admin | All reviews across all products |

## Admin — `/api/admin`
| Method | Route | Description |
|---|---|---|
| GET | `/dashboard` | `{ stats: {totalUsers, totalProducts, totalOrders, revenue}, salesChart, recentOrders }` |

## Health
`GET /api/health` → `{ success: true, message: "API is running" }`
