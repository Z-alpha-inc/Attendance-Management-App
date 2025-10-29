'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type UserItem = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  created_at: string;
};

type UsersRes = {
  page: number;
  limit: number;
  total: number;
  items: UserItem[];
};

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<UsersRes | null>(null);
  const [loading, setLoading] = useState(true);

  // adminガード（未ログイン/権限なしは /login へ）
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
  }, []);

  async function load(p = page, keyword = q) {
    setLoading(true);
    try {
      const res = await apiFetch<UsersRes>(
        `/api/admin/users?q=${encodeURIComponent(keyword)}&page=${p}&limit=20`
      );
      setData(res);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">ユーザー一覧（管理）</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 underline">
          ← ダッシュボードへ
        </Link>
      </header>

      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="名前 or メールで検索"
          className="border rounded px-3 py-2 w-full"
        />
        <button
          onClick={() => load(1, q)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          検索
        </button>
      </div>

      {loading && <div>読み込み中...</div>}

      {!loading && (
        <div className="border rounded overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="text-left px-3 py-2">名前</th>
                <th className="text-left px-3 py-2">メール</th>
                <th className="text-left px-3 py-2">ロール</th>
                <th className="text-left px-3 py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {(data?.items ?? []).map((u: any, idx) => (
                <tr key={u.id ?? u._id ?? idx} className="border-t">
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.role}</td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/users/${u.id ?? u._id}/monthly`}
                      className="text-blue-600 underline"
                    >
                      当月勤怠を見る
                    </Link>
                  </td>
                </tr>
              ))}
              {(!data?.items || data.items.length === 0) && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    該当なし
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ページネーション（必要なら） */}
      {!!data && data.total > data.limit && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => load(Math.max(1, page - 1), q)}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-200"
            disabled={page <= 1}
          >
            前へ
          </button>
          <div className="px-2 py-2">Page {page}</div>
          <button
            onClick={() => load(page + 1, q)}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-200"
            disabled={page * data.limit >= data.total}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
