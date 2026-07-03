import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { adminDb } from "@/lib/firebase-admin";

// ═══════════════════════════════════════════════════════════
// NextAuth Configuration — Discord Provider + Firestore
// This file runs in Node.js runtime (not Edge)
// ═══════════════════════════════════════════════════════════

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (!account || account.provider !== "discord") return false;

      // Upsert user in Firestore
      const discordId = account.providerAccountId;
      const userRef = adminDb.collection("users").doc(discordId);

      const doc = await userRef.get();
      if (!doc.exists) {
        await userRef.set({
          discordId,
          email: user.email || "",
          name: user.name || "",
          avatar: user.image || "",
          discordDmEnabled: false,
          createdAt: new Date().toISOString(),
        });
      } else {
        await userRef.update({
          name: user.name || "",
          avatar: user.image || "",
          email: user.email || "",
        });
      }

      return true;
    },
  },
});
