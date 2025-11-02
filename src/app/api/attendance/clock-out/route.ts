// src/app/api/attendance/clock-out/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';
import { todayKeyJST } from '@/lib/date';
import { Attendance } from '@/models/Attendance';
import { workingMinutesExcludingBreaks } from '@/lib/time';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    const userId = new mongoose.Types.ObjectId(payload.sub);
    const date_key = todayKeyJST();

    const open = await Attendance.findOne({
      user_id: userId,
      date_key,
      status: 'open',
    });
    if (!open) {
      return NextResponse.json({ error: 'No open record for today' }, { status: 400 });
    }

    const now = new Date();

    // breaks は Date 型で渡す（文字列のままにしない）
    const breaks = (open as any).breaks ?? [];
    const breakDates = breaks.map((b: any) => ({
      start: new Date(b.start),
      end: b.end ? new Date(b.end) : null,
    }));

    const workedMinutes = workingMinutesExcludingBreaks(
      new Date(open.clock_in),
      now,
      breakDates
    );

    open.status = 'closed';
    open.clock_out = now;
    open.workedMinutes = workedMinutes; // “分”で保存
    open.lastModifiedBy = userId;
    await open.save();

    return NextResponse.json({ message: 'Clock-out OK', workedMinutes });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}