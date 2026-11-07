# Product & Authentication API

A REST API built with Express 5 and PostgreSQL. It provides product CRUD operations, product name search and pagination, and user registration and login.

> Despite the repository name, the API does not currently provide task-management endpoints.

## Features

- Create, list, search, retrieve, update, and delete products
- Paginate and filter product listings by name
- Register users with bcrypt-hashed passwords
- Log in using a username or email address
- Validate request data and use parameterized PostgreSQL queries

## Requirements

- Node.js and npm
- PostgreSQL
- A database with the tables described in [Database setup](#database-setup)

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and configure the database:

   ```dotenv
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_NAME=your_database_name
   SERVER_PORT=3000
   ```

   `SERVER_PORT` is optional and defaults to `3000`. Do not commit credentials or other secrets.

3. Create the required database tables and add at least one category (see below).

4. Start the server:

   ```bash
   npm start
   ```

The API is available at `http://localhost:3000` unless `SERVER_PORT` is set to another port. The PostgreSQL pool connects lazily when the first database query runs.

## Database setup

The application does not include migrations or seed data. It expects these tables and columns:

| Table | Required columns | Notes |
|---|---|---|
| `categories` | `id` | Categories are checked when creating or updating a product. |
| `products` | `id`, `name`, `description`, `price`, `stock`, `category_id` | `category_id` refers to an existing category. |
| `users` | `id`, `username`, `email`, `password_hash`, `role`, `created_at` | `username` and `email` should be unique. Registration relies on database defaults for `role` and `created_at`. |

For example, a compatible PostgreSQL schema can be created with:

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    category_id INTEGER NOT NULL REFERENCES categories(id)
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'USER',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO categories DEFAULT VALUES;
```

This is an example schema, not an included migration. Adjust it to your deployment's requirements while keeping the columns and defaults expected by the application.

## API reference

All request and response bodies use JSON unless noted otherwise.

### Authentication

#### `POST /api/auth/register`

Register a user.

```json
{
  "username": "sample_user",
  "email": "user@example.com",
  "password": "a-strong-password"
}
```

- Usernames must be 3–30 characters and contain only letters, numbers, `_`, or `-`.
- The email must be valid.
- Passwords must contain at least 8 characters.
- Success: `201 Created`, with `{ "success": true, "user": { "id", "username", "email", "role", "created_at" } }`.
- Invalid input: `400 Bad Request`.
- Duplicate username or email: `409 Conflict`.

#### `POST /api/auth/login`

Authenticate using a username or email. This endpoint returns user details; it does not issue a token or create a session.

```json
{
  "identifier": "sample_user",
  "password": "a-strong-password"
}
```

- Success: `200 OK`, with `{ "success": true, "user": { "id", "username", "email", "role" } }`.
- Missing or invalid input: `400 Bad Request`.
- Incorrect username/email or password: `401 Unauthorized`. The response uses a generic credential error.

### Products

#### `GET /api/products`

Return a raw JSON array of products, ordered by ID.

| Query parameter | Behavior |
|---|---|
| `limit` | Defaults to `10`. Must be a positive safe integer no greater than `100`; invalid values, including values over `100`, fall back to `10`. |
| `offset` | Defaults to `0`. Invalid or negative values fall back to `0`. |
| `q` | Optional name filter using case-insensitive partial matching. Blank or whitespace-only values do not filter. |

Example:

```bash
curl 'http://localhost:3000/api/products?limit=10&offset=0&q=keyboard'
```

#### `GET /api/products/:id`

Return one product. The ID must be a positive safe integer.

- Success: `200 OK`
- Invalid ID: `400 Bad Request`
- Product not found: `404 Not Found`

#### `POST /api/products`

Create a product.

```json
{
  "name": "Mechanical Keyboard",
  "description": "Compact wireless keyboard",
  "price": 89.99,
  "stock": 12,
  "category_id": 1
}
```

- `name` must be a non-empty string.
- `description` may be a string, `null`, or omitted.
- `price` must be a finite number greater than zero.
- `stock` must be a non-negative safe integer.
- `category_id` must be a positive safe integer that identifies an existing category.
- Success: `201 Created`, with the created product.
- Invalid input or a missing category: `400 Bad Request`.

#### `PUT /api/products/:id`

Replace a product's fields. The body must include `name`, `price`, `stock`, and `category_id`; `description` may be a string, `null`, or omitted. Field validation follows the rules for product creation.

- Success: `200 OK`, with the updated product.
- Invalid ID, body, or category: `400 Bad Request`.
- Product not found: `404 Not Found`.

#### `DELETE /api/products/:id`

Delete a product.

- Success: `204 No Content`
- Invalid ID: `400 Bad Request`
- Product not found: `404 Not Found`

Error response shapes are not fully consistent across endpoints: some validation errors are returned as arrays and others as objects. Clients should handle both forms.

## Project structure

```text
config/         PostgreSQL connection pool
constants/      HTTP status codes
controllers/    Request handling and response mapping
repositories/   Parameterized database queries
routes/         Product and authentication routes
services/       Product and authentication business logic
src/app.js      Express app and JSON body parsing
server.js       Router mounting, error handling, and server startup
```

## Development and tests

Run the application with `npm start`. The repository does not currently define an automated test suite; `npm test` is a placeholder and exits with an error.
