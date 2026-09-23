import {
    clearAdminSession,
    getAdminAccessToken,
  } from "./adminSession";
  
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";
  
  interface ApiErrorResponse {
    message?: string;
    title?: string;
    detail?: string;
  }
  
  async function parseError(
    response: Response,
  ) {
    try {
      const body =
        (await response.json()) as ApiErrorResponse;
  
      return (
        body.message ||
        body.detail ||
        body.title ||
        `Request failed (${response.status})`
      );
    } catch {
      return `Request failed (${response.status})`;
    }
  }
  
  async function request<T>(
    path: string,
    options: RequestInit = {},
    token?: string | null,
  ): Promise<T> {
    const headers =
      new Headers(
        options.headers,
      );
  
    if (
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set(
        "Content-Type",
        "application/json",
      );
    }
  
    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`,
      );
    }
  
    const response =
      await fetch(
        `${API_BASE_URL}${path}`,
        {
          ...options,
          headers,
        },
      );
  
    if (!response.ok) {
      const message =
        await parseError(response);
  
      if (
        response.status === 401 ||
        response.status === 403
      ) {
        clearAdminSession();
      }
  
      throw new Error(message);
    }
  
    if (
      response.status === 204
    ) {
      return undefined as T;
    }
  
    const text =
      await response.text();
  
    if (!text) {
      return undefined as T;
    }
  
    return JSON.parse(text) as T;
  }
  
  export async function publicAdminRequest<T>(
    path: string,
    options: RequestInit = {},
  ) {
    return request<T>(
      path,
      options,
      null,
    );
  }
  
  export async function adminApiRequest<T>(
    path: string,
    options: RequestInit = {},
  ) {
    const token =
      getAdminAccessToken();
  
    if (!token) {
      throw new Error(
        "Admin session expired. Please login again.",
      );
    }
  
    return request<T>(
      path,
      options,
      token,
    );
  }
  