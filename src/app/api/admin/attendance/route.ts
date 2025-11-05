import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { Attendance } from '@/models/Attendance';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    requireAdmin(payload);

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || '';
    const month =
      searchParams.get('month') || new Date().toISOString().slice(0, 7); // "YYYY-MM"

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const uid = new mongoose.Types.ObjectId(userId);
    const prefix = `${month}-`; // e.g. "2025-10-"

    const docs = await Attendance.find({
      user_id: uid,
      date_key: { $regex: `^${prefix}` },
    })
      .sort({ date_key: 1 })
      .lean();

    let total = 0;
    const records = docs.map((d: any) => {
      const minutes = d.workedMinutes ?? 0;
      total += minutes;
      return {
        _id: String(d._id),
        date_key: d.date_key,
        status: d.status,
        clock_in: d.clock_in,
        clock_out: d.clock_out,
        workedMinutes: minutes,
        workedHours: Math.round((minutes / 60) * 100) / 100,
      };
    });

    return NextResponse.json({
      userId,
      month,
      totalMinutes: total,
      totalHours: Math.round((total / 60) * 100) / 100,
      records,
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
