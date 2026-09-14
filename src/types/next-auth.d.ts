import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'CREATOR' | 'COMPANY' | 'ADMIN';
      profileId: string | null;
      onboardingDone: boolean;
      username: string | null;
      slug: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    uid: string;
    role: string;
    profileId?: string | null;
    onboardingDone?: boolean;
    profileChecked?: boolean;
    username?: string | null;
    slug?: string | null;
  }
}
