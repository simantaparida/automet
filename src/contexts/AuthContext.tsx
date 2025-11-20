import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
    keepMeLoggedIn?: boolean
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    phone?: string
  ) => Promise<{ data: any; error: AuthError | null }>;
  signInWithGoogle: (
    keepMeLoggedIn?: boolean
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if we're in landing-only mode
  const isLandingOnly = process.env.NEXT_PUBLIC_LANDING_ONLY === 'true';

  // Check if Supabase is properly configured
  const hasSupabaseConfig =
    (process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

  useEffect(() => {
    // Skip auth initialization in landing-only mode or if Supabase not configured
    if (isLandingOnly || !hasSupabaseConfig) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to get session:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isLandingOnly, hasSupabaseConfig]);

  const signIn = async (
    email: string,
    password: string,
    keepMeLoggedIn: boolean = true
  ) => {
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('automet_keep_me_logged_in', String(keepMeLoggedIn));
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    phone?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone,
        },
      },
    });
    return { data, error };
  };

  const signInWithGoogle = async (keepMeLoggedIn: boolean = true) => {
    // Store preference in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('automet_keep_me_logged_in', String(keepMeLoggedIn));
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/onboarding/welcome');
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
