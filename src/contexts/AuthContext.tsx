import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, testFirestoreConnection } from '../services/firebase';

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
  user: null,
  loading: true,
  isDemoUser: false,
  authError: null,
  clearAuthError: () => {},
  loginGoogle: async () => {},
  logout: async () => {},
  enterDemoMode: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsDemoUser(false);
        setAuthError(null);
      } else {
        // If no user is logged in, check if user was previously in demo mode
        const savedDemo = localStorage.getItem('proofpath_demo_mode');
        if (savedDemo === 'true') {
          setIsDemoUser(true);
        } else {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const loginGoogle = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      localStorage.removeItem('proofpath_demo_mode');
      const authedUser = await loginWithGoogle();
      if (authedUser) {
        setUser(authedUser);
        setIsDemoUser(false);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/cancelled-popup-request' ||
        code === 'auth/popup-closed-by-user' ||
        code === 'auth/user-cancelled'
      ) {
        // User closed or cancelled popup; no fatal error
        return;
      }
      console.warn('Google sign-in exception:', err);
      setAuthError(code === 'auth/unauthorized-domain' ? 'This website domain is not authorized for Google sign-in. Add the current hosting domain in Firebase Console → Authentication → Settings → Authorized domains, then retry.' : (err?.message || 'Authentication could not be completed.'));
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('proofpath_demo_mode');
      setIsDemoUser(false);
      setUser(null);
      await logoutUser();
    } catch (err) {
      console.error('Logout Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const enterDemoMode = () => {
    localStorage.setItem('proofpath_demo_mode', 'true');
    setIsDemoUser(true);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isDemoUser, authError, clearAuthError, loginGoogle, logout, enterDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
