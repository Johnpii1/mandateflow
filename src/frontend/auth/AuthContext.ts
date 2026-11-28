import { createContext, useContext } from "react";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  wallets?: Array<{
    address: string;
    chainId: number;
    isPrimary: boolean;
    verifiedAt: string;
  }>;
}

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  status: "loading" | "authenticated" | "anonymous" | "error";
  sessionError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /**
   * Update the current user's profile (email, displayName, role).
   * Returns a promise that resolves when the server update completes and the local auth state is refreshed.
   */
  updateProfile: (
    updates: Partial<{
      email: string;
      displayName: string;
      role: "user" | "admin";
    }>,
  ) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
