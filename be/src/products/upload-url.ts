/**
 * Base URL for uploaded files. A configured PUBLIC_API_URL wins, because behind a
 * proxy the request can report an internal host or plain http.
 */
export function resolveUploadBaseUrl(publicApiUrl: string, protocol: string, host: string | undefined) {
  if (publicApiUrl !== "") {
    return publicApiUrl.replace(/\/+$/, "");
  }

  return `${protocol}://${host ?? "localhost"}`;
}
