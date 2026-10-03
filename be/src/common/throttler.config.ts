import type { ThrottlerModuleOptions } from "@nestjs/throttler";

/** Named buckets so a route can opt into a tighter limit with @Throttle. */
export const THROTTLE_SHORT = "short";
export const THROTTLE_MEDIUM = "medium";

/** Brute-force budget for /auth/login: 5 attempts per minute per IP. */
export const LOGIN_THROTTLE_LIMIT = 5;
export const LOGIN_THROTTLE_TTL_MS = 60_000;

export const throttlerOptions: ThrottlerModuleOptions = {
  throttlers: [
    { name: THROTTLE_SHORT, ttl: 1_000, limit: 20 },
    { name: THROTTLE_MEDIUM, ttl: 60_000, limit: 300 }
  ]
};
