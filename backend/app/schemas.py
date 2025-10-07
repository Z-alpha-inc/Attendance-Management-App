# app/schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
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