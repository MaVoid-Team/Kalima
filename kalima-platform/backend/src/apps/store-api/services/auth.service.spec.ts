jest.mock("../../../libs/auth/firebase", () => ({
  firebaseAuth: {},
}));

jest.mock("../../../libs/auth/jwt", () => ({
  consumeRefreshToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  generateSingleSessionRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  revokeAllRefreshTokensForUser: jest.fn(),
  signAccessToken: jest.fn(),
}));

jest.mock("../emails/email.service", () => ({
  getEmailService: jest.fn(),
}));

jest.mock("./user-management.service", () => ({
  userManagementService: {},
}));

import AuthService from "./auth.service";
import {
  consumeRefreshToken,
  generateRefreshToken,
  generateSingleSessionRefreshToken,
  signAccessToken,
} from "../../../libs/auth/jwt";
import { portal_enum, role_enum } from "../generated/prisma/client";

const mockedConsumeRefreshToken = consumeRefreshToken as jest.Mock;
const mockedGenerateRefreshToken = generateRefreshToken as jest.Mock;
const mockedGenerateSingleSessionRefreshToken = generateSingleSessionRefreshToken as jest.Mock;
const mockedSignAccessToken = signAccessToken as jest.Mock;

function createServiceWithRoles(roles: role_enum[]) {
  const service = new AuthService() as any;
  service.userService = {
    findUserById: jest.fn().mockResolvedValue({
      id: 10,
      user_roles: roles.map((role) => ({ portal: portal_enum.store, role })),
    }),
  };
  return service;
}

describe("AuthService session issuance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGenerateRefreshToken.mockResolvedValue({
      id: 77,
      token: "refresh-token",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
    });
    mockedGenerateSingleSessionRefreshToken.mockResolvedValue({
      id: 77,
      token: "refresh-token",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
    });
    mockedSignAccessToken.mockReturnValue("access-token");
  });

  it("uses single-session issuance for non-admin-side sessions", async () => {
    const service = createServiceWithRoles([role_enum.Student]);

    const tokens = await service.issueTokens(10);

    expect(mockedGenerateSingleSessionRefreshToken).toHaveBeenCalledWith(10);
    expect(mockedGenerateRefreshToken).not.toHaveBeenCalled();
    expect(mockedSignAccessToken).toHaveBeenCalledWith({
      userId: 10,
      sessionId: 77,
      roles: [{ portal: portal_enum.store, role: role_enum.Student }],
    });
    expect(tokens).toMatchObject({
      accessToken: "access-token",
      refreshToken: "refresh-token",
    });
  });

  it.each([
    role_enum.Admin,
    role_enum.SubAdmin,
    role_enum.Moderator,
    role_enum.Assistant,
  ])("does not revoke existing sessions for admin-side role %s", async (role) => {
    const service = createServiceWithRoles([role]);

    await service.issueTokens(10);

    expect(mockedGenerateSingleSessionRefreshToken).not.toHaveBeenCalled();
    expect(mockedGenerateRefreshToken).toHaveBeenCalledWith(10);
    expect(mockedSignAccessToken).toHaveBeenCalledWith({
      userId: 10,
      sessionId: 77,
      roles: [{ portal: portal_enum.store, role }],
    });
  });

  it("applies single-session issuance to non-admin impersonation tokens", async () => {
    const service = createServiceWithRoles([role_enum.Student]);
    const impersonation = {
      actorUserId: 1,
      actorRoles: [{ portal: portal_enum.store, role: role_enum.Admin }],
      targetUserId: 10,
      startedAt: "2026-01-01T00:00:00.000Z",
    };

    await service.issueTokens(10, impersonation);

    expect(mockedGenerateSingleSessionRefreshToken).toHaveBeenCalledWith(10);
    expect(mockedGenerateRefreshToken).not.toHaveBeenCalled();
    expect(mockedSignAccessToken).toHaveBeenCalledWith({
      userId: 10,
      sessionId: 77,
      roles: [{ portal: portal_enum.store, role: role_enum.Student }],
      impersonation,
    });
  });

  it("login issues single-session tokens for non-admin users through the public flow", async () => {
    const user = {
      id: 10,
      password: "hash",
      user_roles: [{ portal: portal_enum.store, role: role_enum.Student }],
      auth_identities: [],
    };
    const service = createServiceWithRoles([role_enum.Student]);
    service.userService.findUserByEmail = jest.fn().mockResolvedValue(user);
    service.userService.verifyPassword = jest.fn().mockResolvedValue(true);
    service.userService.mapToBaseUserData = jest.fn().mockReturnValue({ id: 10 });

    await service.login({ email: "student@example.com", password: "secret" });

    expect(mockedGenerateSingleSessionRefreshToken).toHaveBeenCalledWith(10);
    expect(mockedSignAccessToken).toHaveBeenCalledWith({
      userId: 10,
      sessionId: 77,
      roles: [{ portal: portal_enum.store, role: role_enum.Student }],
    });
  });

  it("refresh atomically consumes the submitted refresh token before issuing replacement tokens", async () => {
    const service = createServiceWithRoles([role_enum.Student]);
    mockedConsumeRefreshToken.mockResolvedValue({
      userId: 10,
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
    });

    await service.refresh("old-refresh-token");

    expect(mockedConsumeRefreshToken).toHaveBeenCalledWith("old-refresh-token");
    expect(
      mockedConsumeRefreshToken.mock.invocationCallOrder[0],
    ).toBeLessThan(
      mockedGenerateSingleSessionRefreshToken.mock.invocationCallOrder[0],
    );
  });
});
