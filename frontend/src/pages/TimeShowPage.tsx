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
      <AdminAttendance />
 
      {/* ユーザー勤怠データを表示 */}
    </div>
  );
}