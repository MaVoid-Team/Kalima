import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

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
