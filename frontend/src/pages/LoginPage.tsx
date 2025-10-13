import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
   

    
    return (
        <div>
            <h1>勤怠管理アプリへようこそ</h1>    
            <LoginForm  />
        </div>
    );
};

export default LoginPage;