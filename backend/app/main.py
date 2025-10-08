# app/main.py
from fastapi import FastAPI, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from .db import db, ensure_indexes
from .schemas import UserCreate, UserUpdate, UserOut
import os
from dotenv import load_dotenv
import bcrypt
from .admin_router import admin
from .deps import get_current_user, require_admin  #（一般APIや管理者APIで使いたい場合）
from .db import ensure_indexes

load_dotenv()

app = FastAPI(title="Attendance API")



def now_utc():
    return datetime.now(timezone.utc)

def serialize_user(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "role": doc.get("role", "employee"),
        "created_at": doc["createdAt"],  # ← キー名はDBのまま
        "updated_at": doc["updatedAt"],
        "selfCorrectionDate": doc.get("selfCorrectionDate"),
    }




@app.on_event("startup")
def on_startup():
    ensure_indexes()  # 起動時にインデックス作成

@app.post("/users", response_model=UserOut, status_code=201)
def create_user(payload: UserCreate):
    # 管理者メール判定

    # すでに同じメールが存在しないかチェック
    if db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    # パスワードをハッシュ化
    hashed_pw = bcrypt.hashpw(payload.password.encode("utf-8"), bcrypt.gensalt())

    doc = {
        "name": payload.name,
        "email": payload.email,
        "password": hashed_pw.decode("utf-8"),  # ← ハッシュを保存
        "role": "employee",  # デフォルトで"employee"に設定（必要に応じて変更）
        "created_at": now_utc(),
        "updated_at": now_utc(),
        "self_correction_date": None,
    }

    result = db.users.insert_one(doc)
    new_user = db.users.find_one({"_id": result.inserted_id})

    # passwordは返さない
    new_user.pop("password", None)

    return {
        "id": str(new_user["_id"]),
        "name": new_user["name"],
        "email": new_user["email"],
        "role": new_user["role"],
        "created_at": new_user["created_at"],
        "updated_at": new_user["updated_at"],
        "self_correction_date": new_user["self_correction_date"],
    }



@app.get("/users")
def list_users():
    users = list(db.users.find().sort("createdAt", -1))
    return [serialize_user(u) for u in users]

app.include_router(admin)

@app.get("/admin")
def admin_dashboard(current_user: dict = Depends(require_admin)):
    """管理者専用ページ"""
    return {"message": f"ようこそ管理者 {current_user['name']} さん"}
