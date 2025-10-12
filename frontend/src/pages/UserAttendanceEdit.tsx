import { useParams } from 'react-router-dom';
import React from 'react';
import Header from '../components/Headear';

const UserEditAttendance = () => {
  const { id } = useParams<{ id: string }>();  // URLの:id部分を取得
  console.log(id); // 例: "123"

  // idを使ってAPIから勤怠データ取得
  return (
    <>
      <Header title="勤怠編集" />
      <div>編集ページ ID: {id}</div>
    </>
  );
};

export default UserEditAttendance;
