# app/main.py
from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from .db import db, ensure_indexes
from .schemas import UserCreate, UserUpdate, UserOut
from dotenv import load_dotenv
import bcrypt
from typing import Optional
from .admin_router import admin
from .deps import get_current_user, require_admin  #（一般APIや管理者APIで使いたい場合）
from .db import ensure_indexes
from .auth import create_access_token
import os

load_dotenv()

app = FastAPI(title="Attendance API")

JST = ZoneInfo("Asia/Tokyo")
def today_key(): return datetime.now(JST).strftime("%Y-%m-%d")
def now_utc():  return datetime.now(timezone.utc)

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

# ユーザー登録機能
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


# ユーザー一覧取得（管理者専用）
@app.get("/users")
def list_users():
    users = list(db.users.find().sort("createdAt", -1))
    return [serialize_user(u) for u in users]

app.include_router(admin)

@app.get("/admin")
def admin_dashboard(current_user: dict = Depends(require_admin)):
    """管理者専用ページ"""
    return {"message": f"ようこそ管理者 {current_user['name']} さん"}

# 自分の情報を取得
@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    """
    現在ログイン中のユーザー情報を返す
    """
    user = {k: v for k, v in current_user.items() if k != "password"}  # パスワード除外
    user["id"] = str(user.pop("_id"))  # ObjectIdを文字列に変換
    return user

#勤怠状況確認機能
@app.get("/me/status")
def my_status(current_user: dict = Depends(get_current_user)):
    uid = current_user["_id"]
    doc = db.attendance.find_one(
        {"user_id": uid, "date_key": today_key()},
        sort=[("clock_in", -1)]
    )
    if not doc:
        return {"status": "not_clocked_in"}  # まだ出勤してない

    if doc["status"] == "open":
        return {
            "status": "working",              # 出勤中（退勤待ち）
            "clock_in": doc["clock_in"],
        }
    # closed
    return {
        "status": "done",                      # 退勤済
        "clock_in": doc["clock_in"],
        "clock_out": doc.get("clock_out"),
        "workedMinutes": doc.get("workedMinutes"),
    }
#出勤機能
@app.post("/me/clock-in")
def clock_in(current_user: dict = Depends(get_current_user)):
    uid = current_user["_id"]
    tkey = today_key()

    existing_open = db.attendance.find_one({"user_id": uid, "date_key": tkey, "status": "open"})
    if existing_open:
        raise HTTPException(400, "Already clocked in")

    existing_done = db.attendance.find_one({"user_id": uid, "date_key": tkey, "status": "closed"})
    if existing_done:
        raise HTTPException(400, "Already closed today")

    now = now_utc()
    db.attendance.insert_one({
        "user_id": uid,
        "date_key": tkey,
        "status": "open",
        "clock_in": now,
        "clock_out": None,
        "workedMinutes": None,
        "created_at": now,
        "updated_at": now,
        "lastModifiedBy": uid,
    })
    return {"message": "Clock-in successful", "date_key": tkey}

#退勤機能
@app.post("/me/clock-out")
def clock_out(current_user: dict = Depends(get_current_user)):
    uid = current_user["_id"]
    open_doc = db.attendance.find_one({"user_id": uid, "status": "open"}, sort=[("clock_in", -1)])
    if not open_doc:
        raise HTTPException(400, "No open attendance")

    now = now_utc()


    clock_in = open_doc["clock_in"]
    if clock_in.tzinfo is None:
        # タイムゾーンがない場合は UTC として扱う
        clock_in = clock_in.replace(tzinfo=timezone.utc)

    worked = int((now - clock_in).total_seconds() // 60)

    db.attendance.update_one(
        {"_id": open_doc["_id"]},
        {"$set": {
            "status": "closed",
            "clock_out": now,
            "workedMinutes": worked,
            "updated_at": now,
            "lastModifiedBy": uid,
        }}
    )
    return {"message": "Clock-out successful", "workedMinutes": worked}

#自分の勤怠一覧取得
@app.get("/me/attendance")
def my_attendance_summary(month: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """当月の日別勤務時間と合計を返す"""
    uid = current_user["_id"]
    if not month:
        month = datetime.now(JST).strftime("%Y-%m")

    # "2025-10-" のように前方一致検索
    docs = list(db.attendance.find(
        {"user_id": uid, "date_key": {"$regex": f"^{month}-"}}
    ).sort("date_key", 1))

    # 日別リストを作成
    records = []
    total_minutes = 0
    for d in docs:
        worked = d.get("workedMinutes") or 0
        total_minutes += worked
        records.append({
            "date": d["date_key"],
            "workedMinutes": worked,
            "workedHours": round(worked / 60, 2)
        })

    return {
        "month": month,
        "totalMinutes": total_minutes,
        "totalHours": round(total_minutes / 60, 2),
        "records": records
    }

#ログイン機能
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """メールアドレスとパスワードでログイン"""
    user = db.users.find_one({"email": form_data.username})
    if not user or not bcrypt.checkpw(form_data.password.encode(), user["password"].encode()):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"])})
    return {"access_token": token, "token_type": "bearer"}

# app/main.py または auth.py
from fastapi import Depends
from fastapi.responses import JSONResponse
from .deps import get_current_user

#ログアウト機能（フロント側でトークンを削除するだけ）
@app.post("/logout")
def logout(current_user: dict = Depends(get_current_user)):
    """
    フロント側がJWTを削除するだけ。
    サーバー側では特に何も保持していない。
    """
    return JSONResponse(
        {"message": f"ユーザー {current_user['email']} がログアウトしました。トークンを削除してください。"}
    )