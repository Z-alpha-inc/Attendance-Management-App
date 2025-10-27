'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { minutesToHHMM } from '@/lib/time';

type Me = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
};

type TodayRes = {
  status: 'open' | 'closed' | 'none';
  clock_in?: string | null;
  clock_out?: string | null;
  workedMinutes?: number | null;
};

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [today, setToday] = useState<TodayRes | null>(null);
  const [loading, setLoading] = useState(false);

  function ensureAuth() {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/login';
  }

  async function loadMe() {
    const data = await apiFetch<{ user: Me }>('/api/me');
    setMe(data.user);
  }

  async function loadToday() {
    const data = await apiFetch<TodayRes>('/api/me/attendance/today');
    setToday(data);
  }

  useEffect(() => {
    ensureAuth();
    Promise.all([loadMe(), loadToday()]).catch((e) => {
      alert(e.message || '読み込み失敗');
      if (typeof window !== 'undefined') window.location.href = '/login';
    });
  }, []);

  async function clockIn() {
    try {
      setLoading(true);
      await apiFetch('/api/attendance/clock-in', { method: 'POST' });
      await loadToday();
    } catch (e: any) {
      alert(e.message || '出勤に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function clockOut() {
    try {
      setLoading(true);
      await apiFetch('/api/attendance/clock-out', { method: 'POST' });
      await loadToday();
    } catch (e: any) {
      alert(e.message || '退勤に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  const worked = minutesToHHMM(today?.workedMinutes);

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">ダッシュボード</h1>
          <p className="text-sm text-gray-500">
            {me ? `${me.name}（${me.role}）` : '読み込み中...'}
          </p>
        </div>
        <div className="flex gap-2">
          {/* 当月一覧 */}
          <Link
            href="/dashboard/monthly"
            className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
          >
            当月一覧
          </Link>

          {/* 管理画面（管理者のみ） */}
          {me?.role === 'admin' && (
            <Link
              href="/admin/users" // ← ここを /admin/users に修正
              className="px-3 py-2 rounded bg-purple-600 text-white text-sm"
            >
              管理画面
            </Link>
          )}

          <button
            onClick={logout}
            className="px-3 py-2 rounded bg-gray-200 text-gray-800 text-sm"
          >
            ログアウト
          </button>
        </div>
      </header>

      <section className="border rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>今日のステータス</div>
          <div className="font-semibold">{today?.status ?? '-'}</div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>勤務時間</div>
          <div className="font-mono">{worked}</div>
        </div>

        <div className="mt-2 flex gap-2">
          {today?.status !== 'open' && (
            <button
              onClick={clockIn}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              出勤
            </button>
          )}
          {today?.status === 'open' && (
            <button
              onClick={clockOut}
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              退勤
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
