'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';

// 日付の経過を hh:mm:ss に整形
function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

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

  const [elapsed, setElapsed] = useState<number>(0); // 経過ミリ秒
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ==== 初期ロード ====
  useEffect(() => {
    ensureAuth();
    Promise.all([loadMe(), loadToday()]).catch((e) => {
      alert(e.message || '読み込み失敗');
      if (typeof window !== 'undefined') window.location.href = '/login';
    });
  }, []);

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

    // 出勤中なら経過タイマーを開始
    if (data.status === 'open' && data.clock_in) {
      startTimer(new Date(data.clock_in).getTime());
    } else {
      stopTimer();
    }
  }

  // ==== 打刻機能 ====

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
      stopTimer(); // 退勤したらタイマー止める
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

  // ==== タイマー関連 ====
  function startTimer(clockInMs: number) {
    stopTimer(); // 二重防止
    const update = () => {
      const now = Date.now();
      setElapsed(now - clockInMs);
    };
    update();
    intervalRef.current = setInterval(update, 1000); // 1秒ごとに更新
  }

  function stopTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setElapsed(0);
  }

  const workedLabel =
    today?.status === 'open' && today.clock_in
      ? formatElapsed(elapsed)
      : today?.workedMinutes
      ? `${Math.floor(today.workedMinutes / 60)}:${String(
          today.workedMinutes % 60
        ).padStart(2, '0')}`
      : '00:00:00';

  // ==== UI ====
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
          <Link
            href="/dashboard/monthly"
            className="px-3 py-2 rounded bg-blue-600 text-white text-sm"
          >
            当月一覧
          </Link>

          {me?.role === 'admin' && (
            <Link
              href="/admin/users"
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

        <div className="flex items-center justify-between text-sm text-white">
          <div>勤務経過時間</div>
          <div className="font-mono text-white">{workedLabel}</div>
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