import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithIdentifier: (identifier: string, password: string) => Promise<{ error: string | null }>;
  signInWithEmail: (identifier: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fetch or create profile for user
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch {
      // Ignore if offline
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Allows signing in with EITHER email address OR mobile phone number + password
   */
  const signInWithIdentifier = async (identifier: string, password: string) => {
    try {
      const trimmed = identifier.trim();
      if (!trimmed) {
        return { error: 'Please enter your email address or mobile phone number' };
      }

      let targetEmail = trimmed;

      // If the identifier doesn't contain '@', treat it as a phone number
      if (!trimmed.includes('@')) {
        const digits = trimmed.replace(/\D/g, '');
        if (digits.length < 10) {
          return { error: 'Please enter a valid 10-digit mobile number or email address' };
        }
        const last10 = digits.slice(-10);

        // Find user by phone number from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('email')
          .ilike('phone', `%${last10}%`)
          .limit(1)
          .maybeSingle();

        if (error || !data || !data.email) {
          return {
            error: `No registered account found with mobile number "${trimmed}". Please check the number or register.`,
          };
        }

        targetEmail = data.email;
      }

      // Authenticate with Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (signInError) {
        return { error: signInError.message };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      const cleanedPhone = phone.trim();
      const digits = cleanedPhone.replace(/\D/g, '');
      if (!digits || digits.length < 10) {
        return { error: 'A valid 10-digit mobile phone number is mandatory for registration' };
      }

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: cleanedPhone,
          },
        },
      });
      return { error: error ? error.message : null };
    } catch (err: any) {
      return { error: err.message || 'Failed to create account' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        signInWithIdentifier,
        signInWithEmail: signInWithIdentifier, // backward compatibility
        signUpWithEmail,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
