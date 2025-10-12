import React from "react";
import BackButton from "./BackButton";
import LogoutButton from "./LogoutButton";
import { useCurrentUser } from "../hooks/UseCurrentUser";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, loading } = useCurrentUser();

  return (
    <header style={styles.header}>
      {/* 左側: 戻るボタン */}
      <div style={styles.left}>
        <BackButton />
      </div>

      {/* 中央: タイトル */}
      <div style={styles.center}>
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>

      {/* 右側: ユーザー名 + ログアウト */}
      <div style={styles.right}>
        <span style={{ marginRight: "10px" }}>
          {loading ? "読み込み中..." : user?.name || "未ログイン"}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#1976d2",
    color: "white",
  },
  left: {
    flex: 1,
  },
  center: {
    flex: 2,
    textAlign: "center",
  },
  right: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
  },
};

export default Header;
