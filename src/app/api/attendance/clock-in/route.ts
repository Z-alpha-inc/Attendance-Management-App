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

    // 同日レコードが1件でもあれば禁止（open/closed問わず）
    const exists = await Attendance.findOne({ user_id: userId, date_key })
      .select('status')
      .lean();

    if (exists) {
      const msg =
        exists.status === 'closed'
          ? '本日はすでに退勤済みです'
          : '本日は既に打刻されています';
      return NextResponse.json({ error: msg }, { status: 400 });
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
    if (e?.code === 11000) {
      // 競合（ユニーク制約がある場合）
      return NextResponse.json(
        { error: '本日はすでに打刻済みです' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
