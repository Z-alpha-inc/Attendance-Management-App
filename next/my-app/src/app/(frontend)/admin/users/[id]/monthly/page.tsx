'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { minutesToHHMM } from '@/lib/time';

type DayRecord = {
  date_key: string;
  status: 'open' | 'closed';
  workedMinutes: number | null;
  clock_in?: string | null;
  clock_out?: string | null;
};

type MonthlyRes = {
  month: string;
  records: DayRecord[];
  user?: { name: string; email: string };
};

function shiftMonth(yyyyMM: string, diff: number) {
  const [y, m] = yyyyMM.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + diff);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${yy}-${mm}`;
}

function initialMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function AdminUserMonthlyPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;
  const [month, setMonth] = useState(initialMonth());
  const [data, setData] = useState<MonthlyRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await apiFetch<{ user: { role: string } }>('/api/me');
        if (me.user.role !== 'admin') {
          window.location.href = '/dashboard';
          return;
        }
      } catch {
        window.location.href = '/login';
        return;
      }
      await load();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, userId]);

  async function load() {
    setLoading(true);
    setErr('');
    try {
      // 期待API: GET /api/admin/attendance?userId=...&month=YYYY-MM
      const res = await apiFetch<MonthlyRes>(
        `/api/admin/attendance?userId=${userId}&month=${month}`
      );
      setData(res);
    } catch (e: any) {
      setErr(e?.message || '読み込み失敗');
    } finally {
      setLoading(false);
    }
  }

  const total = useMemo(
    () => (data?.records ?? []).reduce((s, r) => s + (r.workedMinutes ?? 0), 0),
    [data]
  );

  if (loading) return <div className="p-6">読み込み中...</div>;
  if (err) return <div className="p-6 text-red-700">{err}</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          {data?.user ? `${data.user.name} の当月勤怠` : '当月勤怠'}
        </h1>
        <Link href="/admin/users" className="text-sm text-blue-600 underline">
          ← ユーザー一覧へ
        </Link>
      </header>

      <div className="flex items-center justify-between border rounded p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            ← 前月
          </button>
          <button
            onClick={() => setMonth((m) => shiftMonth(m, +1))}
            className="px-3 py-2 rounded bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            翌月 →
          </button>
        </div>
        <div className="font-mono">{month}</div>
      </div>

      <div className="border rounded p-4">
        <div className="flex items-center justify-between">
          <div>合計勤務時間</div>
          <div className="font-mono">{minutesToHHMM(total)}</div>
        </div>
      </div>

      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-3 py-2">日付</th>
              <th className="text-left px-3 py-2">状態</th>
              <th className="text-right px-3 py-2">勤務時間</th>
              <th className="text-left px-3 py-2">出勤</th>
              <th className="text-left px-3 py-2">退勤</th>
            </tr>
          </thead>
          <tbody>
            {(data?.records ?? []).map((r) => (
              <tr key={r.date_key} className="border-t">
                <td className="px-3 py-2">{r.date_key}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      r.status === 'closed' ? 'text-green-700' : 'text-gray-600'
                    }
                  >
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {minutesToHHMM(r.workedMinutes ?? 0)}
                </td>
                <td className="px-3 py-2">
                  {r.clock_in
                    ? new Date(r.clock_in).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </td>
                <td className="px-3 py-2">
                  {r.clock_out
                    ? new Date(r.clock_out).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </td>
              </tr>
            ))}
            {(!data?.records || data.records.length === 0) && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                  レコードがありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
