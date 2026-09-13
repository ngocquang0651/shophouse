"use client";

import { apiGet, apiPost } from "@/lib/api";
import { clearAccessToken } from "@/lib/token";
import type { User } from "@/types/user";

const AUTH_KEY = "luxestore:user";
const AUTH_EVENT = "luxestore-auth-change";

export type AuthUser = User;

export type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; message: string };

type LoginResponse = {
  user: AuthUser;
};

export async function getSession(): Promise<AuthUser | null> {
  try {
    const user = await apiGet<AuthUser>("/auth/me", { auth: false });
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event(AUTH_EVENT));
    return user;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event(AUTH_EVENT));
    return null;
  }
}

export async function login(identifier: string, password: string): Promise<LoginResult> {
  try {
    const result = await apiPost<LoginResponse>("/auth/login", { identifier, password }, { auth: false });
    localStorage.setItem(AUTH_KEY, JSON.stringify(result.user));
    window.dispatchEvent(new Event(AUTH_EVENT));
    return { ok: true, user: result.user };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "The identifier or password does not match our records."
    };
  }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
  clearAccessToken();
  void apiPost("/auth/logout", {}, { auth: false }).catch(() => undefined);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = localStorage.getItem(AUTH_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function isAdmin(user: AuthUser | null) {
  return user?.role === "admin";
}

export function subscribeToAuthChanges(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
