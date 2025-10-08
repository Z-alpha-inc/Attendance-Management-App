# app/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional,Literal, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=20)  # ← これを追加！

class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)

class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str = "employee"
    created_at: datetime
    updated_at: datetime
    self_correction_date: Optional[datetime] = None

class AttendanceOut(BaseModel):
    id: str
    user_id: str
    date_key: str                                 # "YYYY-MM-DD"（JST起点）
    status: Literal["open", "closed"]             # 未クローズ/クローズ
    clock_in: datetime
    clock_out: Optional[datetime] = None
    workedMinutes: Optional[int] = None           # 分
    created_at: datetime
    updated_at: datetime
    lastModifiedBy: str

class ClockActionResult(BaseModel):
    message: str
    date_key: Optional[str] = None
    workedMinutes: Optional[int] = None

class MyAttendanceList(BaseModel):
    month: str                                     # "YYYY-MM"
    totalWorkedMinutes: int
    days: List[AttendanceOut]                      # その月の日別レコード一覧