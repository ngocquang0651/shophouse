import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { clearAccessToken, getAccessToken } from "@/lib/token";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiOptions = {
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

type ApiErrorBody = {
  message?: string | string[];
};

export function getApiUrl(path: string) {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 30000
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearAccessToken();
    }

    return Promise.reject(toApiError(error));
  }
);

export function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const status = error.response?.status ?? 0;
    const message = getApiErrorMessage(error);

    return new ApiError(status, message);
  }

  return new ApiError(0, error instanceof Error ? error.message : "Unexpected API error.");
}

function getApiErrorMessage(error: AxiosError<ApiErrorBody>) {
  const responseMessage = error.response?.data?.message;

  if (Array.isArray(responseMessage)) {
    return responseMessage.join(" ");
  }

  if (responseMessage) {
    return responseMessage;
  }

  if (error.response?.status) {
    return `Request failed with status ${error.response.status}.`;
  }

  return error.message || "Network request failed.";
}

export async function apiRequest<T>(config: AxiosRequestConfig, options: ApiOptions = {}) {
  const response = await apiClient.request<T, AxiosResponse<T>>(withApiAuth(config, options));
  return response.data;
}

export function apiGet<T>(path: string, options?: ApiOptions) {
  return apiRequest<T>({ method: "GET", url: path }, options);
}

export function apiPost<T>(path: string, body: unknown, options?: ApiOptions) {
  return apiRequest<T>({ method: "POST", url: path, data: body }, options);
}

export function apiPatch<T>(path: string, body: unknown, options?: ApiOptions) {
  return apiRequest<T>({ method: "PATCH", url: path, data: body }, options);
}

export function apiDelete<T>(path: string, options?: ApiOptions) {
  return apiRequest<T>({ method: "DELETE", url: path }, options);
}

export async function apiUpload<T>(path: string, formData: FormData, options: ApiOptions = {}) {
  const response = await apiClient.post<T>(
    path,
    formData,
    withApiAuth(
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      },
      options
    )
  );

  return response.data;
}

function withApiAuth(config: AxiosRequestConfig, options: ApiOptions = {}) {
  if (options.auth === false || typeof window === "undefined") {
    return config;
  }

  const token = getAccessToken();
  if (!token) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  } satisfies AxiosRequestConfig;
}
