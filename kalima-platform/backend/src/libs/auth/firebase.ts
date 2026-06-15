import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const normalizePrivateKey = (value?: string) => {
  if (!value) return value;

  let normalized = value.trim().replace(/\r/g, "");

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1);
  }

  return normalized.replace(/\\\\n/g, "\n").replace(/\\n/g, "\n");
};

const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      } as admin.ServiceAccount),
    });
  } else {
    const localDevBypass = process.env.FIREBASE_AUTH_LOCAL_DEV_BYPASS === "true"
      && ["development", "test", "local"].includes(process.env.NODE_ENV || "development");
    if (!localDevBypass) {
      throw new Error("Firebase service-account credentials are required unless FIREBASE_AUTH_LOCAL_DEV_BYPASS=true is explicitly enabled for local development.");
    }
    console.warn("Firebase local-dev auth bypass enabled; token verification is not production-safe.");
    admin.initializeApp({ projectId: projectId || "kalima-a5325" });
  }
}

export const firebaseAuth = admin.auth();
