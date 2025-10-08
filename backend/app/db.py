# app/db.py
import os
from dotenv import load_dotenv
from pymongo import MongoClient, ASCENDING

load_dotenv()

MONGO_URI = os.getenv("MONGODB_URI")
MONGO_DB  = os.getenv("MONGODB_DB", "attendance-db")

# 同期クライアントを作成
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

def ensure_indexes():
    """起動時に必要なインデックスを作る"""
    db.users.create_index("email", unique=True)
    db.attendance.create_index([("user_id", ASCENDING), ("date_key", ASCENDING)])
    db.attendance.create_index([("user_id", ASCENDING), ("status", ASCENDING)])