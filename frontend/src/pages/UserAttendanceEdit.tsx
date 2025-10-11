import { useParams } from 'react-router-dom';

const UserEditAttendance = () => {
  const { id } = useParams<{ id: string }>();  // URLの:id部分を取得
  console.log(id); // 例: "123"

  // idを使ってAPIから勤怠データ取得
  return <div>編集ページ ID: {id}</div>;
};

export default UserEditAttendance;
