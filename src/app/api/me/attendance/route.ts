// src/app/api/me/attendance/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';
import { Attendance } from '@/models/Attendance';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    const userId = new mongoose.Types.ObjectId(payload.sub);

    const { searchParams } = new URL(req.url);
    // フロントは ?month=YYYY-MM を渡している
    const month = (searchParams.get('month') || '').trim();

    // YYYY-MM のバリデーション（不正なら現在月にフォールバック）
    const isYYYYMM = /^\d{4}-\d{2}$/.test(month);
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const monthKey = isYYYYMM ? month : `${yyyy}-${mm}`;

    // date_key が "YYYY-MM-" で始まるレコードを抽出
    const prefix = `^${monthKey}-`;
    const docs = await Attendance.find({
      user_id: userId,
      date_key: { $regex: prefix },
    })
      .select('date_key workedMinutes totalBreakMinutes clock_in clock_out')
      .sort({ date_key: 1 })
      .lean();

    const records = docs.map((d: any) => ({
      date_key: d.date_key,
      status: d.clock_out ? 'closed' : 'open',
      workedMinutes: d.workedMinutes ?? null,
      totalBreakMinutes: d.totalBreakMinutes ?? null,
      clock_in: d.clock_in ? new Date(d.clock_in).toISOString() : null,
      clock_out: d.clock_out ? new Date(d.clock_out).toISOString() : null,
    }));

    return NextResponse.json({ month: monthKey, records });
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
