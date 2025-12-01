'use client';

import Link from 'next/link';

// すぐ自動リダイレクトしたいなら↓を使う
// import { useRouter } from "next/navigation";

export default function HomePage() {
  return (
    <main className="min-h-[100dvh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">勤怠管理アプリ</h1>
          <p className="text-gray-300 text-sm mt-2">
            はじめに、ログインまたは新規登録を選んでください
          </p>
        </div>

        <div className="grid gap-3">
          <Link
            href="/login"
            className="w-full text-center px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition"
          >
            ログイン
          </Link>

          <Link
            href="/register"
            className="w-full text-center px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition"
          >
            新規登録
          </Link>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Attendance App
        </div>
      </div>
    </main>
  );
}
