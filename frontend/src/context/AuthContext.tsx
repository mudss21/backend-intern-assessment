import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as authApi from "../api/auth";
import { getToken } from "../api/client";
import type { User } from "../api/types";

type AuthState = {
  user: User | null;
  loading: boolean;
  ready: boolean;
};

const AuthContext = createContext<
  | (AuthState & {
      login: (e: string, p: string) => Promise<void>;
      register: (e: string, p: string, name?: string) => Promise<void>;
      logout: () => void;
      refreshUser: () => Promise<void>;
    })
  | null
>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const refreshUser = useCallback(async () => {
    const t = getToken();
    if (!t) {
      setUser(null);
      return;
    }
    setLoading(true);
    try {
      const me = await authApi.fetchMe();
      setUser(me);
    } catch {
      authApi.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await refreshUser();
      setReady(true);
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: u } = await authApi.login({ email, password });
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setLoading(true);
      try {
        const { user: u } = await authApi.register({ email, password, name });
        setUser(u);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      ready,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, ready, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
