import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { User } from '@/models/User';
import { signAccessToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: 'email と password は必須です' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'メールまたはパスワードが違います' },
        { status: 400 }
      );
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return NextResponse.json(
        { error: 'メールまたはパスワードが違います' },
        { status: 400 }
      );
    }

    const token = await signAccessToken({
      sub: String(user._id),
      role: user.role,
    });
    // レスポンスには password を含まない（toJSONのtransformで既に除外済み）
    return NextResponse.json({
      access_token: token,
      token_type: 'bearer',
      user,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Server error' },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { hint: 'POST { email, password }' },
    { status: 405 }
  );
}
