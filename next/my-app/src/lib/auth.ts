import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./jwt";

export async function requireAuth(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  try {
    const payload = await verifyAccessToken(token);
    return payload as { sub: string; role?: "admin" | "employee" };
  } catch {
    throw new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
  }
}

export function requireAdmin(payload: { role?: string }) {
  if (payload.role !== "admin") {
    throw new Response(JSON.stringify({ error: "Admin only" }), { status: 403 });
  }
}