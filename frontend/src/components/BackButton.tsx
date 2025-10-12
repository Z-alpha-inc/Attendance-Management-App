import React from "react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  label?: string; // ボタンに表示する文字をオプションで変更可能
}

const BackButton: React.FC<BackButtonProps> = ({ label = "戻る" }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 一つ前のページに戻る
  };

  return (
    <button onClick={handleBack} style={styles.button}>
      {label}
    </button>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  button: {
    padding: "5px 10px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default BackButton;
