import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserList from '../components/UsrsList';
import LogoutButton from '../components/LogoutButton';
import HeaderNoBack from '../components/HeaderNoBack';
export default function AdminShow() {
  return (
    <div>
      <HeaderNoBack title="従業員一覧" />
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', // 水平方向の中央揃え
        marginTop: '2rem' // ヘッダーとの間に少し余白を追加
      }}>
      <UserList />
      </div>
      {/* ユーザー勤怠データを表示 */}
    </div>
  );
}