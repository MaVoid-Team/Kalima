import crypto from "crypto";

export function hashInviteToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}
