// src/app/api/me/attendance/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth";
import { Attendance } from "@/models/Attendance";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    const userId = new mongoose.Types.ObjectId(payload.sub);

    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const prefix = `${month}-`; // 例: "2025-10-"

    const docs = await Attendance
      .find({ user_id: userId, date_key: { $regex: `^${prefix}` } })
      .sort({ date_key: 1 })
      .lean();

    let total = 0;
    const records = docs.map((d: any) => {
      const minutes = d.workedMinutes ?? 0;
      total += minutes;
      return {
        date: d.date_key,
        workedMinutes: minutes,
        workedHours: Math.round((minutes / 60) * 100) / 100,
        status: d.status,
      };
    });

    return NextResponse.json({
      month,
      totalMinutes: total,
      totalHours: Math.round((total / 60) * 100) / 100,
      records,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}