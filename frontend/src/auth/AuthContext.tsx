import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient, setApiAccessToken } from "../api/client";
import type { ScreenItem, UserProfile } from "../api/types";

const SESSION_STORAGE_KEY = "christ.concourse.session.v2";

interface StoredSessionSnapshot {
  accessToken: string;
  user: UserProfile;
}

interface AuthContextValue {
  user: UserProfile | null;
  screens: ScreenItem[];
  isAuthenticated: boolean;
  isHydrating: boolean;
  hasPerm: (permission: string) => boolean;
  hasAnyPerm: (permissions: string[]) => boolean;
  loginWithCredentials: (params: {
    identifier: string;
    password?: string;
    otpCode?: string;
  }) => Promise<UserProfile>;
  signupAccount: (params: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    studentRegisterNumber?: string;
    department?: string;
    institution?: string;
    year?: number;
    accountType?: "student" | "guest";
  }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function evaluatePermission(held: string[], required: string): boolean {
  if (held.includes("admin:*") || held.includes("rbac:manage")) {
    return true;
  }
  if (held.includes(required)) {
    return true;
  }
  const idx = required.lastIndexOf(":");
  if (idx > 0) {
    const base = required.slice(0, idx);
    if (held.includes(`${base}:any`)) {
      return true;
    }
  }
  return false;
}

/**
 * Determines the optimal initial workspace path strictly from PBAC permissions
 * (Zero role-name branching — Rule 4).
 */
export function resolveDefaultWorkspacePath(permissions: string[]): string {
  const has = (p: string) => evaluatePermission(permissions, p);
  if (has("rbac:manage")) return "/app/discover";
  if (has("event:approve:budget")) return "/app/approvals/executive";
  if (has("event:approve:dept")) return "/app/approvals/department";
  if (has("sponsor:profile:manage:own")) return "/app/sponsor";
  if (has("event:create")) return "/app/manage-events";
  if (has("checkin:scan:own-event") && !has("registration:create")) {
    return "/app/scanner";
  }
  return "/app/discover";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [screens, setScreens] = useState<ScreenItem[]>([]);
  const [isHydrating, setIsHydrating] = useState(true);

  const hydrateNavigationAndProfile = useCallback(
    async (token: string, initialUser: UserProfile) => {
      setApiAccessToken(token);
      try {
        const [nav, freshMe] = await Promise.all([
          apiClient.getNavigation(),
          apiClient.getMe().catch(() => initialUser),
        ]);
        setScreens(Array.isArray(nav) ? nav : []);
        setUser(freshMe);
        try {
          sessionStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify({ accessToken: token, user: freshMe }),
          );
        } catch {
          // Ignore storage quota errors
        }
      } catch {
        setApiAccessToken(null);
        setUser(null);
        setScreens([]);
        try {
          sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } catch {
          // Ignore
        }
      }
    },
    [],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as StoredSessionSnapshot;
          if (parsed?.accessToken && parsed?.user && active) {
            await hydrateNavigationAndProfile(parsed.accessToken, parsed.user);
          }
        }
      } catch {
        // Invalid stored session
      } finally {
        if (active) setIsHydrating(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [hydrateNavigationAndProfile]);

  const loginWithCredentials = useCallback(
    async (params: {
      identifier: string;
      password?: string;
      otpCode?: string;
    }) => {
      const session = await apiClient.login(params);
      await hydrateNavigationAndProfile(session.accessToken, session.user);
      return session.user;
    },
    [hydrateNavigationAndProfile],
  );

  const signupAccount = useCallback(
    async (params: {
      email: string;
      password: string;
      name: string;
      phone?: string;
      studentRegisterNumber?: string;
      department?: string;
      institution?: string;
      year?: number;
      accountType?: "student" | "guest";
    }) => {
      const session = await apiClient.signup(params);
      await hydrateNavigationAndProfile(session.accessToken, session.user);
      return session.user;
    },
    [hydrateNavigationAndProfile],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      // Clear local session regardless
    }
    setApiAccessToken(null);
    setUser(null);
    setScreens([]);
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const [me, nav] = await Promise.all([
        apiClient.getMe(),
        apiClient.getNavigation(),
      ]);
      setUser(me);
      setScreens(nav);
    } catch {
      // Keep current profile on transient failure
    }
  }, [user]);

  const hasPerm = useCallback(
    (permission: string) => {
      if (!user) return false;
      return evaluatePermission(user.permissions, permission);
    },
    [user],
  );

  const hasAnyPerm = useCallback(
    (permissions: string[]) => {
      if (!user) return false;
      return permissions.some((p) => evaluatePermission(user.permissions, p));
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      screens,
      isAuthenticated: Boolean(user),
      isHydrating,
      hasPerm,
      hasAnyPerm,
      loginWithCredentials,
      signupAccount,
      logout,
      refreshProfile,
    }),
    [
      user,
      screens,
      isHydrating,
      hasPerm,
      hasAnyPerm,
      loginWithCredentials,
      signupAccount,
      logout,
      refreshProfile,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
