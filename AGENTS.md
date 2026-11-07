# AGENTS.md

## What this is

Small Express 5 (CommonJS) + PostgreSQL API. Despite the directory name, only a **products** domain exists — there is no task/user/auth code.

Request flow: `server.js` → `src/app.js` → `routes/routes.products.js` → `controllers/controller.products.js` → `services/service.products.js` → `repositories/repository.product.js` → `config/db.js` (shared `pg` Pool).

## Commands

- Install: `npm install`
- Run: `npm start` (`node server.js`), listening on `SERVER_PORT` or `3000`
- Reload during dev: `npx nodemon server.js` (nodemon is installed, but there is no `dev` script)
- No build step, tests, lint, formatter, typecheck, or CI in this repo. `npm test` is a placeholder that always exits 1 — do not treat it as verification. Verify changes with manual HTTP requests against a running server and database.

## Setup and database

- Env keys: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SERVER_PORT`. A populated `.env` already exists; do not overwrite it or print its secrets.
- There are **no migrations, schema, or seed files** in the repo. The API assumes pre-existing PostgreSQL tables:
  - `products(id, name, description, price, stock, category_id)`
  - `categories(id)`
- Categories can only be inserted directly into the DB — there are no category endpoints.
- Startup does not validate DB connectivity; `pool` connects lazily on the first query. There is no custom error middleware, and Express 5 auto-forwards rejected async handlers, so DB errors become the default 500 response.

## Architecture quirks

- The app is assembled in two places: middleware in `src/app.js` (`module.exports = { app }`), and routers mounted in `server.js` before `listen`. Mount any new router in `server.js`, not `app.js`.
- File names are asymmetric: plural `routes/routes.products.js`, but singular `controllers/controller.products.js`, `services/service.products.js`, and `repositories/repository.product.js`. Keep exact require paths.
- Unused placeholder dirs `db/`, `middleware/`, `models/`, `utils/` are empty; don't assume implementations live there.
- Services use sentinel values instead of throwing: e.g. `{ error: "CATEGORY_NOT_FOUND" }`, translated to HTTP 400 by controllers. Repositories use parameterized `pool.query`; import the pool via `const { pool } = require("../config/db")`.

## API behavior to preserve

- Mount point: `/api/products`; handlers: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`.
- IDs and `category_id` must be positive safe integers; `price` finite and > 0; `stock` safe integer >= 0; `description` optional string or null. `PUT` replaces the full resource (name, price, stock, category_id required).
- Pagination: `limit` must be a positive safe integer <= 100, otherwise it falls back to 10 (values over 100 are not clamped); invalid `offset` falls back to 0. `q` filters product names with `ILIKE` (non-string `q` is a 400; blank/whitespace means no filter). List responses are raw arrays, not `{ data, total }` envelopes.
- Status codes: 400 validation/bad category, 404 missing product, 201 create, 204 delete.
- Response shapes are inconsistent: some errors are arrays (`[{ message }]`), others plain objects (`{ message }`). Match the endpoint being edited rather than normalizing globally.
- Route params and query values arrive as strings; controllers convert with `Number` and reject invalid values.
