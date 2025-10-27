import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';
import { todayKeyJST } from '@/lib/date';
import { Attendance } from '@/models/Attendance';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any); // ← JWT検証
    const userId = new mongoose.Types.ObjectId(payload.sub);

    const date_key = todayKeyJST();

    // 既に“open”があるか確認（当日二重出勤を防止）
    const open = await Attendance.findOne({
      user_id: userId,
      date_key,
      status: 'open',
    });
    if (open) {
      return NextResponse.json(
        { error: 'Already clocked-in today' },
        { status: 400 }
      );
    }

    const now = new Date();
    const created = await Attendance.create({
      user_id: userId,
      date_key,
      status: 'open',
      clock_in: now,
      clock_out: null,
      workedMinutes: null,
      lastModifiedBy: userId,
    });

    return NextResponse.json(
      { message: 'Clock-in OK', record: created },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
