import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev_secret");
const alg = "HS256";
const expiresInMinutes = parseInt(process.env.JWT_EXPIRE_MINUTES || "60", 10);

export async function signAccessToken(payload: Record<string, any>) {
  const exp = Math.floor(Date.now() / 1000) + expiresInMinutes * 60;
  return await new SignJWT({ ...payload, exp })
    .setProtectedHeader({ alg })
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}