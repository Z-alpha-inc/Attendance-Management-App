import { useParams } from 'react-router-dom';
import React from 'react';
import Header from '../components/Headear';

const UserEditAttendance = () => {
  const { id } = useParams<{ id: string }>();  
  console.log(id); 

 
  return (
    <>
      <Header title="勤怠編集" />
      <div>編集ページ ID: {id}</div>
    </>
  );
};

export default UserEditAttendance;
