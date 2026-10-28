# WorkSphere – HR Management System (Phases 1–4)

A combined starter implementation for the 27 modules in the supplied WorkSphere specification.

## Stack
- Backend: Python 3.10+, FastAPI, SQLAlchemy 2, Pydantic, SQLite by default, JWT bearer authentication.
- Frontend: React + Vite.
- Database: SQLite for local development; set `DATABASE_URL` for PostgreSQL.

## Run locally

### 1. Backend
```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/docs.

### 2. Frontend (new terminal)
```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```
Open the URL printed by Vite (normally http://localhost:5173).

### First account
Register through the UI or `POST /api/auth/register`. Public registration always creates an `EMPLOYEE`; only an authenticated ADMIN can assign or change privileged roles through `/api/users`.

## Important setup notes
- Change `SECRET_KEY` in `backend/.env` before deployment. Never commit `.env` or production secrets.
- SQLite database file is created automatically. Do not commit the database file.
- The implementation is an educational project baseline, not a security-audited production HR/payroll system. Before production use, add migrations, audit logging, rate limiting, malware scanning for uploads, formal payroll/tax rules, backups, and tests/security review.
- Payroll calculations use the supplied basic salary, allowances, deductions, and bonus values; they do not calculate jurisdiction-specific taxes.
- “Auto-mark absent” is exposed as an HR/Admin action (`POST /api/attendance/auto-absent?day=YYYY-MM-DD`) because unattended background scheduling needs a deployment-specific scheduler. Shift-aware attendance is supported through the shifts endpoints and attendance validation.

## Phase coverage
- Phase 1: authentication, employee CRUD/search, attendance, leave, payroll, dashboard analytics, notifications.
- Phase 2: role-based permissions, employee self-service, attendance validation, leave policies/balances, payroll history, admin user management.
- Phase 3: shifts, team leave calendar/conflict checks, secure document endpoints, performance reviews, analytics reports, notifications/alerts, advanced employee filters.
- Phase 4: onboarding, resignation/exit, announcements, tasks, email integration hook, CSV export, feedback, profile/password/notification preferences.

See `docs/MASTER-REQUIREMENTS-MATRIX.md` for the consolidated 27-module traceability matrix, plus `docs/REQUIREMENTS-CHECKLIST.md` and `docs/PHASE-3-4-VERIFICATION.md` for implementation notes and known limitations.

## Create or repair the local administrator account

Public registration intentionally creates only an `EMPLOYEE` account. To create
an administrator locally, open PowerShell in `backend` and set your own values
(no default password is built into the source):

```powershell
$env:ADMIN_USERNAME = "admin"
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "Use-A-Long-Unique-Password"
python create_admin.py
```

The script creates the account or resets the matching account's password and
role to `ADMIN`. Then sign in through `POST /api/auth/login` using
`username_or_email` and `password`. Login accepts either the username or email,
case-insensitively. Password hashing supports passwords longer than 72 bytes.

## Verification status

The included backend test suite was run during packaging. The frontend production
build could not be run in the packaging environment because npm registry access
was unavailable; run `npm install` and `npm run build` locally before submission.
See `docs/MASTER-REQUIREMENTS-MATRIX.md` for features that still require
configuration or end-to-end acceptance testing (for example SMTP, Google
Calendar, scheduled jobs, and PDF exports). This is a consolidated project ZIP,
not a claim that optional external integrations are already configured.
