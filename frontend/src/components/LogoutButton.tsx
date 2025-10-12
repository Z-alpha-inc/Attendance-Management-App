import React from "react";
import { useNavigate } from "react-router-dom";

const LogoutButton: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // トークン削除
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_role");

    // 任意で状態リセット処理などもここに追加可能

    // ログインページへリダイレクト
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: "10px 16px",
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
      }}
    >
      ログアウト
    </button>
  );
};

export default LogoutButton;
