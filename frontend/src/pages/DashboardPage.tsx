import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClockingButtons from '../components/ClockingButtons';
import Timer from '../components/Timer';
import TodayAttendanceHistory from '../components/TodayAttendanceHistory';
import MonthlyAttendance from '../components/MonthlyAttendance';
import LogoutButton from "../components/LogoutButton";
import Header from '../components/Headear';
type AttendanceRecord = {
  id: string;
  clockIn: string;
  clockOut: string | null;
};

function DashboardPage() {
  const [flashMessage, setFlashMessage] = useState<{ type: string, text: string } | null>(null); // ←追加
  const [status, setStatus] = useState<string>('not_clocked_in');
  const token = localStorage.getItem('access_token');

  const todayRecords: AttendanceRecord[] = [
    { id: '1', clockIn: '09:00', clockOut: '18:00' },
    { id: '2', clockIn: '13:00', clockOut: null },
  ];

  const pageStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    minHeight: '100vh',
  };

  const apiUrl = import.meta.env.VITE_API_URL;

const authorizedFetch = async (url: string, method: string) => {
  const token = localStorage.getItem('access_token'); // ←ここで毎回取得
  if (!token) throw new Error("Token not found. Please login.");

  const res = await fetch(`${apiUrl}${url}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) throw new Error(await res.text());
  return await res.json();
};

  // 出勤状態を取得する関数
  const fetchStatus = async () => {
    try {
      const data = await authorizedFetch('/me/status', 'GET');
      setStatus(data.status);
    } catch (e) {
      setStatus('error');
    }
  };

  // 初回マウント時にも状態取得したい場合
  React.useEffect(() => {
    fetchStatus();
  }, []);


  return (
    <div style={pageStyle}>
      <h1>勤怠ダッシュボード</h1> 
      
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <Timer />
        {/* setFlashMessage を渡す */}
       <ClockingButtons
        isClockedIn={status === 'working'}
        authorizedFetch={authorizedFetch}
        onActionSuccess={fetchStatus} // 打刻成功時に状態再取得
        setFlashMessage={setFlashMessage}
      />
      </div>

      {/* 簡易的にメッセージ表示 */}
      {flashMessage && (
  <p style={{ color: flashMessage.type === 'error' ? 'red' : 'green' }}>
    {flashMessage.text}
  </p>
)}
  <MonthlyAttendance authorizedFetch={authorizedFetch} />
  <TodayAttendanceHistory authorizedFetch={authorizedFetch} />
  <LogoutButton />

      
    </div>
  );
}

export default DashboardPage;
