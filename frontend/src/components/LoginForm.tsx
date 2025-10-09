import React, { useState } from 'react';

// FastAPIのURLを定義 (FastAPIサーバーが稼働しているアドレスに合わせて変更してください)
const API_BASE_URL = 'http://localhost:8000'; 

/**
 * ログインフォームコンポーネント
 * @param {function} onLoginSuccess - ログイン成功時に呼び出されるコールバック (token, role)
 */
const LoginForm = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    /**
     * フォームの送信処理 (FastAPIの /auth/login APIを呼び出す)
     */
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const details = {
            // FastAPIのOAuth2PasswordRequestFormは 'username' を要求するため、emailをここにマッピング
            'username': email,
            'password': password
        };

        // FastAPIが要求する application/x-www-form-urlencoded 形式にデータを変換
        const formBody = new URLSearchParams(details).toString();
        
        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 
                    // FastAPIの認証形式に合わせる
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                body: formBody,
            });

            const data = await response.json();

            if (response.ok) {
                // 認証成功: 親コンポーネントにトークンとロールを渡す
                onLoginSuccess(data.access_token, data.role); 

            } else {
                // FastAPIから返されたエラーメッセージ
                setError(data.detail || 'ログインに失敗しました。サーバーエラーを確認してください。');
            }

        } catch (err) {
            setError('ネットワークエラーが発生しました。サーバーが起動しているか確認してください。');
            console.error('API連携エラー:', err);
        } finally {
            setLoading(false);
        }
    };

    // UI Styles
    const styles = {
        formContainer: {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            backgroundColor: '#fff',
        },
        header: {
            marginBottom: '10px',
            textAlign: 'center',
            color: '#333'
        },
        inputField: {
            padding: '12px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '16px',
        },
        submitButton: {
            padding: '12px',
            borderRadius: '5px',
            border: 'none',
            backgroundColor: '#007bff',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s',
        },
        errorText: {
            color: '#d9534f',
            backgroundColor: '#f2dede',
            padding: '10px',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '14px',
        },
    };

    return (
        <form onSubmit={handleLogin} style={styles.formContainer}>
            <h2 style={styles.header}>ログイン</h2>
            
            {/* エラーメッセージ */}
            {error && <p style={styles.errorText}>{error}</p>}
            
            {/* メールアドレス入力 */}
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="メールアドレス" 
                required 
                disabled={loading}
                style={styles.inputField}
            />
            
            {/* パスワード入力 */}
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="パスワード" 
                required 
                disabled={loading}
                style={styles.inputField}
            />
            
            {/* ログインボタン */}
            <button 
                type="submit" 
                disabled={loading}
                style={styles.submitButton}
            >
                {loading ? '処理中...' : 'ログイン'}
            </button>
        </form>
    );
};

export default LoginForm;
