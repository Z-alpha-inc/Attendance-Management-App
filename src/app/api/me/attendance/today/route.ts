import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth } from '@/lib/auth';
import { Attendance } from '@/models/Attendance';
import mongoose from 'mongoose';

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

    return NextResponse.json({
      date: date_key,
      status: rec?.status ?? 'none', // none / open / closed
      clock_in: rec?.clock_in ?? null,
      clock_out: rec?.clock_out ?? null,
      workedMinutes: rec?.workedMinutes ?? null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}
