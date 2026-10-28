
from datetime import date, datetime, time
from typing import Any

from fastapi import FastAPI, Depends, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, Date as SQLDate
from sqlalchemy import DateTime as SQLDateTime
from sqlalchemy import Time as SQLTime
from sqlalchemy import Integer, Float, Boolean
from sqlalchemy.exc import IntegrityError

from .database import Base, engine, get_db
from . import models as m
from . import schemas as s
from .dependencies import get_current_user, get_own_employee
from .security import (
    verify_password,
    create_access_token,
    hash_password,
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="WorkSphere HRMS API",
    version="1.0.0",
)
# ==================== PROFILE API ====================

@app.get("/api/profile", tags=["Settings"])
def get_profile(
    db: Session = Depends(get_db),
    user: m.User = Depends(get_current_user),
):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }
# ==================== CURRENT USER API ====================

@app.get("/api/auth/me", tags=["Authentication"])
def get_current_user_profile(
    user: m.User = Depends(get_current_user),
):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
    }
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# COMMON HELPERS
# --------------------------------------------------

ADMIN_ROLES = {"ADMIN", "HR"}

MODEL_MAP = {
    "users": m.User,
    "employees": m.Employee,
    "attendance": m.Attendance,
    "leaves": m.Leave,
    "payroll": m.Payroll,
    "notifications": m.Notification,
    "leave-policies": m.LeavePolicy,
    "leave-balances": m.LeaveBalance,
    "shifts": m.Shift,
    "employee-shifts": m.EmployeeShift,
    "documents": m.Document,
    "performance": m.Performance,
    "onboarding": m.Onboarding,
    "resignations": m.Resignation,
    "announcements": m.Announcement,
    "tasks": m.Task,
    "feedback": m.Feedback,
}


def serialize(obj):
    """Convert a SQLAlchemy model to a JSON-safe dictionary."""
    if obj is None:
        return None

    result = {}

    for column in obj.__table__.columns:
        name = column.name

        if isinstance(obj, m.User) and name == "hashed_password":
            continue

        value = getattr(obj, name)

        if isinstance(value, (date, datetime, time)):
            value = value.isoformat()

        result[name] = value

    return result


def check_role(user, *allowed_roles):
    if user.role not in allowed_roles:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to perform this action",
        )


def get_employee_record(user, db):
    return get_own_employee(user, db)


def employee_filter(query, model, user, db):
    """Restrict employee accounts to their own records."""
    if user.role != "EMPLOYEE":
        return query

    employee = get_employee_record(user, db)

    if model is m.Employee:
        return query.filter(m.Employee.id == employee.id)

    if model is m.User:
        return query.filter(m.User.id == user.id)

    if model is m.Notification:
        return query.filter(m.Notification.user_id == user.id)

    if hasattr(model, "employee_id"):
        return query.filter(model.employee_id == employee.id)

    if model is m.Task:
        return query.filter(m.Task.assigned_to == employee.id)

    raise HTTPException(
        status_code=403,
        detail="You cannot access this resource",
    )


def convert_value(column, value):
    """Convert common JSON values to SQLAlchemy column types."""
    if value is None:
        return None

    column_type = column.type

    try:
        if isinstance(column_type, SQLDateTime):
            if isinstance(value, str):
                return datetime.fromisoformat(value)

        elif isinstance(column_type, SQLDate):
            if isinstance(value, str):
                return date.fromisoformat(value)

        elif isinstance(column_type, SQLTime):
            if isinstance(value, str):
                return time.fromisoformat(value)

        elif isinstance(column_type, Boolean):
            if isinstance(value, bool):
                return value

            if value in (0, 1, "0", "1", "true", "false", "True", "False"):
                return str(value).lower() in ("1", "true")

        elif isinstance(column_type, Integer):
            return int(value)

        elif isinstance(column_type, Float):
            return float(value)

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=422,
            detail=f"Invalid value for field '{column.name}'",
        )

    return value


def prepare_payload(model, payload, creating=False):
    """Accept only actual model columns and convert their values."""
    columns = {column.name: column for column in model.__table__.columns}
    prepared = {}

    for key, value in payload.items():
        if key not in columns and not (
            model is m.User and key == "password"
        ):
            raise HTTPException(
                status_code=422,
                detail=f"Unknown field: {key}",
            )

        if key == "id":
            raise HTTPException(
                status_code=422,
                detail="The ID is generated automatically",
            )

        if key in ("created_at", "uploaded_at", "assigned_at"):
            continue

        if key == "password" and model is m.User:
            prepared["hashed_password"] = hash_password(value)
            continue

        prepared[key] = convert_value(columns[key], value)

    if model is m.Payroll:
        basic = prepared.get("basic_salary", 0)
        allowances = prepared.get("allowances", 0)
        deductions = prepared.get("deductions", 0)
        bonus = prepared.get("bonus", 0)

        prepared["net_salary"] = (
            basic + allowances + bonus - deductions
        )

    return prepared


def check_write_permission(model, user, payload=None):
    """Apply basic role and ownership rules to writes."""
    payload = payload or {}

    if user.role in ADMIN_ROLES:
        return

    allowed_employee_models = {
        m.Attendance,
        m.Leave,
        m.Resignation,
        m.Feedback,
    }

    if user.role != "EMPLOYEE" or model not in allowed_employee_models:
        raise HTTPException(
            status_code=403,
            detail="Only HR or Admin can modify this resource",
        )


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/", tags=["default"])
def health():
    return {
        "service": "WorkSphere HRMS",
        "status": "ok",
        "docs": "/docs",
    }


# --------------------------------------------------
# AUTHENTICATION
# --------------------------------------------------

@app.post("/api/auth/register", status_code=201, tags=["auth"])
def register(
    data: s.RegisterIn,
    db: Session = Depends(get_db),
):
    existing = (
        db.query(m.User)
        .filter(
            (m.User.username == data.username)
            | (m.User.email == str(data.email))
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Username or email already exists",
        )

    user = m.User(
        username=data.username,
        email=str(data.email),
        hashed_password=hash_password(data.password),
        role="EMPLOYEE",
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Username or email already exists",
        )

    return serialize(user)


@app.post("/api/auth/login", tags=["auth"])
def login(
    data: s.LoginIn,
    db: Session = Depends(get_db),
):
    user = (
        db.query(m.User)
        .filter(
            (m.User.username == data.username_or_email)
            | (m.User.email == data.username_or_email)
        )
        .first()
    )

    if not user or not verify_password(
        data.password, user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username/email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    return {
        "access_token": create_access_token(
            user_id=user.id,
            role=user.role,
            username=user.username,
        ),
        "token_type": "bearer",
        "user": serialize(user),
    }


# --------------------------------------------------
# DASHBOARD ANALYTICS
# --------------------------------------------------

@app.get("/api/dashboard/summary", tags=["analytics"])
def dashboard_summary(
    db: Session = Depends(get_db),
    user: m.User = Depends(get_current_user),
):
    today = date.today()

    if user.role == "EMPLOYEE":
        employee = get_employee_record(user, db)

        attendance_today = (
            db.query(m.Attendance)
            .filter(
                m.Attendance.employee_id == employee.id,
                m.Attendance.date == today,
            )
            .first()
        )

        pending_leaves = (
            db.query(m.Leave)
            .filter(
                m.Leave.employee_id == employee.id,
                m.Leave.status == "PENDING",
            )
            .count()
        )

        payroll_records = (
            db.query(m.Payroll)
            .filter(m.Payroll.employee_id == employee.id)
            .count()
        )

        return {
            "dashboard_type": "employee",
            "employee": serialize(employee),
            "attendance_today": serialize(attendance_today),
            "pending_leaves": pending_leaves,
            "payroll_records": payroll_records,
        }

    total_employees = db.query(m.Employee).count()

    active_employees = (
        db.query(m.Employee)
        .filter(m.Employee.status == "ACTIVE")
        .count()
    )

    inactive_employees = (
        db.query(m.Employee)
        .filter(m.Employee.status != "ACTIVE")
        .count()
    )

    attendance_today = (
        db.query(m.Attendance)
        .filter(m.Attendance.date == today)
        .count()
    )

    pending_leaves = (
        db.query(m.Leave)
        .filter(m.Leave.status == "PENDING")
        .count()
    )

    approved_leaves = (
        db.query(m.Leave)
        .filter(m.Leave.status == "APPROVED")
        .count()
    )

    rejected_leaves = (
        db.query(m.Leave)
        .filter(m.Leave.status == "REJECTED")
        .count()
    )

    leaves_by_status = dict(
        db.query(m.Leave.status, func.count(m.Leave.id))
        .group_by(m.Leave.status)
        .all()
    )

    attendance_by_status_today = dict(
        db.query(m.Attendance.status, func.count(m.Attendance.id))
        .filter(m.Attendance.date == today)
        .group_by(m.Attendance.status)
        .all()
    )

    payroll_records = db.query(m.Payroll).count()

    payroll_net_total = (
        db.query(func.coalesce(func.sum(m.Payroll.net_salary), 0))
        .scalar()
    )

    payroll_by_month = [
        {
            "month": month,
            "net_salary": float(total or 0),
        }
        for month, total in (
            db.query(
                m.Payroll.month,
                func.sum(m.Payroll.net_salary),
            )
            .group_by(m.Payroll.month)
            .order_by(m.Payroll.month.desc())
            .limit(6)
            .all()
        )
    ]

    return {
        "dashboard_type": user.role.lower(),
        "total_employees": total_employees,
        "active_employees": active_employees,
        "inactive_employees": inactive_employees,
        "attendance_today": attendance_today,
        "pending_leaves": pending_leaves,
        "approved_leaves": approved_leaves,
        "rejected_leaves": rejected_leaves,
        "leaves_by_status": leaves_by_status,
        "attendance_by_status_today": attendance_by_status_today,
        "payroll_records": payroll_records,
        "payroll_net_total": float(payroll_net_total or 0),
        "payroll_by_month": payroll_by_month,
    }


# --------------------------------------------------
# GENERIC CRUD FOR ALL MODELS
# --------------------------------------------------

def register_crud(resource_name, model):
    base_path = f"/api/{resource_name}"

    # LIST
    def list_items(
        db: Session = Depends(get_db),
        user: m.User = Depends(get_current_user),
    ):
        if model is m.User:
            check_role(user, "ADMIN")

        query = db.query(model)

        if user.role == "EMPLOYEE":
            query = employee_filter(query, model, user, db)

        items = query.all()
        return [serialize(item) for item in items]

    # CREATE
    def create_item(
        payload: dict[str, Any] = Body(...),
        db: Session = Depends(get_db),
        user: m.User = Depends(get_current_user),
    ):
        check_write_permission(model, user, payload)

        if model is m.User:
            check_role(user, "ADMIN")

        data = prepare_payload(model, payload, creating=True)

        if model is m.Feedback:
            if not data.get("employee_id"):
                raise HTTPException(
                    status_code=422,
                    detail="Employee ID is required for feedback",
                )

        if model is m.Announcement:
            data["created_by"] = user.username

        if user.role == "EMPLOYEE":
            employee = get_employee_record(user, db)

            if model in {
                m.Attendance,
                m.Leave,
                m.Resignation,
                m.Feedback,
            }:
                data["employee_id"] = employee.id

        if model is m.User and "password" not in payload:
            raise HTTPException(
                status_code=422,
                detail="Password is required",
            )

        item = model(**data)

        try:
            db.add(item)
            db.commit()
            db.refresh(item)
        except IntegrityError as e:
            db.rollback()
            print("DATABASE INTEGRITY ERROR:", str(e.orig))
            raise HTTPException(
                status_code=409,
                detail=f"Database integrity error: {str(e.orig)}",
            )

        return serialize(item)

    # READ ONE
    def get_item(
        item_id: int,
        db: Session = Depends(get_db),
        user: m.User = Depends(get_current_user),
    ):
        if model is m.User:
            if user.role != "ADMIN" and item_id != user.id:
                raise HTTPException(status_code=403, detail="Forbidden")

        item = db.get(model, item_id)

        if item is None:
            raise HTTPException(
                status_code=404,
                detail=f"{resource_name} record not found",
            )

        if user.role == "EMPLOYEE":
            if model is m.Employee and item.id != get_employee_record(user, db).id:
                raise HTTPException(status_code=403, detail="Forbidden")

            if model is m.User and item.id != user.id:
                raise HTTPException(status_code=403, detail="Forbidden")

            if hasattr(model, "employee_id"):
                if item.employee_id != get_employee_record(user, db).id:
                    raise HTTPException(status_code=403, detail="Forbidden")

            if model is m.Task and item.assigned_to != get_employee_record(user, db).id:
                raise HTTPException(status_code=403, detail="Forbidden")

            if model is m.Notification and item.user_id != user.id:
                raise HTTPException(status_code=403, detail="Forbidden")

        return serialize(item)

    # UPDATE
    def update_item(
        item_id: int,
        payload: dict[str, Any] = Body(...),
        db: Session = Depends(get_db),
        user: m.User = Depends(get_current_user),
    ):
        check_write_permission(model, user, payload)

        if model is m.User:
            check_role(user, "ADMIN")

        item = db.get(model, item_id)

        if item is None:
            raise HTTPException(status_code=404, detail="Record not found")

        if user.role == "EMPLOYEE":
            if not hasattr(model, "employee_id"):
                raise HTTPException(status_code=403, detail="Forbidden")

            employee = get_employee_record(user, db)

            if item.employee_id != employee.id:
                raise HTTPException(status_code=403, detail="Forbidden")

        data = prepare_payload(model, payload)

        for key, value in data.items():
            setattr(item, key, value)

        try:
            db.commit()
            db.refresh(item)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=409,
                detail="Could not update record. Check field values and constraints.",
            )

        return serialize(item)

    # DELETE
    def delete_item(
        item_id: int,
        db: Session = Depends(get_db),
        user: m.User = Depends(get_current_user),
    ):
        check_role(user, "ADMIN", "HR")

        item = db.get(model, item_id)

        if item is None:
            raise HTTPException(status_code=404, detail="Record not found")

        db.delete(item)

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=409,
                detail="Cannot delete this record because other records depend on it.",
            )

        return {
            "message": "Record deleted successfully",
            "id": item_id,
        }

    # REGISTER CRUD ROUTES
    app.add_api_route(
        base_path,
        list_items,
        methods=["GET"],
        tags=[resource_name],
        name=f"list_{resource_name.replace('-', '_')}",
    )

    app.add_api_route(
        base_path,
        create_item,
        methods=["POST"],
        status_code=201,
        tags=[resource_name],
        name=f"create_{resource_name.replace('-', '_')}",
    )

    app.add_api_route(
        f"{base_path}/{{item_id}}",
        get_item,
        methods=["GET"],
        tags=[resource_name],
        name=f"get_{resource_name.replace('-', '_')}",
    )

    app.add_api_route(
        f"{base_path}/{{item_id}}",
        update_item,
        methods=["PUT"],
        tags=[resource_name],
        name=f"update_{resource_name.replace('-', '_')}",
    )

    app.add_api_route(
        f"{base_path}/{{item_id}}",
        delete_item,
        methods=["DELETE"],
        tags=[resource_name],
        name=f"delete_{resource_name.replace('-', '_')}",
    )


for resource_name, model in MODEL_MAP.items():
    register_crud(resource_name, model)
# ==================== REPORTS API ====================

from fastapi.responses import StreamingResponse
import csv
import io


@app.get("/api/reports/department", tags=["Reports"])
def department_report(
    db: Session = Depends(get_db),
    user: m.User = Depends(get_current_user)
):
    employees = db.query(m.Employee).all()

    report = {}

    for employee in employees:
        department = employee.department or "Unassigned"
        report[department] = report.get(department, 0) + 1

    return [
        {
            "department": department,
            "employee_count": count
        }
        for department, count in report.items()
    ]


@app.get("/api/reports/export/employees.csv", tags=["Reports"])
def export_employees_csv(
    db: Session = Depends(get_db),
    user: m.User = Depends(get_current_user)
):
    employees = db.query(m.Employee).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Full Name",
        "Designation",
        "Department",
        "Salary",
        "Status"
    ])

    for employee in employees:
        writer.writerow([
            employee.id,
            employee.full_name,
            employee.designation,
            employee.department,
            employee.salary,
            employee.status
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=employees.csv"
        }
    )


@app.get("/api/reports/export/payroll.csv", tags=["Reports"])
def export_payroll_csv(
    db: Session = Depends(get_db),
    user: m.User = Depends(get_current_user)
):
    payroll_records = db.query(m.Payroll).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "ID",
        "Employee ID",
        "Amount"
    ])

    for payroll in payroll_records:
        writer.writerow([
            payroll.id,
            payroll.employee_id,
            getattr(payroll, "amount", "")
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=payroll.csv"
        }
    )