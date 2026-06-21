import * as jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import * as crypto from "crypto";
import { prisma } from "../db/prisma";

type RefreshTokenRow = { id: number; token: string; expiresAt: Date };

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

function getJwtExpiresIn(): SignOptions["expiresIn"] {
  return (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ?? "1h";
}

const REFRESH_TOKEN_EXPIRES_DAYS = Number(
  process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30,
);

export interface ImpersonationClaims {
  actorUserId: number;
  actorRoles: Array<{ portal: string; role: string }>;
  targetUserId: number;
  startedAt: string;
}

export interface AccessTokenPayload {
  userId: number;
  sessionId: number;
  roles?: Array<{ portal: string; role: string }>;
  impersonation?: ImpersonationClaims;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, getJwtSecret()) as AccessTokenPayload;
}

export async function generateRefreshToken(
  userId: number,
): Promise<RefreshTokenRow> {
  return createRefreshTokenRow(prisma, userId);
}

export async function generateSingleSessionRefreshToken(
  userId: number,
): Promise<RefreshTokenRow> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${userId})`;
    await tx.refresh_tokens.updateMany({
      where: { user_id: userId },
      data: { revoked: true },
    });
    return createRefreshTokenRow(tx, userId);
  });
}

async function createRefreshTokenRow(
  db: Pick<typeof prisma, "refresh_tokens">,
  userId: number,
): Promise<RefreshTokenRow> {
  const raw = crypto.randomBytes(48).toString("hex");
  const hash = crypto.createHash("sha256").update(raw).digest("hex");
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  );

  const row = await db.refresh_tokens.create({
    data: {
      user_id: userId,
      token_hash: hash,
      expires_at: expiresAt,
    },
    select: { id: true },
  });

  return { id: row.id, token: raw, expiresAt };
}

export async function isRefreshSessionActive(
  sessionId: number,
  userId: number,
): Promise<boolean> {
  const row = await prisma.refresh_tokens.findFirst({
    where: {
      id: sessionId,
      user_id: userId,
      revoked: false,
      expires_at: { gt: new Date() },
    },
    select: { id: true },
  });

  return !!row;
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

export async function consumeRefreshToken(
  rawToken: string,
): Promise<{ userId: number; expiresAt: Date } | null> {
  const hash = crypto.createHash("sha256").update(rawToken).digest("hex");

  return prisma.$transaction(async (tx) => {
    const row = await tx.refresh_tokens.findFirst({
      where: {
        token_hash: hash,
        revoked: false,
        expires_at: { gt: new Date() },
      },
      select: { id: true, user_id: true, expires_at: true },
    });

    if (!row) return null;

    const consumed = await tx.refresh_tokens.updateMany({
      where: { id: row.id, revoked: false },
      data: { revoked: true },
    });

    if (consumed.count !== 1) return null;

    return { userId: row.user_id, expiresAt: row.expires_at };
  });
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
