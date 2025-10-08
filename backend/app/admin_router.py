# app/admin_router.py
from fastapi import APIRouter, Depends, HTTPException
from .deps import require_admin
from .db import db
from bson import ObjectId


admin = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_admin)],  # ★これで配下すべてadmin限定
)

# ユーザー一覧取得（管理者専用）
@admin.get("/users")
def list_users():
    users = list(db.users.find({}, {"password": 0}).sort("created_at", -1))
    for u in users:
        u["id"] = str(u.pop("_id"))
    return users


# 特定ユーザーの当月勤怠一覧取得（管理者専用）
@admin.get("/users/{user_id}/attendance")
def user_month_attendance(user_id: str, month: str):
    """例: month='2025-10' で当該ユーザーの当月勤怠一覧"""
    oid = ObjectId(user_id)
    docs = list(db.attendance.find({
        "user_id": oid,
        "date_key": {"$regex": f"^{month}-"}  # "YYYY-MM-DD"
    }).sort("clock_in", 1))
    for d in docs:
        d["id"] = str(d.pop("_id"))
        d["user_id"] = str(d["user_id"])
    return docs

