// lib/tenantToken.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error("Missing JWT_SECRET");

export type TenantTokenPayload = { tid: string; iat?: number; exp?: number };

export function signTenantToken(email: string) {
  return jwt.sign({ tid: email }, SECRET, { expiresIn: "7d" });
}

export function verifyTenantToken(token: string): TenantTokenPayload {
  return jwt.verify(token, SECRET) as TenantTokenPayload;
}
