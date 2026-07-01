# Scalability & Deployment Notes

## Current architecture
Single Express instance, stateless JWT auth, MongoDB (via Mongoose) for
persistence. Stateless access tokens mean any instance can validate a request
without a shared session store, which is what makes the horizontal scaling
below straightforward.

## Horizontal scaling
- Run multiple Node instances (PM2 cluster mode or multiple containers) behind a
  load balancer (Nginx, AWS ALB, or similar). No sticky sessions needed since
  auth is stateless JWT.
- Refresh tokens are the only stateful piece (stored in MongoDB) — any instance
  can validate them against the shared DB, so this doesn't break horizontal scaling.

## Database scaling
- MongoDB replica set for read scaling once read traffic (GET /products)
  dominates — route reads to secondaries (`readPreference: secondaryPreferred`),
  writes to the primary.
- Move to a sharded cluster (shard key on `category` or `createdBy`) if the
  products collection grows past what a single replica set comfortably handles.
- Mongoose connection pooling is already in place (default pool size 100) — tune
  `maxPoolSize` per instance based on cluster capacity.
- Add compound indexes as query patterns emerge (e.g. `{ category: 1, createdAt: -1 }`
  for filtered, sorted listings); the text index on name/description already
  supports the search endpoint.
- Refresh tokens already use a TTL index (`expireAfterSeconds: 0`) so MongoDB
  auto-purges expired tokens — no manual cleanup job needed.

## Caching
- Redis in front of `GET /products` and `GET /products/:id` (cache-aside pattern,
  TTL-based invalidation on writes) — same pattern already used in PeoplesPost's
  Redis layer. This is the highest-leverage addition for a read-heavy CRUD API.
- Rate limiting (currently in-memory per-instance) should move to a Redis-backed
  store (e.g. `rate-limit-redis`) once running multiple instances, so limits are
  enforced globally rather than per-instance.

## Microservices path
- At current scale, a modular monolith (as built) is the right call — routes,
  controllers, and models are already separated so auth and products could be
  split into separate services later without a rewrite, only if scale demands it.
- If split: Auth service owns users/tokens; Product service owns products and
  validates JWTs locally (no cross-service call needed, since JWT verification
  only needs the shared secret/public key).

## Observability & deployment
- Structured logging (replace morgan with pino/winston in production) + a
  centralized log sink (CloudWatch, ELK).
- Dockerize both services (backend + Postgres) via docker-compose for local dev
  parity with production.
- Health check endpoint (`/health`) already included — wire into load balancer
  health checks and container orchestration liveness probes.
