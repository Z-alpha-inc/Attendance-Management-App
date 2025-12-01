'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { apiFetch } from '@/lib/api';
import toast, { Toaster } from 'react-hot-toast';

/** ms を hh:mm:ss に整形 */
function formatElapsed(ms: number) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${h.toString().padStart(2, '0')}:${m
    .toString()
    .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
  totalBreakMinutes?: number | null;
  isOnBreak?: boolean;
  currentBreakStart?: string | null;
  liveWorkedMs?: number | null;
};

export default function DashboardPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [today, setToday] = useState<TodayRes | null>(null);
  const [loading, setLoading] = useState(false);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [breakElapsedMs, setBreakElapsedMs] = useState(0);

  const workTimerRef = useRef<NodeJS.Timeout | null>(null);
  const breakTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ===== タイマー制御 =====
  const stopWorkTimer = () => {
    if (workTimerRef.current) clearInterval(workTimerRef.current);
    workTimerRef.current = null;
  };

  const stopBreakTimer = () => {
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    breakTimerRef.current = null;
  };

  // 勤務経過タイマー
  const startWorkTimer = (workedMs: number) => {
    stopWorkTimer();
    const origin = Date.now() - workedMs;
    const tick = () => setElapsedMs(Date.now() - origin);
    tick();
    workTimerRef.current = setInterval(tick, 1000);
  };

  // 休憩経過タイマー
  const startBreakTimer = (previousTotalMs: number, startIso: string) => {
    stopBreakTimer();
    const startMs = new Date(startIso).getTime();
    const tick = () => {
      const now = Date.now();
      const current = previousTotalMs + (now - startMs);
      setBreakElapsedMs(current);
    };
    tick();
    breakTimerRef.current = setInterval(tick, 1000);
  };

  // ===== API通信 =====
  const ensureAuth = () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) window.location.href = '/login';
  };

  const loadMe = useCallback(async () => {
    const data = await apiFetch<{ user: Me }>('/api/me');
    setMe(data.user);
  }, []);

  const loadToday = useCallback(async () => {
    const data = await apiFetch<TodayRes>('/api/me/attendance/today');
    setToday(data);

    stopWorkTimer();
    stopBreakTimer();

    // ---- 勤務時間 ----
    // 退勤済み（closed）の場合は、DB に保存された workedMinutes を必ず使う
    // 出勤中（open）の場合のみ liveWorkedMs を優先してリアルタイム表示する
    let workedMs = 0;
    if (data.status === 'closed' && data.workedMinutes != null) {
      workedMs = Math.max(0, data.workedMinutes * 60_000);
    } else {
      workedMs = Math.max(
        0,
        data.liveWorkedMs ?? (data.workedMinutes ?? 0) * 60_000
      );
    }
    if (data.status === 'open' && !data.isOnBreak) {
      startWorkTimer(workedMs);
    } else {
      setElapsedMs(workedMs);
    }

    // ---- 休憩時間 ----
    const previousTotalMs = Math.max(0, (data.totalBreakMinutes ?? 0) * 60_000);
    if (data.isOnBreak && data.currentBreakStart) {
      startBreakTimer(previousTotalMs, data.currentBreakStart);
    } else {
      setBreakElapsedMs(previousTotalMs);
    }

    // 通知
    if (data.status === 'open') {
      if (data.isOnBreak) toast('現在休憩中です ☕');
      else toast.success('すでに出勤中です');
    } else if (data.status === 'closed') {
    }
  }, []);

  // ===== 初期ロード =====
  useEffect(() => {
    ensureAuth();
    (async () => {
      try {
        await Promise.all([loadMe(), loadToday()]);
      } catch (e: any) {
        toast.error(e?.message || '読み込みに失敗しました');
      }
    })();
    return () => {
      stopWorkTimer();
      stopBreakTimer();
    };
  }, [loadMe, loadToday]);

  // ===== 打刻系 =====
  const clockIn = async () => {
    try {
      setLoading(true);
      await apiFetch('/api/attendance/clock-in', { method: 'POST' });
      toast.success('出勤しました！');
      await loadToday();
    } catch (e: any) {
      toast.error(e?.message || 'すでに出勤済みです');
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    if (today?.isOnBreak) {
      toast.error('先に休憩を終了してください');
      return;
    }
    try {
      setLoading(true);
      await apiFetch('/api/attendance/clock-out', { method: 'POST' });
      toast.success('退勤しました！お疲れさまでした');
      await loadToday();
    } catch (e: any) {
      toast.error(e?.message || '退勤に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const breakStart = async () => {
    try {
      setLoading(true);
      await apiFetch('/api/attendance/break/start', { method: 'POST' });
      await loadToday();
    } catch (e: any) {
      toast.error(e?.message || '休憩開始に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const breakEnd = async () => {
    try {
      setLoading(true);
      await apiFetch('/api/attendance/break/end', { method: 'POST' });
      toast.success('休憩を終了しました');
      await loadToday();
    } catch (e: any) {
      toast.error(e?.message || '休憩終了に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ===== 表示 =====
  const workedLabel = formatElapsed(elapsedMs);
  const breakLabel = formatElapsed(breakElapsedMs);
  const cannotClockOut = today?.status === 'open' && !!today?.isOnBreak;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <Toaster position="top-center" reverseOrder={false} />

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
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="px-3 py-2 rounded bg-gray-200 text-gray-800 text-sm"
          >
            ログアウト
          </button>
        </div>
      </header>

      <section className="border rounded p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>今日のステータス</div>
          <div className="font-semibold">
            {today?.status ?? '-'}
            {today?.status === 'open' && today?.isOnBreak ? '（休憩中）' : ''}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>勤務経過時間</div>
          <div className="font-mono">{workedLabel}</div>
        </div>

        <div className="flex items-center justify-between text-sm text-orange-500">
          <div>休憩経過時間（累計）</div>
          <div className="font-mono">{breakLabel}</div>
        </div>

        {cannotClockOut && (
          <p className="text-xs text-red-600">休憩中は退勤できません。</p>
        )}

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
            <>
              {!today?.isOnBreak ? (
                <button
                  onClick={breakStart}
                  disabled={loading}
                  className="bg-orange-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  休憩開始
                </button>
              ) : (
                <button
                  onClick={breakEnd}
                  disabled={loading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  休憩終了
                </button>
              )}

              <button
                onClick={clockOut}
                disabled={loading || cannotClockOut}
                title={
                  cannotClockOut
                    ? '休憩中は退勤できません。先に「休憩終了」を押してください。'
                    : ''
                }
                className={`bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50 ${
                  cannotClockOut ? 'cursor-not-allowed' : ''
                }`}
              >
                退勤
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
