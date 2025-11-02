import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';
import { Attendance } from '@/models/Attendance';
import mongoose from 'mongoose';
import { workingMsExcludingBreaks } from '@/lib/time';

function todayKeyJST(now = new Date()) {
  const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, '0');
  const d = String(jst.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    const userId = new mongoose.Types.ObjectId(payload.sub);

    const date_key = todayKeyJST();
    const rec = await Attendance.findOne({ user_id: userId, date_key }).lean();

    // レコード無し
    if (!rec) {
      return NextResponse.json({
        date: date_key,
        status: 'none',
        clock_in: null,
        clock_out: null,
        workedMinutes: null,
        totalBreakMinutes: 0,
        isOnBreak: false,
        currentBreakStart: null,
        liveWorkedMs: 0,
        liveBreakMs: 0,
      });
    }

    const breaks = (rec as any).breaks ?? [];
    const now = new Date();

    // 休憩中か
    const currentBreak = breaks.find((b: any) => !b.end) || null;
    const isOnBreak = !!currentBreak;

    // サーバで“今時点の実働ms/休憩ms”を数値(ms)で算出
    const liveWorkedMs = rec.clock_in
      ? workingMsExcludingBreaks(new Date(rec.clock_in), now, breaks)
      : 0;

    const liveBreakMs = currentBreak
      ? Math.max(0, now.getTime() - new Date(currentBreak.start).getTime())
      : 0;

    return NextResponse.json({
      date: date_key,
      status: rec.status,                     // 'open' | 'closed'
      clock_in: rec.clock_in ?? null,
      clock_out: rec.clock_out ?? null,
      workedMinutes: rec.workedMinutes ?? null, // closedなら分が入っている
      totalBreakMinutes: rec.totalBreakMinutes ?? 0,
      isOnBreak,
      currentBreakStart: currentBreak?.start ?? null, // ISO（NextResponseがシリアライズ）
      liveWorkedMs,                               // ← 常に数値（ms）
      liveBreakMs,                                // ← 常に数値（ms）
    });
  } catch (e: any) {
    if (e instanceof Response) return e;
    const status = typeof e?.status === 'number' ? e.status : 500;
    const message =
      typeof e?.message === 'string'
        ? e.message
        : status === 401
        ? 'Unauthorized'
        : status === 403
        ? 'Forbidden'
        : 'Server error';
    return NextResponse.json({ error: message }, { status });
  }
}