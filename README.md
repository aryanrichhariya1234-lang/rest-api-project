# Scalable REST API with Authentication & Role-Based Access

A REST API built with **Node.js/Express + PostgreSQL**, featuring JWT auth
(access + refresh tokens), role-based access control (user/admin), and a
Products CRUD module — plus a **Next.js** frontend to exercise every endpoint.

## Stack
- **Backend**: Node.js (ES Modules), Express, MongoDB + Mongoose, JWT, bcrypt, express-validator
- **Frontend**: Next.js (App Router), Tailwind CSS
- **Docs**: Swagger (OpenAPI 3.0) + Postman collection

## Project structure
```
rest-api-project/
├── src/
│   ├── config/         # mongoose connection, seed, swagger config
│   ├── controllers/     # auth, products
│   ├── middleware/       # auth (JWT verify + role check), validation, error handler
│   ├── models/           # Mongoose schemas (User, RefreshToken, Product)
│   ├── routes/           # versioned routes (/api/v1/...)
│   ├── utils/            # jwt helpers, standard response format
│   ├── validators/       # express-validator rules
│   ├── app.js
│   └── server.js
├── frontend/             # Next.js app
│   └── src/
│       ├── app/            # /, /login, /register, /dashboard
│       ├── components/     # Navbar, Alert, ProductForm
│       ├── context/        # AuthContext (token storage, auto-refresh)
│       └── lib/api.js       # fetch wrapper with auto access-token refresh
├── docs/
│   ├── postman_collection.json
│   └── SCALABILITY.md
├── package.json
└── .env.example
```

## Setup

### 1. Backend
```bash
cd rest-api-project
npm install
cp .env.example .env       # fill in your MongoDB URI
npm run seed                 # optional: creates admin@example.com / Admin@1234
npm run dev                  # starts on http://localhost:5000
```

Requires a running MongoDB instance. Quick local option:
```bash
docker run --name mongo-rest-api -p 27017:27017 -d mongo:7
```
No migration step needed — Mongoose creates collections/indexes on first write.

API docs: **http://localhost:5000/api-docs**
Health check: **http://localhost:5000/health**

### 2. Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local   # points to http://localhost:5000/api/v1
npm run dev                          # starts on http://localhost:3000
```

Visit `http://localhost:3000` → Register → Login → Dashboard (create/edit/delete products).

## API overview (all under `/api/v1`)

| Method | Endpoint             | Auth        | Description                        |
|--------|-----------------------|-------------|-------------------------------------|
| POST   | `/auth/register`       | Public      | Register user                       |
| POST   | `/auth/login`           | Public      | Login, returns access + refresh JWT |
| POST   | `/auth/refresh`        | Public      | Exchange refresh token for new access token |
| POST   | `/auth/logout`         | Public      | Revoke a refresh token              |
| GET    | `/auth/me`               | Bearer      | Current user profile                |
| GET    | `/products`             | Bearer      | List (paginated, filter by category/search) |
| POST   | `/products`             | Bearer      | Create product                      |
| GET    | `/products/:id`         | Bearer      | Get one product                     |
| PUT    | `/products/:id`          | Bearer (owner/admin) | Update product        |
| DELETE | `/products/:id`         | Bearer (owner/admin) | Delete product        |
| DELETE | `/products/:id/force`   | Bearer (admin only)   | Admin-forced delete   |

All responses follow: `{ success, message, data?, meta?, errors? }`.

## Security practices implemented
- Passwords hashed with **bcrypt** (cost factor 12), never stored/returned in plaintext
- **JWT** access tokens (short-lived, 15m) + refresh tokens (7d, stored server-side so they can be revoked on logout)
- **RBAC**: `authorize('admin')` middleware; product update/delete also checks resource ownership
- **express-validator** on every input; centralized validation error formatting
- **helmet** (secure headers), **cors** (restricted to frontend origin), **express-rate-limit** (global + stricter on `/auth/login` & `/auth/register` to slow brute force)
- Mongoose schema validation + parameterized queries (no raw string concatenation) — prevents injection; `isMongoId()` validation on all `:id` params
- Request body size capped at 10kb

## Testing the API
Import `docs/postman_collection.json` into Postman, or use the Swagger UI at
`/api-docs`. The Postman collection auto-captures `accessToken`/`refreshToken`
from the Login request into collection variables for subsequent calls.

## Scalability
See [`docs/SCALABILITY.md`](docs/SCALABILITY.md) for the note on horizontal
scaling, caching (Redis), read replicas, and an optional microservices split.
