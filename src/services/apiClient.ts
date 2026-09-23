const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "";

const ACCESS_TOKEN_KEY =
  "khoj_market_access_token";

export function getAccessToken() {
  return localStorage.getItem(
    ACCESS_TOKEN_KEY,
  );
}

export function setAccessToken(
  token: string,
) {
  localStorage.setItem(
    ACCESS_TOKEN_KEY,
    token,
  );
}

export function clearAccessToken() {
  localStorage.removeItem(
    ACCESS_TOKEN_KEY,
  );
}

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

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    getAccessToken();

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
      await parseError(
        response,
      );

    if (
      response.status === 401
    ) {
      clearAccessToken();
    }

    throw new Error(
      message,
    );
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

  return JSON.parse(
    text,
  ) as T;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
