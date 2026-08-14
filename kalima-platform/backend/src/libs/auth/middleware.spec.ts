jest.mock("./jwt", () => ({
  verifyAccessToken: jest.fn(),
  isRefreshSessionActive: jest.fn(),
}));

import { authenticateToken, optionalAuthenticateToken } from "./middleware";
import { isRefreshSessionActive, verifyAccessToken } from "./jwt";

const mockedVerifyAccessToken = verifyAccessToken as jest.Mock;
const mockedIsRefreshSessionActive = isRefreshSessionActive as jest.Mock;

function createResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

describe("auth middleware session validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("accepts protected requests only when the token session is active", async () => {
    const payload = { userId: 10, sessionId: 55, roles: [] };
    mockedVerifyAccessToken.mockReturnValue(payload);
    mockedIsRefreshSessionActive.mockResolvedValue(true);
    const req: any = { headers: { authorization: "Bearer access-token" } };
    const res = createResponse();
    const next = jest.fn();

    await authenticateToken(req, res as any, next);

    expect(mockedIsRefreshSessionActive).toHaveBeenCalledWith(55, 10);
    expect(req.user).toBe(payload);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects protected requests when the backing session is inactive", async () => {
    mockedVerifyAccessToken.mockReturnValue({ userId: 10, sessionId: 55, roles: [] });
    mockedIsRefreshSessionActive.mockResolvedValue(false);
    const req: any = { headers: { authorization: "Bearer access-token" } };
    const res = createResponse();
    const next = jest.fn();

    await authenticateToken(req, res as any, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Session expired" });
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it("rejects protected requests when legacy tokens do not include a session id", async () => {
    mockedVerifyAccessToken.mockReturnValue({ userId: 10, roles: [] });
    const req: any = { headers: { authorization: "Bearer legacy-token" } };
    const res = createResponse();
    const next = jest.fn();

    await authenticateToken(req, res as any, next);

    expect(mockedIsRefreshSessionActive).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Invalid or expired token" });
    expect(next).not.toHaveBeenCalled();
  });

  it("passes protected session-store failures to error handling", async () => {
    const error = new Error("database unavailable");
    mockedVerifyAccessToken.mockReturnValue({ userId: 10, sessionId: 55, roles: [] });
    mockedIsRefreshSessionActive.mockRejectedValue(error);
    const req: any = { headers: { authorization: "Bearer access-token" } };
    const res = createResponse();
    const next = jest.fn();

    await authenticateToken(req, res as any, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  it("rejects malformed bearer headers with extra parts", async () => {
    const req: any = { headers: { authorization: "Bearer access-token extra" } };
    const res = createResponse();
    const next = jest.fn();

    await authenticateToken(req, res as any, next);

    expect(mockedVerifyAccessToken).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("treats inactive optional-auth sessions as anonymous", async () => {
    mockedVerifyAccessToken.mockReturnValue({ userId: 10, sessionId: 55, roles: [] });
    mockedIsRefreshSessionActive.mockResolvedValue(false);
    const req: any = { headers: { authorization: "Bearer access-token" } };
    const res = createResponse();
    const next = jest.fn();

    await optionalAuthenticateToken(req, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toBeUndefined();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("passes optional-auth session-store failures to error handling", async () => {
    const error = new Error("database unavailable");
    mockedVerifyAccessToken.mockReturnValue({ userId: 10, sessionId: 55, roles: [] });
    mockedIsRefreshSessionActive.mockRejectedValue(error);
    const req: any = { headers: { authorization: "Bearer access-token" } };
    const res = createResponse();
    const next = jest.fn();

    await optionalAuthenticateToken(req, res as any, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(res.status).not.toHaveBeenCalled();
  });

  describe("local dev auth bypass", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("attaches dev admin payload when bypass is enabled and no token is provided", async () => {
      process.env.NODE_ENV = "development";
      process.env.LOCAL_DEV_BYPASS_AUTH = "true";

      const req: any = { headers: {} };
      const res = createResponse();
      const next = jest.fn();

      await authenticateToken(req, res as any, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe(1);
      expect(req.user.roles).toEqual(
        expect.arrayContaining([{ portal: "store", role: "Admin" }])
      );
      expect(res.status).not.toHaveBeenCalled();
    });

    it("NEVER bypasses auth in production even if LOCAL_DEV_BYPASS_AUTH=true", async () => {
      process.env.NODE_ENV = "production";
      process.env.LOCAL_DEV_BYPASS_AUTH = "true";

      const req: any = { headers: {} };
      const res = createResponse();
      const next = jest.fn();

      await authenticateToken(req, res as any, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
      expect(req.user).toBeUndefined();
    });
  });
});
