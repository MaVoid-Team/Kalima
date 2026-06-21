jest.mock("../db/prisma", () => ({
  prisma: {
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
    $transaction: jest.fn(),
    refresh_tokens: {
      create: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

import {
  consumeRefreshToken,
  generateRefreshToken,
  generateSingleSessionRefreshToken,
} from "./jwt";
import { prisma } from "../db/prisma";

const mockedPrisma = prisma as any;

describe("jwt refresh session helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedPrisma.refresh_tokens.create.mockResolvedValue({ id: 77 });
    mockedPrisma.refresh_tokens.updateMany.mockResolvedValue({ count: 1 });
    mockedPrisma.$transaction.mockImplementation(async (callback: any) => callback(mockedPrisma));
  });

  it("creates a refresh-token session row and returns its id", async () => {
    const refresh = await generateRefreshToken(10);

    expect(mockedPrisma.refresh_tokens.create).toHaveBeenCalledWith({
      data: {
        user_id: 10,
        token_hash: expect.any(String),
        expires_at: expect.any(Date),
      },
      select: { id: true },
    });
    expect(refresh).toMatchObject({ id: 77, token: expect.any(String) });
  });

  it("serializes non-admin single-session issuance with an advisory lock", async () => {
    await generateSingleSessionRefreshToken(10);

    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.$executeRaw).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.refresh_tokens.updateMany).toHaveBeenCalledWith({
      where: { user_id: 10 },
      data: { revoked: true },
    });
    expect(
      mockedPrisma.refresh_tokens.updateMany.mock.invocationCallOrder[0],
    ).toBeLessThan(
      mockedPrisma.refresh_tokens.create.mock.invocationCallOrder[0],
    );
  });

  it("atomically consumes a valid refresh token once", async () => {
    const expiresAt = new Date("2030-01-01T00:00:00.000Z");
    mockedPrisma.refresh_tokens.findFirst.mockResolvedValue({
      id: 77,
      user_id: 10,
      expires_at: expiresAt,
    });

    const payload = await consumeRefreshToken("raw-refresh-token");

    expect(mockedPrisma.$queryRaw).not.toHaveBeenCalled();
    expect(mockedPrisma.$transaction).toHaveBeenCalledTimes(1);
    expect(mockedPrisma.refresh_tokens.updateMany).toHaveBeenCalledWith({
      where: { id: 77, revoked: false },
      data: { revoked: true },
    });
    expect(payload).toEqual({ userId: 10, expiresAt });
  });

  it("returns null when a refresh token was already consumed", async () => {
    mockedPrisma.refresh_tokens.findFirst.mockResolvedValue(null);

    await expect(consumeRefreshToken("raw-refresh-token")).resolves.toBeNull();
  });

  it("returns null when a competing refresh already consumed the row", async () => {
    mockedPrisma.refresh_tokens.findFirst.mockResolvedValue({
      id: 77,
      user_id: 10,
      expires_at: new Date("2030-01-01T00:00:00.000Z"),
    });
    mockedPrisma.refresh_tokens.updateMany.mockResolvedValue({ count: 0 });

    await expect(consumeRefreshToken("raw-refresh-token")).resolves.toBeNull();
  });
});
