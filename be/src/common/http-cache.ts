import { createHash } from "node:crypto";

/**
 * A weak ETag over the serialized body. The catalog changes only when an admin
 * edits it, so a repeat visitor revalidates with If-None-Match and gets a 304
 * instead of the full product list.
 */
export function buildEtag(body: unknown) {
  const payload = JSON.stringify(body ?? null);
  return `W/"${createHash("sha1").update(payload).digest("base64")}"`;
}

/**
 * `If-None-Match` may carry several candidates, and a cache is allowed to send
 * back a strong tag for what the server issued weakly, so both forms match.
 */
export function etagMatches(ifNoneMatch: string | undefined, etag: string) {
  if (!ifNoneMatch) return false;

  const normalize = (value: string) => value.trim().replace(/^W\//, "");
  const candidates = ifNoneMatch.split(",").map(normalize);

  return candidates.includes("*") || candidates.includes(normalize(etag));
}

export function buildPublicCacheControl(maxAgeSeconds: number, staleWhileRevalidateSeconds: number) {
  return `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${staleWhileRevalidateSeconds}`;
}
