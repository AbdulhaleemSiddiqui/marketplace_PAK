import {
  apiRequest,
  clearAccessToken,
  setAccessToken,
} from "./apiClient";

import type {
  LoginRequest,
  RegisterRequest,
  SellerVerificationStatus,
  User,
} from "../types/auth";

import type {
  UserRole,
} from "../types/marketplace";

const CURRENT_USER_KEY =
  "khoj_market_current_user";

interface ApiAuthUser {
  id: string;
  referenceNo?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  phoneVerified: boolean;
  sellerVerificationStatus?:
    | SellerVerificationStatus
    | null;
}

interface AuthResponse {
  token: string;
  expiresAt: string;
  user: ApiAuthUser;
}

function toFrontendUser(
  apiUser: ApiAuthUser,
): User {
  return {
    id: apiUser.id,
    referenceNo:
      apiUser.referenceNo ??
      undefined,
    name:
      apiUser.name ??
      "KhojMarket User",
    email:
      apiUser.email ??
      "",
    phone:
      apiUser.phone ??
      "",
    role:
      apiUser.role,
    phoneVerified:
      apiUser.phoneVerified,
    sellerVerificationStatus:
      apiUser.sellerVerificationStatus ??
      undefined,
    createdAt:
      new Date().toISOString(),
  } as User;
}

function saveCurrentUser(
  user: User,
) {
  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user),
  );
}

function saveAuthResponse(
  response: AuthResponse,
) {
  setAccessToken(
    response.token,
  );

  const user =
    toFrontendUser(
      response.user,
    );

  saveCurrentUser(user);

  return user;
}

function normalizePhone(
  value: string,
) {
  const digits =
    value.replace(/\D/g, "");

  if (
    digits.startsWith("92")
  ) {
    return `+${digits}`;
  }

  if (
    digits.startsWith("0")
  ) {
    return `+92${digits.slice(1)}`;
  }

  return `+92${digits}`;
}

function phonePlaceholderEmail(
  phone: string,
) {
  const digits =
    normalizePhone(phone)
      .replace(/\D/g, "");

  return `phone-${digits}@khojmarket.local`;
}

export async function registerUser(
  request: RegisterRequest,
): Promise<User> {
  const response =
    await apiRequest<AuthResponse>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({
          name:
            request.name?.trim() ||
            "KhojMarket User",
          email:
            request.email.trim(),
          phone:
            request.phone?.trim() ||
            "",
          password:
            request.password,
          role:
            request.role,
        }),
      },
    );

  return saveAuthResponse(
    response,
  );
}

export async function registerUserWithEmail({
  role,
  email,
  password,
}: {
  role: UserRole;
  email: string;
  password: string;
}): Promise<User> {
  return registerUser({
    role,
    name:
      "KhojMarket User",
    email:
      email.trim(),
    phone: "",
    password,
  } as RegisterRequest);
}

export async function registerUserWithPhone({
  role,
  phone,
  password,
}: {
  role: UserRole;
  phone: string;
  password: string;
}): Promise<User> {
  const normalizedPhone =
    normalizePhone(phone);

  return registerUser({
    role,
    name:
      "KhojMarket User",
    email:
      phonePlaceholderEmail(
        normalizedPhone,
      ),
    phone:
      normalizedPhone,
    password,
  } as RegisterRequest);
}

export async function loginUser(
  request: LoginRequest,
): Promise<User> {
  const response =
    await apiRequest<AuthResponse>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email:
            request.email
              .trim()
              .toLowerCase(),
          password:
            request.password,
        }),
      },
    );

  if (
    response.user.role !==
    request.role
  ) {
    clearAccessToken();

    throw new Error(
      `Ye account ${response.user.role} account hai. ${request.role} account select karein.`,
    );
  }

  return saveAuthResponse(
    response,
  );
}

export async function loginUserByPhone({
  phone,
  password,
  role,
}: {
  phone: string;
  password: string;
  role: UserRole;
}): Promise<User> {
  const response =
    await apiRequest<AuthResponse>(
      "/api/auth/login-phone",
      {
        method: "POST",
        body: JSON.stringify({
          phone:
            normalizePhone(phone),
          password,
        }),
      },
    );

  if (
    response.user.role !== role
  ) {
    clearAccessToken();

    throw new Error(
      `Ye account ${response.user.role} account hai. ${role} account select karein.`,
    );
  }

  return saveAuthResponse(
    response,
  );
}

export function getCurrentUser():
  User | null {
  try {
    const value =
      localStorage.getItem(
        CURRENT_USER_KEY,
      );

    return value
      ? JSON.parse(value)
      : null;
  } catch {
    return null;
  }
}

export async function refreshCurrentUser():
  Promise<User> {
  const response =
    await apiRequest<ApiAuthUser>(
      "/api/auth/me",
    );

  const user =
    toFrontendUser(
      response,
    );

  saveCurrentUser(user);

  return user;
}

export function logoutUser() {
  clearAccessToken();

  localStorage.removeItem(
    CURRENT_USER_KEY,
  );
}

/*
  Backward-compatible helper.
  Do NOT use this to verify a phone.
  Real verification must happen through /api/auth/otp/verify.
*/
export function markPhoneVerified(
  userId: string,
): User | null {
  const current =
    getCurrentUser();

  if (
    !current ||
    current.id !== userId
  ) {
    return null;
  }

  const updated = {
    ...current,
    phoneVerified: true,
  } as User;

  saveCurrentUser(updated);

  return updated;
}

/*
  These remain only for old UI compatibility.
  Real seller verification is controlled by the backend/admin flow.
*/
export function updateSellerVerification({
  userId,
  status,
  businessName,
  businessCity,
  businessCategory,
}: {
  userId: string;
  status: SellerVerificationStatus;
  businessName?: string;
  businessCity?: string;
  businessCategory?: string;
}): User | null {
  const current =
    getCurrentUser();

  if (
    !current ||
    current.id !== userId ||
    current.role !== "seller"
  ) {
    return null;
  }

  const updated = {
    ...current,
    sellerVerificationStatus:
      status,
    businessName:
      businessName ??
      (current as any)
        .businessName,
    businessCity:
      businessCity ??
      (current as any)
        .businessCity,
    businessCategory:
      businessCategory ??
      (current as any)
        .businessCategory,
  } as User;

  saveCurrentUser(updated);

  return updated;
}

export function verifySellerForDemo(
  userId: string,
  businessName: string,
  businessCity: string,
  businessCategory: string,
) {
  return updateSellerVerification({
    userId,
    status: "verified",
    businessName,
    businessCity,
    businessCategory,
  });
}

export async function continueWithGoogleDemo(
  _role: UserRole,
): Promise<User> {
  throw new Error(
    "Google login abhi backend se connected nahi hai. Email ya Phone use karein.",
  );
}
