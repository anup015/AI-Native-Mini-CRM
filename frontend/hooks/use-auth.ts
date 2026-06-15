"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export function useAuth() {
  const session = useSession();

  return {
    ...session,
    isAuthenticated: !!session.data?.user,
    login: signIn,
    logout: signOut
  };
}
