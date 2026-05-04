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
  if (!projectId || !clientEmail || !privateKey) {
    console.warn(
      "Firebase credentials not set — Firebase auth will fail until configured.",
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    } as admin.ServiceAccount),
  });
}

export const firebaseAuth = admin.auth();
