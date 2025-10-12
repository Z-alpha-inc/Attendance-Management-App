import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
    // 1. useNavigateフックを準備

    
    return (
        <div>
            <h1>勤怠管理アプリへようこそ</h1>
            
            {/* 4. LoginFormを配置し、onLoginSuccessに関数を渡す */}
            <LoginForm  />
        </div>
    );
};

export default LoginPage;