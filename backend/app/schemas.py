from datetime import date, datetime, time
from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator
from typing import Optional, Literal

Role = Literal["EMPLOYEE", "HR", "ADMIN"]
class RegisterIn(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
class LoginIn(BaseModel):
    username_or_email: str
    password: str
class UserOut(BaseModel):
    id: int; username: str; email: EmailStr; role: Role; is_active: bool; created_at: datetime
    model_config = ConfigDict(from_attributes=True)
class TokenOut(BaseModel):
    access_token: str; token_type: str = "bearer"; user: UserOut
class EmployeeIn(BaseModel):
    user_id: Optional[int] = None
    full_name: str = Field(min_length=1, max_length=160)
    designation: str = ""
    department: str = ""
    joining_date: Optional[date] = None
    salary: float = Field(default=0, ge=0)
    status: Literal["ACTIVE", "INACTIVE"] = "ACTIVE"
class EmployeeOut(EmployeeIn):
    id: int
    model_config = ConfigDict(from_attributes=True)
class AttendanceIn(BaseModel):
    employee_id: Optional[int] = None
    date: Optional[date] = None
class LeaveIn(BaseModel):
    employee_id: Optional[int] = None
    leave_type: Literal["SICK", "CASUAL", "PAID"]
    start_date: date; end_date: date
    reason: str = Field(min_length=3, max_length=2000)
    @model_validator(mode="after")
    def dates_valid(self):
        if self.end_date < self.start_date: raise ValueError("end_date must be on or after start_date")
        return self
class LeaveDecision(BaseModel):
    status: Literal["APPROVED", "REJECTED"]
class PayrollIn(BaseModel):
    employee_id: int; month: str = Field(pattern=r"^\d{4}-(0[1-9]|1[0-2])$")
    basic_salary: float = Field(ge=0); allowances: float = Field(default=0, ge=0); deductions: float = Field(default=0, ge=0); bonus: float = Field(default=0, ge=0)
class RoleUpdate(BaseModel):
    role: Role; is_active: bool = True
class AdminUserIn(BaseModel):
    username: str = Field(min_length=3, max_length=80)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Role = "EMPLOYEE"
    is_active: bool = True
class PasswordChange(BaseModel):
    current_password: str; new_password: str = Field(min_length=8, max_length=128)
class ProfileUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=80)
    email: Optional[EmailStr] = None
class LeavePolicyIn(BaseModel):
    leave_type: Literal["SICK", "CASUAL", "PAID"]; total_days_allowed: int = Field(ge=0, le=365)
class LeaveBalanceIn(BaseModel):
    employee_id: int; leave_type: Literal["SICK", "CASUAL", "PAID"]; remaining_days: int = Field(ge=0, le=365)
class ShiftIn(BaseModel):
    name: str; start_time: time; end_time: time
class PerformanceIn(BaseModel):
    employee_id: int; review_period: str; rating: float = Field(ge=1, le=5); feedback: str = ""
class OnboardingIn(BaseModel):
    employee_id: int; task_name: str; status: Literal["PENDING", "COMPLETED"] = "PENDING"; due_date: Optional[date] = None
class ResignationIn(BaseModel):
    employee_id: Optional[int] = None; reason: str = Field(min_length=3); notice_period: int = Field(default=30, ge=0, le=365)
class AnnouncementIn(BaseModel):
    title: str = Field(min_length=1, max_length=180); message: str = Field(min_length=1)
class TaskIn(BaseModel):
    assigned_to: int; title: str; description: str = ""; due_date: Optional[date] = None; status: Literal["PENDING", "COMPLETED"] = "PENDING"
class FeedbackIn(BaseModel):
    message: str = Field(min_length=1, max_length=5000); rating: int = Field(ge=1, le=5)
