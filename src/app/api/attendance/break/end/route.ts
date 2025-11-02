import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';
import { Attendance } from '@/models/Attendance';
import { workingMinutesExcludingBreaks, todayKeyJST } from '@/lib/time';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    const userId = new mongoose.Types.ObjectId(payload.sub);
    const date_key = todayKeyJST();

    const rec = await Attendance.findOne({ user_id: userId, date_key });
    if (!rec) {
      return NextResponse.json({ error: 'No attendance found' }, { status: 400 });
    }

    // 最後の休憩を閉じる
    const last = rec.breaks[rec.breaks.length - 1];
    if (last && !last.end) {
      last.end = new Date();
    }

    // ---- 休憩合計の再計算 ----
    let totalBreakMs = 0;
    for (const b of rec.breaks) {
      if (b.start && b.end) {
        totalBreakMs += new Date(b.end).getTime() - new Date(b.start).getTime();
      }
    }

    // 分単位で保存
    rec.totalBreakMinutes = Math.floor(totalBreakMs / 60_000);

    // 実働時間（休憩控除後）も更新
    if (rec.clock_in) {
      rec.workedMinutes = workingMinutesExcludingBreaks(rec.clock_in, new Date(), rec.breaks);
    }

    await rec.save();

    return NextResponse.json({
      message: 'Break ended',
      totalBreakMinutes: rec.totalBreakMinutes,
      workedMinutes: rec.workedMinutes,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}