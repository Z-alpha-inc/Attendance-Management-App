import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from '../components/UsrsList';
import AdminAttendance from '../components/AdminAttendance';
import LogoutButton from '../components/LogoutButton';
import { useState } from 'react';
import Header from '../components/Headear';
export default function TimeShow() {
  const [name, setName] = useState("");

  return (
    <div>
      <Header title="従業員勤怠一覧"  />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', // 水平方向の中央揃え
        marginTop: '2rem' // ヘッダーとの間に少し余白を追加
      }}>
      <AdminAttendance />
      </div>
 
      {/* ユーザー勤怠データを表示 */}
    </div>
  );
}