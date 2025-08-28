/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/tenantToken.ts
import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET!;
if (!SECRET) throw new Error("NEXTAUTH_SECRET is required for signing tokens");

export function signTenantToken(tenantId: string, venueName?: string, ttlMinutes = 60 * 24 * 7) {
  const payload = { tid: tenantId, name: venueName ?? undefined };
  return jwt.sign(payload, SECRET, { expiresIn: `${ttlMinutes}m` });
}

export function verifyTenantToken(token: string): { tid: string; name?: string } {
  const decoded = jwt.verify(token, SECRET) as any;
  if (!decoded?.tid) throw new Error("Invalid tenant token payload");
  return { tid: decoded.tid as string, name: decoded.name as string | undefined };
}
