import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from '../components/UsrsList';
import LogoutButton from '../components/LogoutButton';
import Header from '../components/Headear';

export default function AdminShow() {
  return (
    <div>
      <Header title="従業員一覧" />
      <UserList />
      {/* ユーザー勤怠データを表示 */}
    </div>
  );
}