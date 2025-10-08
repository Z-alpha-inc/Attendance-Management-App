from fastapi import Depends, Header, HTTPException
from bson import ObjectId
from .db import db
from starlette.responses import RedirectResponse

def get_current_user(x_user_id: str = Header(alias="X-User-Id")) -> dict:
    """開発中はヘッダで擬似ログイン。後でJWTに差し替え"""
    try:
        oid = ObjectId(x_user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid X-User-Id")

    user = db.users.find_one({"_id": oid})
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