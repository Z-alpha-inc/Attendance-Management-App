import { NextResponse, type NextRequest } from "next/server";
import { connectDB } from "@/lib/mongoose";
import { requireAuth, requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";
import { Attendance } from "@/models/Attendance";

// Next.js 15 の「params は Promise」対策を入れる
type Ctx = { params: { id: string } | Promise<{ id: string }> };

export async function PUT(req: NextRequest, ctx: Ctx) {
  try {
    await connectDB();

    const payload = await requireAuth(req as any);
    requireAdmin(payload);

    // 1) 動的ルートの id を await で取得（公式の推奨）
    const p = "then" in ctx.params ? await ctx.params : ctx.params;
    let id = p?.id;

    // 2) 念のためクエリ/ボディからもフォールバック取得
    if (!id) {
      const u = new URL(req.url);
      id = u.searchParams.get("id") ?? id;
    }
    if (!id) {
      try {
        const body = await req.json();
        id = body?.id || id;
      } catch {
        /* body 無しでもOK */
      }
    }

    // 3) id バリデーション
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // 4) 更新内容の取り出し
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const update: any = {
      lastModifiedBy: new mongoose.Types.ObjectId(payload.sub),
    };
    if (body.status !== undefined) update.status = body.status;
    if (body.workedMinutes !== undefined) update.workedMinutes = Number(body.workedMinutes);

    if (body.clock_in !== undefined) {
      update.clock_in = body.clock_in ? new Date(body.clock_in) : null;
    }
    if (body.clock_out !== undefined) {
      update.clock_out = body.clock_out ? new Date(body.clock_out) : null;
    }

    // 5) 更新実行
    const updated = await Attendance.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ record: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Server error" }, { status: 500 });
  }
}