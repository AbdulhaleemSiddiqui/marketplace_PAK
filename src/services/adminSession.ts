export const ADMIN_ACCESS_TOKEN_KEY =
  "khoj_market_admin_access_token";

export const ADMIN_USER_KEY =
  "khoj_market_admin_user";

const LEGACY_ACCESS_TOKEN_KEY =
  "khoj_market_access_token";

const LEGACY_CURRENT_USER_KEY =
  "khoj_market_current_user";

export interface AdminSessionUser {
  id: string;
  referenceNo?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  phoneVerified?: boolean;
  sellerVerificationStatus?: string | null;
  createdAt?: string;
}

export function getAdminAccessToken() {
  return localStorage.getItem(
    ADMIN_ACCESS_TOKEN_KEY,
  );
}

export function getAdminUser():
  AdminSessionUser | null {
  try {
    const raw =
      localStorage.getItem(
        ADMIN_USER_KEY,
      );

    return raw
      ? (JSON.parse(
          raw,
        ) as AdminSessionUser)
      : null;
  } catch {
    return null;
  }
}

export function setAdminSession(
  token: string,
  user: AdminSessionUser,
) {
  localStorage.setItem(
    ADMIN_ACCESS_TOKEN_KEY,
    token,
  );

  localStorage.setItem(
    ADMIN_USER_KEY,
    JSON.stringify(user),
  );
}

export function clearAdminSession() {
  localStorage.removeItem(
    ADMIN_ACCESS_TOKEN_KEY,
  );

  localStorage.removeItem(
    ADMIN_USER_KEY,
  );
}

export function migrateLegacyAdminSession() {
  if (
    getAdminAccessToken() &&
    getAdminUser()
  ) {
    return;
  }

  try {
    const legacyToken =
      localStorage.getItem(
        LEGACY_ACCESS_TOKEN_KEY,
      );

    const legacyUserRaw =
      localStorage.getItem(
        LEGACY_CURRENT_USER_KEY,
      );

    if (
      !legacyToken ||
      !legacyUserRaw
    ) {
      return;
    }

    const legacyUser =
      JSON.parse(
        legacyUserRaw,
      ) as AdminSessionUser;

    if (
      legacyUser.role
        ?.toLowerCase() !==
      "admin"
    ) {
      return;
    }

    setAdminSession(
      legacyToken,
      legacyUser,
    );

    localStorage.removeItem(
      LEGACY_ACCESS_TOKEN_KEY,
    );

    localStorage.removeItem(
      LEGACY_CURRENT_USER_KEY,
    );
  } catch {
    // Ignore invalid old cache.
  }
}

export function hasValidAdminSession() {
  migrateLegacyAdminSession();

  const token =
    getAdminAccessToken();

  const user =
    getAdminUser();

  return Boolean(
    token &&
      user?.role
        ?.toLowerCase() ===
        "admin",
  );
}
