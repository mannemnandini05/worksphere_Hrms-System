# Role permission matrix

| Capability | EMPLOYEE | HR | ADMIN |
|---|---|---|---|
| View own profile/attendance/leaves/payroll/documents/performance | Yes | Yes | Yes |
| View all employee records | No | Yes | Yes |
| Create/update/deactivate employee | No | Yes | Yes |
| Check-in/out | Own employee profile | Employee ID may be supplied | Employee ID may be supplied |
| Submit leave/resignation/feedback | Own profile | Own profile or authorized workflow | Own profile or authorized workflow |
| Approve/reject leave and resignation | No | Yes | Yes |
| Generate payroll | No | Yes | Yes |
| Manage shifts, policies, balances, documents for other employees | No | Yes | Yes |
| Create announcements/tasks/onboarding/performance reviews | No | Yes | Yes |
| User roles and activation | No | No | Yes |
| Analytics and CSV exports | No | Yes | Yes |

Every protected request resolves the current active user from the JWT subject and database, so changing a user's role takes effect on subsequent requests even if their token has not expired.
