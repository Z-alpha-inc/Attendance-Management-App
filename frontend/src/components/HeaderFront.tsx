import React from "react";
import { useCurrentUser } from "../hooks/UseCurrentUser";
import SignUpBackButton from "./SignUpBackButton";

interface HeaderProps {
  title?: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <SignUpBackButton />
      </div>
      <div style={styles.center}>
        <h2 style={{ margin: 0 }}>{title}</h2>
      </div>
      <div style={styles.right}>
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
