Here is a **proper `README.md` file format** (clean Markdown, ready to paste into GitHub):

```md
# 📌 DevPulse – Internal Tech Issue Tracker

A collaborative backend system for reporting bugs, tracking issues, and managing feature requests in software teams.

Built with **Node.js, Express, TypeScript, and PostgreSQL (raw SQL only)**.

---

## 🚀 Features

- 🔐 JWT Authentication system
- 👥 Role-based access (Contributor / Maintainer)
- 🐛 Create bug & feature requests
- 📋 View all issues with filters & sorting
- 🔄 Update issue workflow status
- 🧑 Reporter tracking system
- ⚡ Secure password hashing (bcrypt)
- 🧠 Clean modular architecture

---

## 🛠 Tech Stack

- Node.js (v24+)
- Express.js
- TypeScript
- PostgreSQL (NeonDB)
- Raw SQL (no ORM / query builders)
- bcrypt
- jsonwebtoken
- http-status-codes

---

## 📁 Project Structure
```

src/
├── config/
├── db/
├── interfaces/
├── middleware/
├── modules/
│ ├── auth/
│ └── issues/
├── utils/
├── types/
├── app.ts
└── server.ts

````

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/devpulse.git
cd devpulse
````

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup environment variables

Create a `.env` file:

```env
PORT=5000
DATABASE_URL=your_neon_postgres_url
JWT_SECRET=your_secret_key
BCRYPT_SALT_ROUNDS=10
```

---

### 4. Run the project

#### Development

```bash
npm run dev
```

#### Production

```bash
npm run build
npm start
```

---

## 🗄 Database Schema

### Users Table

- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- email (UNIQUE)
- password (hashed)
- role (contributor | maintainer)
- created_at
- updated_at

### Issues Table

- id (SERIAL PRIMARY KEY)
- title (VARCHAR)
- description (TEXT)
- type (bug | feature_request)
- status (open | in_progress | resolved)
- reporter_id
- created_at
- updated_at

---

## 🔐 Authentication Flow

1. User registers → `/api/auth/signup`
2. User logs in → `/api/auth/login`
3. JWT token is returned
4. Token is sent in headers:

```http
Authorization: <JWT_TOKEN>
```

5. Middleware verifies token before protected routes

---

## 📡 API Endpoints

### Auth Routes

#### Register

```http
POST /api/auth/signup
```

#### Login

```http
POST /api/auth/login
```

---

### Issue Routes

#### Create Issue (Auth required)

```http
POST /api/issues
```

#### Get All Issues

```http
GET /api/issues?sort=newest&type=bug&status=open
```

#### Get Single Issue

```http
GET /api/issues/:id
```

#### Update Issue

```http
PATCH /api/issues/:id
```

#### Delete Issue (Maintainer only)

```http
DELETE /api/issues/:id
```

---

## 👥 Roles & Permissions

### Contributor

- Create issues
- View issues
- Update own open issues

### Maintainer

- Full access to all issues
- Update any issue
- Delete any issue

---

## 📊 API Response Format

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Error message",
  "errors": "Details"
}
```

---

## 🚨 HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 204  | No Content            |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 409  | Conflict              |
| 500  | Internal Server Error |

---

## 🧠 Rules Followed

- No ORM (only raw SQL)
- No query builders
- Strict TypeScript
- Modular architecture
- JWT authentication
- Role-based authorization

---

## 📦 Scripts

```bash
npm run dev
npm run build
npm start
```

---

## 👨‍💻 Author

DevPulse Backend Project – Level 2 Assignment

---

## 📌 Notes

- Ensure PostgreSQL is connected
- Run database initialization before API calls
- Always include JWT for protected routes

```

---

If you want next step, I can also:
- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- or :contentReference[oaicite:2]{index=2}
```
