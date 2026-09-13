"use client";

import { useCallback, useState } from "react";
import type { AxiosRequestConfig } from "axios";
import { apiRequest, toApiError, type ApiError, type ApiOptions } from "@/lib/api";

type UseAxiosState<T> = {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
};

export function useAxios<T = unknown>() {
  const [state, setState] = useState<UseAxiosState<T>>({
    data: null,
    error: null,
    isLoading: false
  });

  const request = useCallback(async (config: AxiosRequestConfig, options?: ApiOptions) => {
    setState((current) => ({ ...current, error: null, isLoading: true }));

    try {
      const data = await apiRequest<T>(config, options);
      setState({ data, error: null, isLoading: false });
      return data;
    } catch (error) {
      const apiError = toApiError(error);
      setState((current) => ({ ...current, error: apiError, isLoading: false }));
      throw apiError;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    request,
    reset
  };
}
