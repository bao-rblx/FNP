import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { PublicUser } from '../lib/authValidation';
import { 
  ApiError, 
  getMe, 
  patchMe, 
  postLogin, 
  postRegister, 
  setToken,
  postForgotPassword,
  postResetPassword,
  postChangePassword,
  postRedeemPoints
} from '../lib/api';

interface AuthContextType {
  user: PublicUser | null;
  authReady: boolean;
  refreshSession: () => Promise<void>;
  signIn: (
    schoolEmail: string,
    password: string,
  ) => Promise<{ ok: true } | { ok: false; error: 'invalid' | 'network' }>;
  signUp: (
    name: string,
    schoolEmail: string,
    studentId: string,
    password: string,
    phone?: string,
  ) => Promise<
    | { ok: true }
    | { ok: false; error: 'email_taken' | 'phone_taken' | 'network' | 'validation' }
  >;
  updateProfile: (updates: {
    name?: string;
    studentId?: string;
    phone?: string;
  }) => Promise<
    | { ok: true }
    | { ok: false; error: 'no_user' | 'not_found' | 'invalid_id' | 'network' }
  >;
  forgotPassword: (email: string) => Promise<{ ok: boolean; debug_token?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ ok: boolean }>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<{ ok: boolean }>;
  redeemPoints: (points: number) => Promise<{ ok: boolean; discountAmount?: number; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      const token = localStorage.getItem('fnp_token');
      if (!token) {
        setAuthReady(true);
        return;
      }
      try {
        const me = await getMe();
        setUser(me);
      } catch {
        setToken(null);
        setUser(null);
      } finally {
        setAuthReady(true);
      }
    };
    void run();
  }, []);

  const signIn = useCallback(async (schoolEmail: string, password: string) => {
    try {
      const { token, user: u } = await postLogin({
        email: schoolEmail.trim().toLowerCase(),
        password,
      });
      setToken(token);
      setUser(u);
      return { ok: true as const };
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.code === 'invalid_credentials')) {
        return { ok: false as const, error: 'invalid' as const };
      }
      return { ok: false as const, error: 'network' as const };
    }
  }, []);

  const signUp = useCallback(
    async (name: string, schoolEmail: string, studentId: string, password: string, phone?: string) => {
      try {
        const { token, user: u } = await postRegister({
          name,
          schoolEmail: schoolEmail.trim().toLowerCase(),
          studentId,
          password,
          phone
        });
        setToken(token);
        setUser(u);
        return { ok: true as const };
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.code === 'email_taken') return { ok: false as const, error: 'email_taken' as const };
          if (e.code === 'phone_taken') return { ok: false as const, error: 'phone_taken' as const };
          if (
            e.status === 400 &&
            (e.code === 'invalid_email_domain' ||
              e.code === 'invalid_student_id' ||
              e.code === 'weak_password')
          ) {
            return { ok: false as const, error: 'validation' as const };
          }
        }
        return { ok: false as const, error: 'network' as const };
      }
    },
    [],
  );

  const updateProfile = useCallback(
    async (updates: { name?: string; studentId?: string; phone?: string }) => {
      if (!user) return { ok: false as const, error: 'no_user' as const };
      try {
        const u = await patchMe(updates);
        setUser(u);
        return { ok: true as const };
      } catch (e) {
        if (e instanceof ApiError) {
          if (e.code === 'invalid_student_id') {
            return { ok: false as const, error: 'invalid_id' as const };
          }
          if (e.status === 401) return { ok: false as const, error: 'not_found' as const };
        }
        return { ok: false as const, error: 'network' as const };
      }
    },
    [user],
  );

  const forgotPassword = useCallback(async (email: string) => {
    return postForgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    return postResetPassword(token, newPassword);
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    return postChangePassword(oldPassword, newPassword);
  }, []);

  const redeemPoints = useCallback(async (points: number) => {
    try {
      const res = await postRedeemPoints(points);
      await refreshSession(); // Refresh to get updated points
      return { ok: true, discountAmount: res.discountAmount };
    } catch (e) {
      if (e instanceof ApiError) return { ok: false, error: e.code };
      return { ok: false, error: 'network' };
    }
  }, [refreshSession]);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      authReady,
      refreshSession,
      signIn,
      signUp,
      updateProfile,
      forgotPassword,
      resetPassword,
      changePassword,
      redeemPoints,
      signOut,
    }),
    [user, authReady, refreshSession, signIn, signUp, updateProfile, forgotPassword, resetPassword, changePassword, redeemPoints, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
