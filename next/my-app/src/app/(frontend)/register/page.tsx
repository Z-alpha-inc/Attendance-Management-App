"use client";

import Link from "next/link";
import { useState } from "react";

type RegisterRes =
  | { access_token?: string; user?: any }   // APIがトークンも返すパターン
  | { message?: string }                    // 返さないパターン
  | { error?: string };                     // エラーパターン

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleRegister() {
    setErr("");

    // フロント簡易バリデーション
    if (!name.trim()) return setErr("名前は必須です");
    if (!email.trim()) return setErr("メールは必須です");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("メール形式が正しくありません");
    if (password.length < 6) return setErr("パスワードは6文字以上にしてください");
    if (password !== confirm) return setErr("確認用パスワードが一致しません");

    try {
      setLoading(true);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // バックエンド側で role はデフォルト employee になる想定
        body: JSON.stringify({ name, email, password }),
      });

      const data: RegisterRes = await res.json();

      if (!res.ok) {
        // 409（重複）などもここに来る
        setErr((data as any)?.error || "登録に失敗しました");
        return;
      }

      // APIが access_token を返す場合は保存してそのままダッシュボードへ
      if ((data as any)?.access_token) {
        localStorage.setItem("token", (data as any).access_token);
        window.location.href = "/dashboard";
        return;
      }

      // access_token が無い運用ならログインへ誘導
      alert("登録が完了しました。ログインしてください。");
      window.location.href = "/login";
    } catch (e: any) {
      setErr(e?.message || "通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-4">
      <h1 className="text-xl font-bold">新規登録</h1>

      {err && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
          {err}
        </div>
      )}

      <label className="block space-y-1">
        <span className="text-sm text-gray-600">名前</span>
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="山田 太郎"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-gray-600">メール</span>
        <input
          type="email"
          className="border p-2 w-full rounded"
          placeholder="taro@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-gray-600">パスワード</span>
        <input
          type="password"
          className="border p-2 w-full rounded"
          placeholder="6文字以上"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-gray-600">パスワード（確認）</span>
        <input
          type="password"
          className="border p-2 w-full rounded"
          placeholder="もう一度入力"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </label>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {loading ? "登録中..." : "登録する"}
      </button>

      <div className="text-sm text-center text-gray-600">
        すでにアカウントをお持ちですか？{" "}
        <Link href="/login" className="text-blue-600 underline">ログイン</Link>
      </div>
    </div>
  );
}