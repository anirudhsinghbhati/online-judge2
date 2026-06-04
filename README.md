# Code Runner MVP

Full-stack coding judge MVP with a React + Vite + Tailwind frontend, an Express backend, MySQL storage, and Judge0-backed C++ execution.

## Features

- User panel at `/`
- Admin panel at `/admin`
- Create, edit, delete, and list problems
- Up to 10 test cases per problem
- Monaco Editor with C++17 starter code
- Remote execution through Judge0 for run/submit flows
- No auth, no Docker, no contest features

## Prerequisites

- Node.js 18+
- MySQL 8+
- Access to the Judge0 instance at `http://65.0.173.238:2358`

## Setup

### 1. Create the database

Import the schema script:

```powershell
Get-Content backend/database/schema.sql | mysql -u root -p
```

If you prefer MySQL Workbench or phpMyAdmin, run the same script there.

### 2. Configure the backend

Copy `backend/.env.example` to `backend/.env` and update the MySQL values.

Optional Judge0 environment variables:

- `JUDGE0_API_URL` defaults to `http://65.0.173.238:2358`
- `JUDGE0_AUTH_TOKEN` if your Judge0 instance requires authentication
- `JUDGE0_AUTH_USER` if your Judge0 instance requires authorization
- `JUDGE0_LANGUAGE_ID` defaults to `54` for C++ (GCC 9.2.0)
- `JUDGE0_COMPILER_OPTIONS` defaults to `-std=c++17`

### 3. Install backend dependencies

```powershell
cd backend
npm install
npm run dev
```

The backend runs on `http://localhost:5000` by default.

### 4. Install frontend dependencies

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default and proxies `/api` requests to the backend.

## API

- `GET /api/problems`
- `GET /api/problems/:id`
- `POST /api/problems`
- `PUT /api/problems/:id`
- `DELETE /api/problems/:id`
- `POST /api/run`
- `POST /api/submit`

## Notes

- Code execution is delegated to Judge0.
- Submission verdicts include accepted, wrong answer, and compilation error results with testcase details.
