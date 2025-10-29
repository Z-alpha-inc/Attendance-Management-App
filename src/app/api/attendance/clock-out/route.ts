import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';
import { todayKeyJST } from '@/lib/date';
import { Attendance } from '@/models/Attendance';
import mongoose from 'mongoose';

// 退勤は「更新」なので PUT にする
export async function PUT(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    const userId = new mongoose.Types.ObjectId(payload.sub);
    const date_key = todayKeyJST();

    // 当日の open レコードを取得
    const open = await Attendance.findOne({
      user_id: userId,
      date_key,
      status: 'open',
    });
    if (!open) {
      return NextResponse.json(
        { error: 'No open record for today' },
        { status: 400 }
      );
    }

    const now = new Date();
    const worked = Math.max(
      0,
      Math.round((now.getTime() - new Date(open.clock_in).getTime()) / 60000)
    );

    open.status = 'closed';
    open.clock_out = now;
    open.workedMinutes = worked;
    open.lastModifiedBy = userId;
    await open.save();

    return NextResponse.json({
      message: 'Clock-out OK',
      workedMinutes: worked,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}

// 互換を残したいなら（既存フロントが POST を叩いても動くように）
export const POST = PUT;