import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
    // 1. useNavigateフックを準備
    const navigate = useNavigate();

    /**
     * LoginFormから呼び出されるログイン成功時の処理
     * @param {string} token - 認証トークン
     * @param {string} role - ユーザーの役割
     */
    const handleLoginSuccess = (token, role) => {
        console.log('ログイン成功！', { token, role });

        // 2. 受け取ったトークンを保存する (例: localStorage)
        localStorage.setItem('accessToken', token);

        // 3. ダッシュボードページへ遷移させる
        navigate('/dashboard');
    };

    return (
        <div>
            <h1>勤怠管理アプリへようこそ</h1>
            
            {/* 4. LoginFormを配置し、onLoginSuccessに関数を渡す */}
            <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
    );
};

export default LoginPage;