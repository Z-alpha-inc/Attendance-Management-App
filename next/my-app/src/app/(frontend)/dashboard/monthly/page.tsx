"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { minutesToHHMM } from "@/lib/time";

// 1日分のレコード
type DayRecord = {
  date_key: string;                 // "2025-10-26"
  status: "open" | "closed";        // その日の最終状態
  workedMinutes: number | null;
  clock_in?: string | null;         // ISO文字列
  clock_out?: string | null;        // ISO文字列
};

// APIレスポンス
type MonthlyRes = { month: string; records: DayRecord[] };

// YYYY-MM の加減算
function shiftMonth(yyyyMM: string, diff: number) {
  const [y, m] = yyyyMM.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + diff);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
}

// URL から ?month=YYYY-MM を読む（無ければ今月）
function readMonthFromLocation(): string {
  if (typeof window === "undefined") return "";
  const p = new URLSearchParams(window.location.search);
  const q = (p.get("month") || "").trim();
  if (/^\d{4}-\d{2}$/.test(q)) return q;
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export default function MonthlyPage() {
  const [month, setMonth] = useState<string>("");         // 表示対象の YYYY-MM
  const [data, setData] = useState<MonthlyRes | null>(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState<string>("");

  // 起動時に month をURLから初期化
  useEffect(() => {
    setMonth(readMonthFromLocation());
  }, []);

  // 合計分をメモ化
  const totalMinutes = useMemo(() => {
    return (data?.records ?? []).reduce((sum, r) => sum + (r.workedMinutes ?? 0), 0);
  }, [data]);

  // データ読込
  useEffect(() => {
    if (!month) return;
    setLoading(true);
    setErrMsg("");

    // 未ログインなら /login へ（簡易ガード）
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
    }

    (async () => {
      try {
        const res = await apiFetch<MonthlyRes>(`/api/me/attendance?month=${month}`);
        setData(res);
        // URL のクエリも同期（戻る/進む操作に対応）
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          url.searchParams.set("month", month);
          window.history.replaceState(null, "", url.toString());
        }
      } catch (e: any) {
        setErrMsg(e?.message || "当月勤怠の取得に失敗しました");
        // 認証切れ等はログインへ
        if (typeof window !== "undefined" && /unauthorized|401/i.test(String(e?.message))) {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [month]);

  // 月移動
  function gotoPrev() { setMonth((m) => shiftMonth(m, -1)); }
  function gotoNext() { setMonth((m) => shiftMonth(m, +1)); }

  // ローディング表示
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold">当月の勤怠</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 underline">← ダッシュボードへ</Link>
        </header>
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-24 w-full bg-gray-200 rounded" />
          <div className="h-48 w-full bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  // エラー表示
  if (errMsg) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-bold">当月の勤怠</h1>
          <Link href="/dashboard" className="text-sm text-blue-600 underline">← ダッシュボードへ</Link>
        </header>
        <div className="border rounded p-4 text-red-700 bg-red-50">
          {errMsg}
        </div>
      </div>
    );
  }

  // 本体表示
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold">当月の勤怠</h1>
        <Link href="/dashboard" className="text-sm text-blue-600 underline">← ダッシュボードへ</Link>
      </header>

      {/* 月セレクタ */}
      <div className="flex items-center justify-between border rounded p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={gotoPrev}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-200"
          >
            ← 前月
          </button>
          <button
            onClick={gotoNext}
            className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-200"
          >
            翌月 →
          </button>
        </div>
        <div className="font-mono text-lg">{data?.month || month}</div>
      </div>

      {/* 合計 */}
      <div className="border rounded p-4">
        <div className="flex items-center justify-between">
          <div>合計勤務時間</div>
          <div className="font-mono">{minutesToHHMM(totalMinutes)}</div>
        </div>
      </div>

      {/* 一覧 */}
      <div className="border rounded overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
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
                  <span className={r.status === "closed" ? "text-green-700" : "text-gray-600"}>
                    {r.status}
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono">
                  {minutesToHHMM(r.workedMinutes ?? 0)}
                </td>
                <td className="px-3 py-2">
                  {r.clock_in
                    ? new Date(r.clock_in).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
                    : "-"}
                </td>
                <td className="px-3 py-2">
                  {r.clock_out
                    ? new Date(r.clock_out).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })
                    : "-"}
                </td>
              </tr>
            ))}
            {(!data?.records || data.records.length === 0) && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-500" colSpan={5}>
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