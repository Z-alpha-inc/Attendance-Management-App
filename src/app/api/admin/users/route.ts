import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { User } from '@/models/User';

export async function GET(req: Request) {
  try {
    await connectDB();
    const payload = await requireAuth(req as any);
    requireAdmin(payload);

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const role = searchParams.get('role') || '';
    const page = Math.max(1, Number(searchParams.get('page') || '1'));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get('limit') || '20'))
    );
    const filter: any = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    if (role) filter.role = role;

    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ created_at: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    return NextResponse.json({
      page,
      limit,
      total,
      items,
    });
  } catch (e: any) {
    // 認証/権限チェックでは Response(401/403) を throw しているため、それをそのまま返す
    if (e instanceof Response) return e;

    // e.status を持つ場合はそれに合わせて返す（例えば他レイヤーが status を付与する場合）
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
