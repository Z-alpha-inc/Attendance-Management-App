import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ObjectId } from "mongodb";

export async function GET(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    const me = await User.findById(new ObjectId(payload.sub));
    if (!me) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ user: me });
  } catch (e: any) {
    const msg = typeof e?.status === "number" ? undefined : e?.message;
    return NextResponse.json({ error: msg ?? "Unauthorized" }, { status: (e as any)?.status ?? 401 });
  }
}