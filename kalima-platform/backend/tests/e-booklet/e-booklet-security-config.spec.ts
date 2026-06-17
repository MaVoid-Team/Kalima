describe("e-booklet security configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.dontMock("nodemailer");
    jest.dontMock("firebase-admin");
  });

  test("credentialed CORS never allows file origins", async () => {
    const { corsOptions } = await import("../../src/config/corsOptions");
    expect(corsOptions.credentials).toBe(true);
    expect(corsOptions.origin).not.toContain("file://");
  });

  test("SMTP transport does not disable TLS certificate verification by default", async () => {
    const createTransport = jest.fn(() => ({ sendMail: jest.fn() }));
    jest.doMock("nodemailer", () => ({ __esModule: true, default: { createTransport }, createTransport }));
    const { EmailService } = await import("../../src/apps/store-api/emails/email.service");

    new EmailService({
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: { user: "user", pass: "pass" },
      from: "Kalima <noreply@example.com>",
    });

    expect(createTransport).toHaveBeenCalledWith(expect.not.objectContaining({ tls: expect.objectContaining({ rejectUnauthorized: false }) }));
  });

  test("Firebase auth fails closed without credentials unless explicit local-dev bypass is enabled", async () => {
    delete process.env.FIREBASE_PROJECT_ID;
    delete process.env.FIREBASE_CLIENT_EMAIL;
    delete process.env.FIREBASE_PRIVATE_KEY;
    delete process.env.FIREBASE_AUTH_LOCAL_DEV_BYPASS;
    process.env.NODE_ENV = "staging";
    jest.doMock("firebase-admin", () => ({
      __esModule: true,
      default: {
        apps: [],
        credential: { cert: jest.fn() },
        initializeApp: jest.fn(),
        auth: jest.fn(),
      },
    }));

    await expect(import("../../src/libs/auth/firebase")).rejects.toThrow("Firebase service-account credentials are required");
  });
});
