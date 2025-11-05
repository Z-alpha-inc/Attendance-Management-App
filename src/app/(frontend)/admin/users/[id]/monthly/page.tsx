'use client';
import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { minutesToHHMM } from '@/lib/time';

// 1日分 + ★_id を追加（編集に必要）
type DayRecord = {
  _id: string;
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

// ★ params を Promise で受け取り、use() で取り出す
export default function AdminUserMonthlyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = use(params); // ← これでOK

  const [month, setMonth] = useState(initialMonth());
  const [data, setData] = useState<MonthlyRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

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
      // GET /api/admin/attendance?userId=...&month=YYYY-MM
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

  // ★編集API: PUT /api/admin/attendance/[id] に record._id を使う
  async function quickEditWorkedMinutes(recordId: string) {
    const input = window.prompt('勤務分（分）を整数で入力してください');
    if (input == null) return;
    const mins = Number(input);
    if (!Number.isFinite(mins) || mins < 0) {
      alert('0以上の数字を入力してください');
      return;
    }
    try {
      setSavingId(recordId);
      await apiFetch(`/api/admin/attendance/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify({ workedMinutes: mins }),
      });
      await load();
    } catch (e: any) {
      alert(e?.message || '更新に失敗しました');
    } finally {
      setSavingId(null);
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
          <thead className="bg-gray-700">
            <tr>
              <th className="text-left px-3 py-2">日付</th>
              <th className="text-left px-3 py-2">状態</th>
              <th className="text-right px-3 py-2">勤務時間</th>
              <th className="text-left px-3 py-2">出勤</th>
              <th className="text-left px-3 py-2">退勤</th>
              <th className="text-left px-3 py-2">編集</th>
            </tr>
          </thead>
          <tbody>
            {(data?.records ?? []).map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-3 py-2">{r.date_key}</td>
                <td className="px-3 py-2">
                  <span
                    className={
                      r.status === 'closed' ? 'text-red-700' : 'text-green-600'
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
                <td className="px-3 py-2">
                  <button
                    onClick={() => quickEditWorkedMinutes(r._id)}
                    disabled={savingId === r._id}
                    className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                  >
                    {savingId === r._id ? '保存中...' : '勤務分を編集'}
                  </button>
                </td>
              </tr>
            ))}
            {(!data?.records || data.records.length === 0) && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
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
