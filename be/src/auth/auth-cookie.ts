import type { CookieOptions } from "express";
import type { CookieSameSite } from "../common/env.validation";

export const AUTH_COOKIE_NAME = "luxestore_token";
export const DEFAULT_AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type AuthCookieSettings = {
  isProduction: boolean;
  sameSite: CookieSameSite;
};

/**
 * Browsers drop `SameSite=None` cookies that are not `Secure`, so a cross-site
 * deployment (frontend and API on different domains) always gets `secure`.
 */
export function buildAuthCookieOptions({ isProduction, sameSite }: AuthCookieSettings): CookieOptions {
  return {
    httpOnly: true,
    sameSite,
    secure: isProduction || sameSite === "none",
    path: "/"
  };
}

/** Falls back to the default when the value is missing, malformed or not positive. */
export function parseCookieMaxAge(value: string | undefined) {
  const parsed = Number(value);
  return value !== undefined && value.trim() !== "" && Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_AUTH_COOKIE_MAX_AGE_MS;
}
