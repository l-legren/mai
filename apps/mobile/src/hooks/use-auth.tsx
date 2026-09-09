import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import {
  signIn as signInService,
  signOutUser,
  signUp as signUpService,
  subscribeToAuthChanges,
  type AuthUser,
} from '@/services/auth.service';

/**
 * Session state, driven entirely by Supabase's auth-change subscription (which fires immediately
 * with the current session on subscribe, so no separate initial fetch is needed).
 */
type Auth = {
  user: AuthUser | null;
  /** True until the first auth-state event (current session, or none) has arrived. */
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  /** Returns `null` when the account needs email confirmation before it can sign in. */
  signUp: (name: string, email: string, password: string) => Promise<AuthUser | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    return subscribeToAuthChanges((next) => {
      setUser(next);
      setIsLoading(false);
    });
  }, []);

  const value: Auth = {
    user,
    isLoading,
    signIn: signInService,
    signUp: signUpService,
    signOut: signOutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
