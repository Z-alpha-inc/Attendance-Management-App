// src/app/api/attendance/break/start/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';
import { Attendance } from '@/models/Attendance';
import { todayKeyJST } from '@/lib/time';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    const userId = new mongoose.Types.ObjectId(payload.sub);
    const date_key = todayKeyJST();

    const rec = await Attendance.findOne({ user_id: userId, date_key });
    if (!rec) return NextResponse.json({ error: 'No attendance found' }, { status: 400 });

    // 前回の休憩が終わってなければ閉じる
    const last = rec.breaks[rec.breaks.length - 1];
    if (last && !last.end) last.end = new Date();

    // ✅ 新しい休憩を追加
    rec.breaks.push({ start: new Date(), end: null });

    // ✅ 現在までの休憩合計（前回分）を算出して保存
    let totalBreakMs = 0;
    for (const b of rec.breaks) {
      if (b.start && b.end) {
        totalBreakMs += new Date(b.end).getTime() - new Date(b.start).getTime();
      }
    }
    rec.totalBreakMinutes = Math.floor(totalBreakMs / 60_000);
    await rec.save();

    return NextResponse.json({
      message: 'Break started',
      breaks: rec.breaks,
      totalBreakMinutes: rec.totalBreakMinutes, // 👈 クライアント側でも使う
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}