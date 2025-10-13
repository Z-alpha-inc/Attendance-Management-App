import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderFront from '../components/HeaderFront';

function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "名前を入力してください";
    if (!email.includes("@")) newErrors.email = "有効なメールアドレスを入力してください";
    if (password.length < 6) newErrors.password = "パスワードは6文字以上必要です";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // エラーなしなら true
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setFlashMessage(null);

    try {
      const res = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // FastAPI からのエラー詳細を表示
        throw new Error(data.detail || '登録に失敗しました');
      }

      setFlashMessage({ type: 'success', text: '登録成功！ログインしてください。' });
      console.log(data);

      // 登録後にログインページへリダイレクト
      navigate('/login');

    } catch (err: any) {
      setFlashMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 20 }}>
      <HeaderFront title="新規登録" />

      <form onSubmit={handleSignUp}>
        <div style={{ marginBottom: 10 }}>
          <label>名前</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
           {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8 }}
          />
          {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        </div>

        <button type="submit" style={{ padding: '10px 20px' }}>登録</button>
      </form>

      {flashMessage && (
        <div
          style={{
            marginTop: 15,
            padding: 10,
            borderRadius: 8,
            color: 'white',
            backgroundColor: flashMessage.type === 'success' ? '#10B981' : '#EF4444',
          }}
        >
          {flashMessage.text}
        </div>
      )}
    </div>
  );
}
export default SignUpPage; 