import React, { useEffect, useState } from 'react';
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  ChartNoAxesCombined,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import { request, login as apiLogin } from './api';

const nav = [
  ['Overview', '/dashboard', Home],
  ['Employees', '/employees', Users],
  ['Attendance', '/attendance', CalendarCheck],
  ['Leaves', '/leaves', CalendarDays],
  ['Payroll', '/payroll', Wallet],
  ['Shifts', '/shifts', Activity],
  ['Documents', '/documents', FileText],
  ['Performance', '/performance', ChartNoAxesCombined],
  ['Onboarding', '/onboarding', CheckCheck],
  ['Resignations', '/resignations', BriefcaseBusiness],
  ['Announcements', '/announcements', MessageSquare],
  ['Tasks', '/tasks', ClipboardList],
  ['Feedback', '/feedback', MessageSquare],
  ['Users & Roles', '/users', ShieldCheck],
  ['Reports', '/reports', ChartNoAxesCombined],
  ['Settings', '/settings', Settings],
  ['Notifications', '/notifications', Bell],
];

const fieldMap = {
  '/employees': [
    ['full_name', 'Full name', 'text', true],
    ['designation', 'Designation', 'text', false],
    ['department', 'Department', 'text', false],
    ['joining_date', 'Joining date', 'date', false],
    ['salary', 'Salary', 'number', false],
    ['status', 'Status', 'select:ACTIVE,INACTIVE', false],
  ],
  
  '/attendance': [
    ['employee_id', 'Employee ID', 'number', true],
    ['date', 'Date', 'date', true],
    ['status', 'Status', 'select:PRESENT,ABSENT,LEAVE,LATE', true],
    ['is_late', 'Late arrival', 'select:false,true', false],
    ['working_hours', 'Working hours', 'number', false],
    ['overtime_hours', 'Overtime hours', 'number', false],
  ],
  '/leaves': [
    ['employee_id', 'Employee ID', 'number', false],
    ['leave_type', 'Leave type', 'select:SICK,CASUAL,PAID', true],
    ['start_date', 'Start date', 'date', true],
    ['end_date', 'End date', 'date', true],
    ['reason', 'Reason', 'text', true],
  ],
  '/payroll': [
    ['employee_id', 'Employee ID', 'number', true],
    ['month', 'Month (YYYY-MM)', 'month', true],
    ['basic_salary', 'Basic salary', 'number', true],
    ['allowances', 'Allowances', 'number', false],
    ['deductions', 'Deductions', 'number', false],
    ['bonus', 'Bonus', 'number', false],
  ],
  '/shifts': [
    ['name', 'Shift name', 'text', true],
    ['start_time', 'Start time', 'time', true],
    ['end_time', 'End time', 'time', true],
  ],
  '/documents': [
    ['employee_id', 'Employee ID', 'number', true],
    ['file_name', 'File name', 'text', true],
    ['file_url', 'File URL', 'text', true],
  ],
  '/performance': [
    ['employee_id', 'Employee ID', 'number', true],
    ['review_period', 'Review period', 'text', true],
    ['rating', 'Rating (1–5)', 'number', true],
    ['feedback', 'Feedback', 'text', false],
  ],
  '/onboarding': [
    ['employee_id', 'Employee ID', 'number', true],
    ['task_name', 'Task name', 'text', true],
    ['status', 'Status', 'select:PENDING,COMPLETED', false],
    ['due_date', 'Due date', 'date', false],
  ],
  '/resignations': [
    ['employee_id', 'Employee ID', 'number', false],
    ['reason', 'Reason', 'text', true],
    ['notice_period', 'Notice period (days)', 'number', false],
  ],
  '/announcements': [
    ['title', 'Title', 'text', true],
    ['message', 'Message', 'text', true],
  ],
  '/tasks': [
    ['assigned_to', 'Employee ID', 'number', true],
    ['title', 'Task title', 'text', true],
    ['description', 'Description', 'text', false],
    ['due_date', 'Due date', 'date', false],
    ['status', 'Status', 'select:PENDING,COMPLETED', false],
  ],
  '/feedback': [
  ['employee_id', 'Employee ID', 'number', true],
  ['message', 'Feedback', 'text', true],
  ['rating', 'Rating (1-5)', 'number', true],
  ],
  '/leave-policies': [
    ['leave_type', 'Leave type', 'select:SICK,CASUAL,PAID', true],
    ['total_days_allowed', 'Days allowed', 'number', true],
  ],
  '/leave-balances': [
    ['employee_id', 'Employee ID', 'number', true],
    ['leave_type', 'Leave type', 'select:SICK,CASUAL,PAID', true],
    ['remaining_days', 'Remaining days', 'number', true],
  ],
  '/employee-shifts': [
    ['employee_id', 'Employee ID', 'number', true],
    ['shift_id', 'Shift ID', 'number', true],
  ],
};

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    try {
      const result = await apiLogin(username, password);
      onLogin(result.user);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-brand">
        <div className="brand-icon">W</div>
        <span>WorkSphere</span>
      </div>

      <form className="login-card" onSubmit={submit}>
        <div className="eyebrow">PEOPLE OPERATIONS PLATFORM</div>
        <h1>Welcome back</h1>
        <p className="muted">Sign in to your workspace to continue.</p>

        {error && <div className="error">{error}</div>}

        <label>
          Username or email
          <input
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="you@company.com"
            autoComplete="username"
          />
        </label>

        <label>
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </label>

        <button className="primary full" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="hint">
          New here? Register through the API at{' '}
          <code>/api/auth/register</code>.
        </p>
      </form>

      <div className="login-footer">
        Secure people operations · WorkSphere HRMS
      </div>
    </div>
  );
}

function DataView({ data }) {
  if (data === null || data === undefined) {
    return (
      <div className="empty-state">
        No data to display, or this role cannot access this resource.
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : [data];

  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          <ClipboardList />
        </div>
        <strong>No records found</strong>
        <p>Records will appear here when available.</p>
      </div>
    );
  }

  if (typeof rows[0] !== 'object' || rows[0] === null) {
    return <pre>{String(data)}</pre>;
  }

  const keys = [
    ...new Set(rows.flatMap((row) => Object.keys(row || {}))),
  ].filter((key) => key !== 'hashed_password');

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {keys.map((key) => (
              <th key={key}>{key.replaceAll('_', ' ')}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id ?? index}>
              {keys.map((key) => (
                <td key={key}>
                  {typeof row[key] === 'object' && row[key] !== null
                    ? JSON.stringify(row[key])
                    : String(row[key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone = 'blue' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={20} />
      </div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-foot">
        <span className="dot" /> Live system data
      </div>
    </div>
  );
}

function Dashboard({ data, role }) {
  if (!data) {
    return (
      <div className="empty-card">
        <div className="empty-icon">
          <ChartNoAxesCombined />
        </div>
        <h3>Welcome to WorkSphere</h3>
        <p>
          Add employee and HR records to see your workspace metrics here.
        </p>
      </div>
    );
  }

  if (role === 'EMPLOYEE') {
    return (
      <>
        <div className="stats-grid">
          <Stat
            label="Pending leave requests"
            value={data.pending_leaves ?? 0}
            icon={CalendarDays}
            tone="violet"
          />
          <Stat
            label="Payroll records"
            value={data.payroll_records ?? 0}
            icon={Wallet}
            tone="green"
          />
          <Stat
            label="Today's attendance"
            value={data.attendance_today?.status || 'Not marked'}
            icon={CalendarCheck}
            tone="blue"
          />
        </div>

        <div className="section-card">
          <h3>My profile</h3>
          <DataView data={data.employee} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="welcome-strip">
        <div>
          <div className="eyebrow">HR OPERATIONS</div>
          <h2>
            Good to see you, {role === 'ADMIN' ? 'Administrator' : 'HR team'}.
          </h2>
          <p>Here’s what’s happening across your organization today.</p>
        </div>
        <div className="welcome-art">
          <div className="art-circle one" />
          <div className="art-circle two" />
          <Users size={42} />
        </div>
      </div>

      <div className="stats-grid">
        <Stat
          label="Total employees"
          value={data.total_employees ?? 0}
          icon={Users}
          tone="blue"
        />
        <Stat
          label="Present today"
          value={
            data.present_today ??
            data.attendance_by_status_today?.PRESENT ??
            0
          }
          icon={CalendarCheck}
          tone="green"
        />
        <Stat
          label="Pending leaves"
          value={data.pending_leaves ?? 0}
          icon={CalendarDays}
          tone="orange"
        />
        <Stat
          label="Payroll total"
          value={Number(
            data.payroll_total ?? data.payroll_net_total ?? 0
          ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          icon={Wallet}
          tone="violet"
        />
      </div>

      <div className="dashboard-columns">
        <div className="section-card">
          <div className="section-title">
            <div>
              <h3>Attendance snapshot</h3>
              <p className="muted">Today's attendance records</p>
            </div>
            <span className="tag">Today</span>
          </div>

          <div className="attendance-bars">
            <div>
              <span>Present</span>
              <div className="bar">
                <i
                  style={{
                    width: `${
                      Math.min(
                        100,
                        ((data.present_today ??
                          data.attendance_by_status_today?.PRESENT ??
                          0) /
                          Math.max(1, data.total_employees || 1)) *
                          100
                      )
                    }%`,
                  }}
                />
              </div>
              <strong>
                {data.present_today ??
                  data.attendance_by_status_today?.PRESENT ??
                  0}
              </strong>
            </div>

            <div>
              <span>Absent</span>
              <div className="bar orange">
                <i
                  style={{
                    width: `${
                      Math.min(
                        100,
                        ((data.absent_today ??
                          data.attendance_by_status_today?.ABSENT ??
                          0) /
                          Math.max(1, data.total_employees || 1)) *
                          100
                      )
                    }%`,
                  }}
                />
              </div>
              <strong>
                {data.absent_today ??
                  data.attendance_by_status_today?.ABSENT ??
                  0}
              </strong>
            </div>
          </div>
        </div>

        <div className="section-card insight-card">
          <div className="insight-icon">
            <Activity />
          </div>
          <h3>People insight</h3>
          <p>Average performance rating</p>
          <div className="big-number">
            {Number(data.average_performance || 0).toFixed(1)}
            <small> / 5</small>
          </div>
          <div className="mini-progress">
            <i
              style={{
                width: `${
                  Math.min(
                    100,
                    (Number(data.average_performance || 0) / 5) * 100
                  )
                }%`,
              }}
            />
          </div>
          <p className="muted tiny">
            Based on recorded performance reviews
          </p>
        </div>
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('worksphere_user'));
    } catch {
      return null;
    }
  });

  const [page, setPage] = useState('/dashboard');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [form, setForm] = useState({});
  const [notice, setNotice] = useState('');
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const canManage = ['HR', 'ADMIN'].includes(user?.role);
  const canCreate =
    (canManage && Boolean(fieldMap[page])) ||
    page === '/feedback' ||
    page === '/resignations';

  const title = nav.find((item) => item[1] === page)?.[0] || 'Overview';
  const Icon = nav.find((item) => item[1] === page)?.[2] || Home;

  function logout() {
    localStorage.removeItem('worksphere_token');
    localStorage.removeItem('worksphere_user');
    setUser(null);
    setData(null);
    setError('');
    setNotice('');
    setForm({});
    setShowEmployeeForm(false);
  }

  async function load() {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      let path =
        page === '/dashboard'
          ? '/dashboard/summary'
          : page === '/users'
            ? '/users'
            : page === '/reports'
              ? '/reports/department'
              : page === '/settings'
                ? '/profile'
                : page;

      if (page === '/employees' && query.trim()) {
        path += `?search=${encodeURIComponent(query.trim())}`;
      }

      const result = await request(path);
      setData(result);
    } catch (e) {
      setData(null);
      setError(e.message || 'Unable to load data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [page, user, query]);

  function openEmployeeForm() {
    setForm({
      full_name: '',
      designation: '',
      department: '',
      joining_date: '',
      salary: 0,
      status: 'ACTIVE',
    });
    setError('');
    setNotice('');
    setShowEmployeeForm(true);

    setTimeout(() => {
      document.getElementById('create-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  }

  async function submitAction(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setSaving(true);

    try {
      const body = { ...form };
      let endpoint = page;

      if (page === '/employees') {
        endpoint = '/employees';
        body.salary = Number(body.salary || 0);
      } else if (page === '/attendance') {
        body.employee_id = Number(body.employee_id);
        body.working_hours = Number(body.working_hours || 0);
        body.overtime_hours = Number(body.overtime_hours || 0);
        body.is_late = body.is_late === true || body.is_late === 'true';
      } else if (page === '/leaves') {
        if (!body.employee_id) delete body.employee_id;
        else body.employee_id = Number(body.employee_id);
      } else if (page === '/payroll') {
        body.employee_id = Number(body.employee_id);
        body.basic_salary = Number(body.basic_salary || 0);
        body.allowances = Number(body.allowances || 0);
        body.deductions = Number(body.deductions || 0);
        body.bonus = Number(body.bonus || 0);
      } else if (page === '/tasks') {
        body.assigned_to = Number(body.assigned_to);
      } else if (page === '/feedback') {
        body.rating = Number(body.rating || 5);
      } else if (page === '/performance') {
        body.employee_id = Number(body.employee_id);
        body.rating = Number(body.rating);
      } else if (page === '/onboarding') {
        body.employee_id = Number(body.employee_id);
      } else if (page === '/resignations') {
        if (body.employee_id) body.employee_id = Number(body.employee_id);
        else delete body.employee_id;
        body.notice_period = Number(body.notice_period || 30);
      } else if (page === '/leave-policies') {
        body.total_days_allowed = Number(body.total_days_allowed);
      } else if (page === '/leave-balances') {
        body.employee_id = Number(body.employee_id);
        body.remaining_days = Number(body.remaining_days);
      } else if (page === '/employee-shifts') {
        body.employee_id = Number(body.employee_id);
        body.shift_id = Number(body.shift_id);
      } else if (page === '/documents') {
        body.employee_id = Number(body.employee_id);
      } else if (!fieldMap[page]) {
        throw new Error('Creation is not available for this page.');
      }

      await request(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setNotice(
        page === '/employees'
          ? 'Employee created successfully.'
          : 'Record saved successfully.'
      );
      setForm({});
      setShowEmployeeForm(false);
      await load();
    } catch (e) {
      setError(e.message || 'Unable to save record');
    } finally {
      setSaving(false);
    }
  }

  if (!user) {
    return (
      <Login
        onLogin={(loggedInUser) => {
          setUser(loggedInUser);
          localStorage.setItem(
            'worksphere_user',
            JSON.stringify(loggedInUser)
          );
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-icon">W</div>
          <div>
            <strong>WorkSphere</strong>
            <small>PEOPLE PLATFORM</small>
          </div>
          <button
            className="close-nav"
            type="button"
            onClick={() => setMobileNav(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        <nav>
          {nav
            .filter(
              (item) =>
                !(['/users', '/reports'].includes(item[1])) ||
                ['ADMIN', 'HR'].includes(user.role)
            )
            .map(([label, path, NavIcon]) => (
              <button
                key={path}
                type="button"
                className={`nav-item ${page === path ? 'active' : ''}`}
                onClick={() => {
                  setPage(path);
                  setError('');
                  setNotice('');
                  setMobileNav(false);
                  setShowEmployeeForm(false);
                  setForm({});
                  setQuery('');
                }}
              >
                <NavIcon size={18} />
                <span>{label}</span>
                {page === path && (
                  <ChevronRight size={15} className="nav-chevron" />
                )}
              </button>
            ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-mark">?</div>
            <strong>Need a hand?</strong>
            <p>Explore API docs and workflow guidance.</p>
            <a
              href="http://127.0.0.1:8000/docs"
              target="_blank"
              rel="noreferrer"
            >
              Open API docs ↗
            </a>
          </div>

          <div className="user-mini">
            <div className="avatar">
              {user.username?.slice(0, 1).toUpperCase()}
            </div>
            <div className="user-meta">
              <strong>{user.username}</strong>
              <span>{user.role}</span>
            </div>
            <button title="Sign out" type="button" onClick={logout}>
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button
            className="menu-button"
            type="button"
            onClick={() => setMobileNav(!mobileNav)}
            aria-label="Toggle navigation"
          >
            <Menu />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <strong>{title}</strong>
          </div>

          <div className="top-actions">
            <div className="secure-pill">
              <span /> Secure session
            </div>
            <button
              className="icon-button"
              title="Notifications"
              type="button"
              onClick={() => setPage('/notifications')}
            >
              <Bell size={19} />
            </button>
            <div className="avatar small">
              {user.username?.slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <section className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">WORKSPHERE / {user.role}</div>
              <h1>{title}</h1>
              <p>
                {page === '/dashboard'
                  ? 'Your people operations, at a glance.'
                  : `Manage ${title.toLowerCase()} and keep work moving.`}
              </p>
            </div>

            {page === '/employees' && canManage && (
              <button
                className="primary"
                type="button"
                onClick={openEmployeeForm}
              >
                ＋ Add employee
              </button>
            )}
          </div>

          {error && <div className="error inline-error">{error}</div>}
          {notice && <div className="success">{notice}</div>}
          {loading && <div className="loading">Loading workspace…</div>}

          {page === '/dashboard' && (
            <Dashboard data={data} role={user.role} />
          )}

          {page === '/employees' && (
            <>
              <div className="toolbar">
                <div className="searchbox">
                  <Search size={17} />
                  <input
                    placeholder="Search employees by name…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <span className="muted">
                  Search by name · Filter by department/status via API
                </span>
              </div>

              <DataView data={data} />

              {canManage && showEmployeeForm && (
                <form
                  id="create-form"
                  className="section-card create-form"
                  onSubmit={submitAction}
                >
                  <h3>Add employee</h3>

                  <div className="form-grid">
                    {fieldMap['/employees'].map(
                      ([key, label, type, required]) => (
                        <label key={key}>
                          {label}

                          {type.startsWith('select:') ? (
                            <select
                              required={!!required}
                              value={form[key] ?? ''}
                              onChange={(e) =>
                                setForm((previous) => ({
                                  ...previous,
                                  [key]: e.target.value,
                                }))
                              }
                            >
                              <option value="">Select…</option>
                              {type
                                .slice(7)
                                .split(',')
                                .map((value) => (
                                  <option key={value} value={value}>
                                    {value}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <input
                              required={!!required}
                              type={type}
                              min={type === 'number' ? 0 : undefined}
                              value={form[key] ?? ''}
                              onChange={(e) =>
                                setForm((previous) => ({
                                  ...previous,
                                  [key]: e.target.value,
                                }))
                              }
                            />
                          )}
                        </label>
                      )
                    )}
                  </div>

                  <div className="form-actions">
                    <button
                      className="primary"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save employee'}
                    </button>

                    <button
                      className="secondary"
                      type="button"
                      onClick={() => {
                        setShowEmployeeForm(false);
                        setForm({});
                        setError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          {page !== '/dashboard' &&
            page !== '/employees' &&
            page !== '/reports' &&
            page !== '/settings' && (
              <>
                <div className="section-card">
                  <div className="section-title">
                    <div>
                      <h3>{title} records</h3>
                      <p className="muted">
                        Live data from the WorkSphere API
                      </p>
                    </div>
                    <span className="tag">{user.role}</span>
                  </div>
                  <DataView data={data} />
                </div>

                {canCreate && fieldMap[page] && (
                  <form
                    id="create-form"
                    className="section-card create-form"
                    onSubmit={submitAction}
                  >
                    <h3>
                      Create {title.toLowerCase().replace(/s$/, '')}
                    </h3>

                    <div className="form-grid">
                      {fieldMap[page].map(
                        ([key, label, type, required]) => (
                          <label key={key}>
                            {label}

                            {type.startsWith('select:') ? (
                              <select
                                required={!!required}
                                value={form[key] ?? ''}
                                onChange={(e) =>
                                  setForm((previous) => ({
                                    ...previous,
                                    [key]: e.target.value,
                                  }))
                                }
                              >
                                <option value="">Select…</option>
                                {type
                                  .slice(7)
                                  .split(',')
                                  .map((value) => (
                                    <option key={value} value={value}>
                                      {value}
                                    </option>
                                  ))}
                              </select>
                            ) : (
                              <input
                                required={!!required}
                                type={type}
                                value={form[key] ?? ''}
                                onChange={(e) =>
                                  setForm((previous) => ({
                                    ...previous,
                                    [key]: e.target.value,
                                  }))
                                }
                              />
                            )}
                          </label>
                        )
                      )}
                    </div>

                    <button
                      className="primary"
                      type="submit"
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Save record'}
                    </button>
                  </form>
                )}
              </>
            )}

          {page === '/reports' && (
            <div className="section-card">
              <h3>Department overview</h3>
              <DataView data={data} />

              <div className="export-row">
                <button
                  className="secondary"
                  type="button"
                  onClick={async () => {
                    try {
                      const result = await request(
                        '/reports/export/employees.csv'
                      );
                      downloadText(result, 'employees.csv');
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Export employees CSV
                </button>

                <button
                  className="secondary"
                  type="button"
                  onClick={async () => {
                    try {
                      const result = await request(
                        '/reports/export/payroll.csv'
                      );
                      downloadText(result, 'payroll.csv');
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Export payroll CSV
                </button>
              </div>
            </div>
          )}

          {page === '/settings' && (
            <div className="section-card">
              <h3>Profile &amp; preferences</h3>
              <p className="muted">
                Use the API or Swagger to update your profile, password, and
                notification preferences.
              </p>
              <pre>
                {'PATCH /api/profile\n'}
                {'POST /api/profile/change-password\n'}
                {'PATCH /api/profile/notification-preferences?preferences=all'}
              </pre>
              <p>
                Signed in as <strong>{user.email}</strong>
              </p>
              <button
                className="secondary"
                type="button"
                onClick={() =>
                  request('/auth/me')
                    .then(setData)
                    .catch((e) => setError(e.message))
                }
              >
                Refresh my account
              </button>
              <DataView data={data} />
            </div>
          )}

          <div className="footer-note">
            WorkSphere HRMS <span>·</span> Phases 1–4 <span>·</span> Data
            access follows your assigned role
          </div>
        </section>
      </main>
    </div>
  );
}

function downloadText(text, name) {
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export default App;