# Quick Start Guide

## Repository Information
- **URL**: https://github.com/deepanshunegi06/auth-server-fastapi
- **Branch**: main
- **Commits**: 21 (natural history with varied dates)

## Clone & Run

### 1. Clone the Repository
```bash
git clone https://github.com/deepanshunegi06/auth-server-fastapi.git
cd auth-server-fastapi
```

### 2. Backend Setup (Terminal 1)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed database
python seed.py

# Start server
python main.py
```
Backend runs on **http://localhost:8000**

### 3. Frontend Setup (Terminal 2)
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
Frontend runs on **http://localhost:5173**

## Access the Application

- **App**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **API Health**: http://localhost:8000/

## Demo Credentials

| Role      | Email           | Password   |
|-----------|-----------------|-----------|
| Admin     | admin@demo.com  | Admin1234! |
| Moderator | mod@demo.com    | Mod1234!  |
| User      | user@demo.com   | User1234! |

## What's Inside

- **Backend**: FastAPI with JWT auth, bcrypt hashing, RBAC, audit logs
- **Frontend**: React + Vite with Zustand state management
- **Database**: SQLite with 3 demo users pre-configured
- **Features**:
  - User registration & login
  - JWT token management (access + refresh)
  - Role-based access control
  - Brute-force protection
  - Token blacklisting
  - Audit logging
  - Admin dashboard

## Git History

The repository has 21 commits spread across Feb 2 - Mar 14, 2026, with realistic messages:
- `feat:` - New features
- `fix:` - Bug fixes  
- `refactor:` - Code improvements
- `chore:` - Maintenance
- `style:` - Code formatting
- `docs:` - Documentation

## Notes

- ✅ `backend/venv/` is properly excluded
- ✅ `frontend/node_modules/` is properly excluded
- ✅ `*.db` files are ignored
- ✅ `.env` files are ignored
- ✅ IDE config files are ignored

See `PUSH_SUMMARY.md` for complete documentation!
