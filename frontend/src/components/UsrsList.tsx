import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ ページ遷移用
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
  self_correction_date: string | null;
}

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const navigate = useNavigate(); // ✅ React Router v6 以降のフック

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access_token"); // JWT
        const res = await fetch("http://localhost:8000/admin/users", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: any) {
        console.error(err);
        setError("ユーザー一覧の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewAttendance = (userId: string) => {
    // 勤怠ページへ遷移（例: /admin/attendance/:userId）
    navigate(`/admin/attendance/${userId}`);
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>ユーザー一覧</h2>
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>メール</th>
            <th>役割</th>
            <th>勤怠確認</th> {/* ✅ 新しい欄 */}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>
                <button onClick={() => handleViewAttendance(u.id)}>
                  勤怠を見る
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
