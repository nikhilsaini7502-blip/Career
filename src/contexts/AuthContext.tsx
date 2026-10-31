import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isDemoUser: boolean;
  authError: string | null;
  clearAuthError: () => void;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  enterDemoMode: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, isDemoUser: false, authError: null,
  clearAuthError: () => {}, loginGoogle: async () => {},
  logout: async () => {}, enterDemoMode: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (localStorage.getItem('proofpath_demo_mode') === 'true') setIsDemoUser(true);
    let active = true;
    if (!supabase) {
      setAuthError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the deployment environment.');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthError(error.message);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsDemoUser(false);
        localStorage.removeItem('proofpath_demo_mode');
        setAuthError(null);
      }
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loginGoogle = async () => {
    if (!supabase) {
      setAuthError('Supabase is not configured. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
      return;
    }
    setLoading(true);
    setAuthError(null);
    localStorage.removeItem('proofpath_demo_mode');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) {
      setAuthError(error.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
      setUser(null);
      setIsDemoUser(false);
      localStorage.removeItem('proofpath_demo_mode');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign out failed.');
    } finally {
      setLoading(false);
    }
  };

  const enterDemoMode = () => {
    localStorage.setItem('proofpath_demo_mode', 'true');
    setIsDemoUser(true);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoUser, authError, clearAuthError: () => setAuthError(null), loginGoogle, logout, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
