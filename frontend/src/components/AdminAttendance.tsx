import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Attendance {
  id: string;
  date_key: string;
  clock_in: string;
  clock_out: string | null;
}

const AdminAttendance: React.FC = () => {
  const { user_id } = useParams<{ user_id: string }>();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [month, setMonth] = useState("2025-10");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `http://localhost:8000/admin/users/${user_id}/attendance?month=${month}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data: Attendance[] = await res.json();
        const sanitized = data.map((item: any) => ({
          id: String(item._id || item.id || ""),
          date_key: item.date_key || "",
          clock_in: item.clock_in || "",
          clock_out: item.clock_out || null,
          }));
        setAttendance(sanitized);
      } catch (err) {
        console.error(err);
        setError("勤怠データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    console.log(month);

    if (user_id) fetchAttendance();
  }, [user_id, month]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div>
      <h2>勤怠一覧（{month}）</h2>
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        style={{ marginBottom: "10px" }}
      />
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>日付</th>
            <th>出勤</th>
            <th>退勤</th>
          </tr>
        </thead>
        <tbody>
          {attendance.length > 0
            ? attendance.map((a) => <tr key={a.id}><td>{a.date_key}</td><td>{a.clock_in || "-"}</td><td>{a.clock_out || "-"}</td></tr>)
            : <tr><td colSpan={3}>データがありません</td></tr>
          }
        </tbody>
      </table>
    </div>
  );
};

export default AdminAttendance;
