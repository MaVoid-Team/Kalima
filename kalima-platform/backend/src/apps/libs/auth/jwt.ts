import jwt, { type SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../db/prisma";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "1h";
const REFRESH_TOKEN_EXPIRES_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30,
);

function getJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }
  return JWT_SECRET;
}

export interface AccessTokenPayload {
  userId: number;
  role?: Array<{ portal: string; role: string }>;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
}

export async function generateRefreshToken(
  userId: number,
): Promise<{ token: string; expiresAt: Date }> {
  const raw = crypto.randomBytes(48).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.refresh_tokens.create({
    data: {
      user_id: userId,
      token_hash: hash,
      expires_at: expiresAt,
    },
  });

  return { token: raw, expiresAt };
}

export async function verifyRefreshToken(
  rawToken: string,
): Promise<{ userId: number; expiresAt: Date } | null> {
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

  const row = await prisma.refresh_tokens.findFirst({
    where: { token_hash: hash, revoked: false, expires_at: { gt: new Date() } },
    select: { user_id: true, expires_at: true },
  });

  return row ? { userId: row.user_id, expiresAt: row.expires_at } : null;
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

  await prisma.refresh_tokens.updateMany({
    where: { token_hash: hash },
    data: { revoked: true },
  });
}

export async function revokeAllRefreshTokensForUser(
  userId: number,
): Promise<void> {
  await prisma.refresh_tokens.updateMany({
    where: { user_id: userId },
    data: { revoked: true },
  });
}
