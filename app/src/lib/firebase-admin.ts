import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ═══════════════════════════════════════════════════════════
// Firebase Admin SDK — Used in API Routes (server-side only)
// ═══════════════════════════════════════════════════════════

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  // Parse the service account key from environment variable
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey) as any;
      // Handle escaped newlines from env variables
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
      return initializeApp({
        credential: cert(serviceAccount),
      });
    } catch (e) {
      console.error("[Firebase Admin] Failed to parse service account key:", e);
    }
  }

  // Fallback: Initialize without credentials (works in Firebase/GCP hosted environments)
  console.warn("[Firebase Admin] No service account key found, initializing without credentials.");
  return initializeApp();
}

const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export default adminApp;
