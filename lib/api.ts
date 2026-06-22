import { clearAccessToken, getAccessToken } from "@/lib/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type ApiOptions = {
  auth?: boolean;
};

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getApiUrl(path: string) {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function request<T>(method: string, path: string, body?: unknown, options: ApiOptions = {}) {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  if (options.auth !== false && typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(getApiUrl(path), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store"
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      clearAccessToken();
    }

    let message = `Request failed with status ${response.status}.`;
    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join(" ");
      } else if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Keep the generic message when the API does not return JSON.
    }

    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiUpload<T>(path: string, formData: FormData, options: ApiOptions = {}) {
  const headers = new Headers();

  if (options.auth !== false && typeof window !== "undefined") {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(getApiUrl(path), {
    method: "POST",
    headers,
    body: formData,
    cache: "no-store"
  });

  if (!response.ok) {
    let message = `Upload failed with status ${response.status}.`;
    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errorBody.message)) {
        message = errorBody.message.join(" ");
      } else if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Keep the generic message when the API does not return JSON.
    }

    throw new ApiError(response.status, message);
  }

  return (await response.json()) as T;
}

export function apiGet<T>(path: string, options?: ApiOptions) {
  return request<T>("GET", path, undefined, options);
}

export function apiPost<T>(path: string, body: unknown, options?: ApiOptions) {
  return request<T>("POST", path, body, options);
}

export function apiPatch<T>(path: string, body: unknown, options?: ApiOptions) {
  return request<T>("PATCH", path, body, options);
}

export function apiDelete<T>(path: string, options?: ApiOptions) {
  return request<T>("DELETE", path, undefined, options);
}
