import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

const rawGoogleId = process.env.GOOGLE_CLIENT_ID ?? process.env.GOOGLE_ID ?? "";
const rawGoogleSecret = process.env.GOOGLE_CLIENT_SECRET ?? process.env.GOOGLE_SECRET ?? "";

// Some local setups accidentally swap GOOGLE_ID and GOOGLE_SECRET.
const shouldSwapGoogleCredentials =
  rawGoogleSecret.includes(".apps.googleusercontent.com") &&
  !rawGoogleId.includes(".apps.googleusercontent.com");

const googleClientId = shouldSwapGoogleCredentials ? rawGoogleSecret : rawGoogleId;
const googleClientSecret = shouldSwapGoogleCredentials ? rawGoogleId : rawGoogleSecret;

const facebookClientId = process.env.FACEBOOK_CLIENT_ID ?? process.env.FACEBOOK_ID ?? "";
const facebookClientSecret = process.env.FACEBOOK_CLIENT_SECRET ?? process.env.FACEBOOK_SECRET ?? "";

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
    FacebookProvider({
      clientId: facebookClientId,
      clientSecret: facebookClientSecret,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account?.provider) {
        token.provider = account.provider;
      }

      if (account?.providerAccountId) {
        token.providerId = account.providerAccountId;
      }

      const adminEnv = process.env.ADMIN_EMAILS ?? "";
      const adminEmails = adminEnv
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      if (token.email && adminEmails.length > 0) {
        const isAdmin = adminEmails.includes(String(token.email).toLowerCase());
        token.role = isAdmin ? "admin" : "user";
      } else if (!token.role) {
        token.role = "user";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        session.user.provider = typeof token.provider === "string" ? token.provider : undefined;
        session.user.providerId =
          typeof token.providerId === "string" ? token.providerId : undefined;
        session.user.role = typeof token.role === "string" ? (token.role as "admin" | "user") : undefined;
      }
      return session;
    },
  },
});
