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
  clearAuthError: () => {}, loginGoogle: async () => {}, logout: async () => {}, enterDemoMode: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const restoreSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (!mounted) return;
        setUser(data.session?.user ?? null);
        setIsDemoUser(!data.session && localStorage.getItem('proofpath_demo_mode') === 'true');
      } catch (error) {
        if (mounted) setAuthError(error instanceof Error ? error.message : 'Could not restore your session.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    void restoreSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        localStorage.removeItem('proofpath_demo_mode');
        setIsDemoUser(false);
        setAuthError(null);
      }
      setLoading(false);
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const clearAuthError = () => setAuthError(null);
  const loginGoogle = async () => {
    setLoading(true);
    setAuthError(null);
    localStorage.removeItem('proofpath_demo_mode');
    setIsDemoUser(false);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin, queryParams: { prompt: 'select_account' } }
      });
      if (error) throw error;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Google sign-in could not be started.');
      setLoading(false);
    }
  };
  const logout = async () => {
    setLoading(true);
    try {
      localStorage.removeItem('proofpath_demo_mode');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setIsDemoUser(false);
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Sign out failed.');
    } finally { setLoading(false); }
  };
  const enterDemoMode = () => {
    localStorage.setItem('proofpath_demo_mode', 'true');
    setUser(null);
    setIsDemoUser(true);
    setAuthError(null);
  };
  return <AuthContext.Provider value={{ user, loading, isDemoUser, authError, clearAuthError, loginGoogle, logout, enterDemoMode }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
