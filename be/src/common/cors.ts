export type CorsOriginCallback = (error: Error | null, allow?: boolean) => void;

export const LOCAL_DEV_ORIGIN_PATTERN = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;

/**
 * Any localhost port is convenient while developing, but in production only the
 * configured frontend origins may talk to the API with credentials.
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: Iterable<string>, allowLocalhost: boolean) {
  if (!origin) {
    return true;
  }

  if (new Set(allowedOrigins).has(origin)) {
    return true;
  }

  return allowLocalhost && LOCAL_DEV_ORIGIN_PATTERN.test(origin);
}

export function buildCorsOriginCheck(allowedOrigins: string[], options: { allowLocalhost: boolean }) {
  const origins = new Set(allowedOrigins);

  return (origin: string | undefined, callback: CorsOriginCallback) => {
    if (isOriginAllowed(origin, origins, options.allowLocalhost)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS.`), false);
  };
}
