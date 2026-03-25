# AuthCore - Authentication Server

> University Deeptech Project - FastAPI + React - JWT - bcrypt - RBAC

---

## Project Overview

AuthCore is a production-grade authentication server showcasing industry-standard security patterns and best practices:

- **JWT-based authentication** with short-lived access tokens (30 min) and long-lived refresh tokens (7 days)
- **bcrypt password hashing** at cost factor 12, ensuring over 4096 key-derivation rounds for maximum security
- **Role-Based Access Control (RBAC)** with three permission tiers: admin, moderator, and user
- **Token blacklisting** for secure logout and session invalidation
- **Brute-force protection** with account lockout after 5 failed login attempts
- **Comprehensive audit logging** tracking every authentication event with IP addresses and user-agent data

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│  Zustand Store (memory-only)  │  Axios + Interceptors          │
└───────────────────────────────┼─────────────────────────────────┘
                                │ HTTP + Bearer Token
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI (Port 8000)                          │
│                                                                 │
│  CORS Middleware (http://localhost:5173)                        │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Auth Routes │    │  Protected   │    │  JWT + bcrypt    │  │
│  │ /register   │    │  /profile    │    │  auth.py         │  │
│  │ /login      │    │  /admin/*    │    │                  │  │
│  │ /logout     │    │  /moderator/ │    │  SECRET_KEY      │  │
│  │ /refresh    │    │              │    │  ALGORITHM=HS256  │  │
│  └─────────────┘    └──────────────┘    └──────────────────┘  │
│         │                  │                                    │
│         └──────────────────┘                                   │
│                   │                                             │
│                   ▼                                             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              SQLite Database (auth.db)                   │  │
│  │  users │ token_blacklist │ audit_logs                    │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer      | Technology                          | Version   |
|------------|-------------------------------------|-----------|
| Backend    | Python / FastAPI                    | 3.11 / 0.110.0 |
| Database   | SQLite / SQLAlchemy                 | 2.0.29    |
| Auth       | python-jose (JWT) / passlib (bcrypt)| 3.3.0 / 1.7.4 |
| Validation | Pydantic v2                         | 2.6.4     |
| Server     | Uvicorn                             | 0.29.0    |
| Frontend   | React 18 / Vite                     | 18.2.0    |
| Styling    | TailwindCSS                         | 3.4.1     |
| State      | Zustand                             | 4.5.2     |
| Animation  | Framer Motion                       | 11.0.8    |
| Charts     | Recharts                            | 2.12.2    |
| UI         | Radix UI                            | latest    |
| HTTP       | Axios                               | 1.6.7     |

---

## Setup Instructions

### Backend Setup

```bash
# 1. Navigate to backend directory
cd auth-server/backend

# 2. Create a virtual environment
python3 -m venv venv
source venv/bin/activate       # Linux/Mac
# OR: venv\Scripts\activate    # Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Seed the database with demo users and fake audit logs
python seed.py

# 5. Start the development server
python main.py
# Server runs at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Frontend Setup

```bash
# 1. Navigate to frontend directory
cd auth-server/frontend

# 2. Install npm dependencies
npm install

# 3. Start Vite dev server
npm run dev
# App runs at http://localhost:5173
```

### Running Both Together

Open two terminal windows:

```bash
# Terminal 1 — Backend
cd auth-server/backend && python main.py

# Terminal 2 — Frontend
cd auth-server/frontend && npm run dev
```

---

## API Reference

| Method   | Endpoint                   | Auth     | Role        | Description                    |
|----------|----------------------------|----------|-------------|--------------------------------|
| `GET`    | `/`                        | No       | —           | Health check + API info        |
| `POST`   | `/register`                | No       | —           | Create new user account        |
| `POST`   | `/login`                   | No       | —           | Authenticate, receive tokens   |
| `POST`   | `/logout`                  | Bearer   | any         | Blacklist token, log event     |
| `POST`   | `/refresh-token`           | No       | —           | Exchange refresh for new access|
| `GET`    | `/profile`                 | Bearer   | any         | Current user profile           |
| `GET`    | `/admin/users`             | Bearer   | admin       | List all users                 |
| `DELETE` | `/admin/user/{id}`         | Bearer   | admin       | Delete user                    |
| `PATCH`  | `/admin/unlock/{id}`       | Bearer   | admin       | Unlock locked account          |
| `GET`    | `/admin/stats`             | Bearer   | admin       | Aggregate statistics           |
| `GET`    | `/moderator/logs`          | Bearer   | admin, mod  | Full audit log (latest 200)    |
| `GET`    | `/moderator/logs/stats`    | Bearer   | admin, mod  | Log summary statistics         |

---

## Security Architecture

### bcrypt Password Hashing

```
plaintext password → bcrypt(cost=12) → $2b$12$<salt><hash>
```

- Cost factor 12 = ~250ms per hash on modern hardware
- Salt is randomly generated and embedded in the hash string
- One-way function — original password cannot be recovered
- Comparison via `passlib.verify()` — resistant to timing attacks

### JWT Token Structure

```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: { "sub": "1", "email": "...", "role": "admin", "exp": ..., "type": "access" }
Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), SECRET_KEY)
```

- Access tokens expire in **30 minutes**
- Refresh tokens expire in **7 days** and carry `"type": "refresh"`
- Tokens are stateless — no database lookup required for verification
- On logout, token is added to `token_blacklist` table

### Role-Based Access Control

```
admin     → all endpoints
moderator → profile + audit logs
user      → profile only
```

Role is embedded in the JWT payload and verified server-side using the
`require_role(*roles)` dependency factory. Role escalation attacks are
prevented because the JWT signature would be invalidated on tampering.

### Token Blacklisting

On logout, the raw JWT string is stored in `token_blacklist`. Every
protected request checks this table before processing. This converts
JWTs to revocable tokens at the cost of one DB read per request.

### Brute Force Protection

Failed login attempts are tracked per user:
- Attempt 1-4: return `401 Invalid credentials`
- Attempt 5+: lock account, log `LOCKED` event, return `423 Locked`
- Locked accounts can only be unlocked by admin via `PATCH /admin/unlock/{id}`

---

## Demo User Credentials

| Role      | Email            | Password    |
|-----------|------------------|-------------|
| admin     | admin@demo.com   | Admin1234!  |
| moderator | mod@demo.com     | Mod1234!    |
| user      | user@demo.com    | User1234!   |

---

## Project Structure

```
auth-server/
├── backend/
│   ├── main.py              # FastAPI app, CORS, startup
│   ├── database.py          # SQLAlchemy engine + session
│   ├── models.py            # User, TokenBlacklist, AuditLog
│   ├── schemas.py           # Pydantic request/response models
│   ├── auth.py              # bcrypt + JWT utilities
│   ├── dependencies.py      # get_current_user, require_role
│   ├── routes/
│   │   ├── auth_routes.py   # register, login, logout, refresh
│   │   └── protected_routes.py  # profile, admin, moderator
│   ├── seed.py              # Demo users + fake audit logs
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── App.jsx           # Router + toast context
    │   ├── store/authStore.js  # Zustand (memory-only)
    │   ├── lib/
    │   │   ├── axios.js      # Interceptors
    │   │   └── utils.js      # cn, formatDate, parseJwt
    │   ├── components/
    │   │   ├── layout/       # Navbar, Sidebar
    │   │   ├── auth/         # LoginForm, RegisterForm, TokenDisplay
    │   │   ├── dashboard/    # StatsCards, AuditLogTable, UsersTable, ActivityChart
    │   │   └── demo/         # ApiExplorer, JwtVisualizer, FlowDiagram, BruteForceDemo
    │   └── pages/
    │       ├── LandingPage.jsx
    │       ├── AuthPage.jsx
    │       ├── DashboardPage.jsx
    │       ├── ApiDemoPage.jsx
    │       └── AdminPage.jsx
    └── package.json
```

---

## Internal Flow Diagrams

### Login Flow

```
POST /login
    │
    ├── Find user by email
    │       ├── Not found → log FAILED_LOGIN → 401
    │       └── Found ↓
    │
    ├── Check is_locked
    │       └── True → log FAILED_LOGIN → 423
    │
    ├── verify_password(plain, hash)
    │       ├── FAIL → failed_attempts++
    │       │       ├── attempts >= 5 → lock → log LOCKED → 423
    │       │       └── else → log FAILED_LOGIN → 401
    │       └── PASS ↓
    │
    ├── Reset failed_attempts = 0, update last_login
    ├── create_access_token({sub, email, role})
    ├── create_refresh_token({sub, email, role})
    ├── Log LOGIN SUCCESS
    └── Return TokenResponse
```

### Protected Route Flow

```
GET /profile
    │
    ├── Extract Bearer token from Authorization header
    ├── Check token in token_blacklist
    │       └── Found → 401 Token revoked
    │
    ├── decode_token(token)
    │       └── JWTError → 401 Invalid/expired
    │
    ├── Load user from DB by sub claim
    │       └── Not found → 401
    │
    └── Return user object to handler
```

### RBAC Decision Flow

```
Endpoint with require_role("admin")
    │
    ├── get_current_user() → user object
    │
    ├── user.role in ("admin",)?
    │       ├── YES → proceed to handler
    │       └── NO  → 403 Insufficient permissions
    │
    └── Handler executes with verified user
```
