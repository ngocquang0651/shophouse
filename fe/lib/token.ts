"use client";

const TOKEN_KEY = "luxestore:access-token";

export function getAccessToken() {
  return null;
}

export function setAccessToken(token: string) {
  void token;
}

export function clearAccessToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
  }
}
