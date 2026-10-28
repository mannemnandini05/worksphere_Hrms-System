# WorkSphere requirements checklist (all four phases)

This maps the provided specification to routes/UI and notes areas that require deployment-specific work.

## Phase 1 — Core HRMS
- [x] Users table, password hashing, JWT login, public employee registration, `/api/auth/me`.
- [x] Role-aware React login and dashboard; protected API routes.
- [x] Employee create/list/detail/update/deactivate; name search and department/status/role/attendance/performance filters.
- [x] Attendance check-in/check-out, unique employee/day record, working hours, half-day, overtime, history.
- [x] Leave request, history, HR/Admin approval/rejection, notification on decision.
- [x] Payroll generation, salary breakdown, net salary calculation, history and detail.
- [x] Dashboard KPIs, attendance/leave/payroll/performance overview.
- [x] Notifications list and mark-read endpoint.

## Phase 2 — RBAC and advanced HR
- [x] JWT contains user ID, username and role; each request loads current active user and checks current database role.
- [x] EMPLOYEE self-service ownership restrictions; HR can manage employee records, approve leave, view attendance, generate payroll; ADMIN manages users and system access.
- [x] Prevent duplicate same-day attendance and duplicate employee/month payroll.
- [x] Late check-in tracking using assigned shift; optional overtime calculation.
- [x] Leave policy and employee balance tables; balance deduction and overuse prevention when a balance is configured; date conflict prevention.
- [x] Payroll allowances, deductions, bonus, net salary and history.
- [x] Admin user listing, role assignment, account activation/deactivation.

## Phase 3 — Automation, insights and smart HR
- [x] Shifts and employee shift assignments; shift-aware late check-in detection.
- [x] Approved leave calendar and overlapping leave conflict validation.
- [x] Document upload/list/download with ownership checks, extension allowlist, 10 MB limit and server-generated storage name.
- [x] Performance reviews and ratings.
- [x] Dashboard analytics and department report; employee CSV filtering/export endpoints.
- [x] Notification records for leave decisions and payroll processing; notification bell/list UI.
- [x] Advanced employee search/filter endpoints.
- [~] Auto-absent is an HR/Admin-triggered endpoint (`POST /api/attendance/auto-absent?day=YYYY-MM-DD`). A recurring scheduler is intentionally not enabled by default; wire a scheduler appropriate to the hosting environment.
- [~] Real-time push notification delivery and document-expiry alerts require an event scheduler/WebSocket/email provider; stored notifications and the API are included.

## Phase 4 — Employee experience and integrations
- [x] Onboarding tasks, list and completion; employee ownership validation.
- [x] Resignation submission, status history, HR/Admin approval/rejection; approved exit deactivates employee record.
- [x] HR/Admin announcements; all authenticated users can view.
- [x] Task assignment and status tracking; employees can view/update only their assigned tasks.
- [x] CSV exports for employee/payroll reports.
- [~] Email integration configuration status hook is present; SMTP credentials and delivery implementation are not enabled until provider credentials are configured.
- [~] Google Calendar is listed as optional and not configured; add OAuth credentials and event sync if required by the deployment.
- [x] Employee feedback submission; HR/Admin feedback review.
- [x] Profile update, password change, notification preferences.

## Security and data integrity
- [x] Pydantic validation for primary write payloads, enums, dates, ranges and numeric fields.
- [x] Role checks and ownership checks for sensitive employee-specific resources.
- [x] Password hashing (PBKDF2-HMAC-SHA256), expiring signed JWTs, active-user checks.
- [x] Environment-based secret/database/CORS/upload configuration and `.gitignore`.
- [~] Production deployment must replace development secret, use HTTPS, apply database migrations, add rate limiting/audit logs, and perform security review.
- [~] Upload extension/size validation is included; production deployments should add MIME/content inspection, malware scanning and private object storage.
- [~] Payroll supports configured gross/deductions only; statutory tax and country-specific compliance rules are not inferred from the brief.

## Core API map
- Auth/profile: `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/profile`, `/api/profile/change-password`.
- Employees/users: `/api/employees`, `/api/users`.
- Attendance: `/api/attendance`, `/api/attendance/check-in`, `/api/attendance/check-out`, `/api/attendance/auto-absent`.
- Leave: `/api/leaves`, `/api/leave-policies`, `/api/leave-balances`, `/api/leaves/calendar`.
- Payroll/notifications: `/api/payroll`, `/api/notifications`.
- Phase 3: `/api/shifts`, `/api/employee-shifts`, `/api/documents`, `/api/performance`, `/api/reports/department`.
- Phase 4: `/api/onboarding`, `/api/resignations`, `/api/announcements`, `/api/tasks`, `/api/feedback`, `/api/integrations/status`.

The frontend provides a role-aware shell, dashboard, live record tables, employee search, quick-create forms for common resources, profile/settings guidance and report export controls. The FastAPI Swagger UI is the complete interactive interface for endpoints whose workflow requires more parameters or review actions.
