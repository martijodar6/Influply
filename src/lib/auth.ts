import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/db';
import { users, creatorProfiles, companyProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword } from '@/lib/password';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Contraseña', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user) return null;

        const valid = await verifyPassword(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.uid = (user as any).id;
        token.role = (user as any).role;
      }

      // Refresh the profile pointer whenever the token is minted/updated —
      // cheap (indexed unique lookups) and keeps it correct right after
      // onboarding creates the profile row.
      if (token.uid && (trigger === 'signIn' || trigger === 'update' || !token.profileChecked)) {
        const role = token.role as string;
        if (role === 'CREATOR') {
          const profile = await db.query.creatorProfiles.findFirst({
            where: eq(creatorProfiles.userId, token.uid as string)
          });
          token.profileId = profile?.id ?? null;
          token.onboardingDone = profile?.onboardingDone ?? false;
          token.username = profile?.username ?? null;
        } else if (role === 'COMPANY') {
          const profile = await db.query.companyProfiles.findFirst({
            where: eq(companyProfiles.userId, token.uid as string)
          });
          token.profileId = profile?.id ?? null;
          token.onboardingDone = profile?.onboardingDone ?? false;
          token.slug = profile?.slug ?? null;
        }
        token.profileChecked = true;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
        (session.user as any).profileId = token.profileId ?? null;
        (session.user as any).onboardingDone = token.onboardingDone ?? false;
        (session.user as any).username = (token as any).username ?? null;
        (session.user as any).slug = (token as any).slug ?? null;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
