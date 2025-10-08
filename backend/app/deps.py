from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import RedirectResponse
from jose import jwt, JWTError
from bson import ObjectId
from .auth import SECRET_KEY, ALGORITHM
from .db import db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """JWTトークンを検証してユーザーを取得"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        # 303 でトップへ（フロントが同一オリジンである前提）
        response = RedirectResponse(url="/", status_code=303)
        # FastAPIのDependency内でResponse返すなら、例外で返すのではなく
        # ハンドラ側で Depends の戻りを使わない構成にする必要が出るため、
        # 実運用は 403 を返してフロントでリダイレクトが無難。
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user