# Bitespeed Backend Task — Identity Reconciliation

## Overview

This service implements the **Identity Reconciliation API** required by the Bitespeed backend assignment.

Live: https://bitespeed-assignment-eta.vercel.app

---

# Tech Stack

Backend

- Node.js
- TypeScript
- Express

Database

- PostgreSQL (Neon)

ORM

- Drizzle ORM

Logging

- Morgan

Development tooling

- tsx
- drizzle-kit
- pnpm

---

# Project Structure

```
src
 ├── db
 │   ├── index.ts
 │   └── schema.ts
 │
 ├── routes
 │   └── identifyRoute.ts
 │
 ├── services
 │   └── identifyService.ts
 │
 └── index.ts
```

### Responsibilities

`db/schema.ts`
Defines the database schema using Drizzle.

`db/index.ts`
Initializes the PostgreSQL connection.

`routes/identifyRoute.ts`
Defines the `/identify` HTTP endpoint.

`services/identifyService.ts`
Contains the core identity reconciliation logic.

`index.ts`
Application entry point.

---

# Database Schema

Table: `contacts`

| Column          | Type                         |
| --------------- | ---------------------------- |
| id              | SERIAL PRIMARY KEY           |
| email           | TEXT                         |
| phone_number    | TEXT                         |
| linked_id       | INTEGER                      |
| link_precedence | ENUM ('primary','secondary') |
| created_at      | TIMESTAMP                    |
| updated_at      | TIMESTAMP                    |
| deleted_at      | TIMESTAMP                    |

---

# Local Setup

## 1 Install dependencies

```
pnpm install
```

This installs all project dependencies defined in `package.json`.

---

## 2 Configure environment variables

Create a `.env` file:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
PORT=3000
```

---

## 3 Push schema to database

```
pnpm db:push
```

This command:

- reads the schema from `src/db/schema.ts`
- generates SQL
- creates tables in the connected database

---

## 4 Run development server

```
pnpm dev
```

This runs:

```
tsx --watch src/index.ts
```

which starts the server with automatic reload.

---

## 5 Build the project

```
pnpm build
```

This runs the TypeScript compiler and outputs compiled files to `dist/`.

---

## 6 Start production server

```
pnpm start
```

This runs:

```
node dist/index.js
```
