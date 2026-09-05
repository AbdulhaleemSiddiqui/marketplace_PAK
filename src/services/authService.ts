import type {
  LoginRequest,
  RegisterRequest,
  SellerVerificationStatus,
  StoredUser,
  User,
} from "../types/auth";

const USERS_KEY =
  "khoj_market_users";

const CURRENT_USER_KEY =
  "khoj_market_current_user";

// =====================================================
// USERS
// =====================================================

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(
      localStorage.getItem(
        USERS_KEY
      ) || "[]"
    );
  } catch {
    return [];
  }
}

function saveUsers(
  users: StoredUser[]
) {
  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );
}

function safeUser(
  user: StoredUser
): User {
  const {
    password: _password,
    ...safe
  } = user;

  return safe;
}

// =====================================================
// REGISTER
// =====================================================

export function registerUser(
  request: RegisterRequest
): User {
  const users = getUsers();

  const email =
    request.email
      .trim()
      .toLowerCase();

  const existing =
    users.find(
      (item) =>
        item.email.toLowerCase() ===
        email
    );

  if (existing) {
    throw new Error(
      "Email already registered."
    );
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),

    name:
      request.name.trim(),

    email,

    phone:
      request.phone.trim(),

    password:
      request.password,

    role:
      request.role,

    phoneVerified: false,

    sellerVerificationStatus:
      request.role === "seller"
        ? "not_started"
        : undefined,

    createdAt:
      new Date().toISOString(),
  };

  users.push(newUser);

  saveUsers(users);

  const user =
    safeUser(newUser);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user)
  );

  return user;
}

// =====================================================
// LOGIN
// =====================================================

export function loginUser(
  request: LoginRequest
): User {
  const users = getUsers();

  const email =
    request.email
      .trim()
      .toLowerCase();

  const user =
    users.find(
      (item) =>
        item.email.toLowerCase() ===
          email &&
        item.password ===
          request.password &&
        item.role ===
          request.role
    );

  if (!user) {
    throw new Error(
      `Invalid ${request.role} login details.`
    );
  }

  const safe =
    safeUser(user);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(safe)
  );

  return safe;
}

// =====================================================
// CURRENT USER
// =====================================================

export function getCurrentUser():
  User | null {
  try {
    const value =
      localStorage.getItem(
        CURRENT_USER_KEY
      );

    return value
      ? JSON.parse(value)
      : null;
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(
    CURRENT_USER_KEY
  );
}

// =====================================================
// PHONE VERIFY
// =====================================================

export function markPhoneVerified(
  userId: string
): User | null {
  const users =
    getUsers();

  const index =
    users.findIndex(
      (item) =>
        item.id === userId
    );

  if (index < 0) {
    return null;
  }

  users[index] = {
    ...users[index],
    phoneVerified: true,
  };

  saveUsers(users);

  const updated =
    safeUser(users[index]);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

// =====================================================
// SELLER VERIFICATION
// =====================================================

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
  const users =
    getUsers();

  const index =
    users.findIndex(
      (item) =>
        item.id === userId
    );

  if (index < 0) {
    return null;
  }

  if (
    users[index].role !==
    "seller"
  ) {
    return null;
  }

  users[index] = {
    ...users[index],

    sellerVerificationStatus:
      status,

    businessName:
      businessName ??
      users[index].businessName,

    businessCity:
      businessCity ??
      users[index].businessCity,

    businessCategory:
      businessCategory ??
      users[index]
        .businessCategory,
  };

  saveUsers(users);

  const updated =
    safeUser(users[index]);

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(updated)
  );

  return updated;
}

// =====================================================
// DEMO SELLER VERIFY
// Later admin will approve this.
// =====================================================

export function verifySellerForDemo(
  userId: string,
  businessName: string,
  businessCity: string,
  businessCategory: string
) {
  return updateSellerVerification({
    userId,

    status: "verified",

    businessName,

    businessCity,

    businessCategory,
  });
}