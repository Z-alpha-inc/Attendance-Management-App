import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClockingButtons from '../components/ClockingButtons ';
import Timer from '../components/Timer';
import TodayAttendanceHistory from '../components/TodayAttendanceHistory';

type AttendanceRecord = {
  id: string;
  clockIn: string;
  clockOut: string | null;
};

function DashboardPage() {
  const [flashMessage, setFlashMessage] = useState<string>(''); // ←追加

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

  return (
    <div style={pageStyle}>
      <h1>勤怠ダッシュボード</h1> 
      
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <Timer />
        {/* setFlashMessage を渡す */}
        <ClockingButtons setFlashMessage={setFlashMessage} />
      </div>

      {/* 簡易的にメッセージ表示 */}
      {flashMessage && <p style={{ color: 'green' }}>{flashMessage}</p>}

      
    </div>
  );
}

export default DashboardPage;
