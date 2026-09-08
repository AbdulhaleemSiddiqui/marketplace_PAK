import type {
  LoginRequest,
  RegisterRequest,
  SellerVerificationStatus,
  StoredUser,
  User,
} from "../types/auth";

import type {
  UserRole,
} from "../types/marketplace";

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

function normalizePhone(
  value: string
) {
  const digits =
    value.replace(/\D/g, "");

  if (
    digits.startsWith("92")
  ) {
    return digits;
  }

  if (
    digits.startsWith("0")
  ) {
    return `92${digits.slice(1)}`;
  }

  return `92${digits}`;
}

function createUser({
  role,
  name,
  email,
  phone,
  password,
}: {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  password: string;
}): User {
  const users = getUsers();

  const normalizedEmail =
    email.trim().toLowerCase();

  const normalizedPhone =
    phone
      ? normalizePhone(phone)
      : "";

  if (normalizedEmail) {
    const emailExists =
      users.some(
        (item) =>
          item.email
            .toLowerCase() ===
          normalizedEmail
      );

    if (emailExists) {
      throw new Error(
        "Email already registered."
      );
    }
  }

  if (normalizedPhone) {
    const phoneExists =
      users.some(
        (item) =>
          normalizePhone(
            item.phone
          ) === normalizedPhone
      );

    if (phoneExists) {
      throw new Error(
        "Phone number already registered."
      );
    }
  }

  const newUser: StoredUser = {
    id: crypto.randomUUID(),

    name:
      name.trim() ||
      "KhojMarket User",

    email: normalizedEmail,

    phone: normalizedPhone,

    password,

    role,

    phoneVerified: false,

    sellerVerificationStatus:
      role === "seller"
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
// REGISTER - EXISTING
// =====================================================

export function registerUser(
  request: RegisterRequest
): User {
  return createUser({
    role: request.role,
    name: request.name,
    email: request.email,
    phone: request.phone,
    password: request.password,
  });
}

// =====================================================
// SHORT SIGN-UP
// =====================================================

export function registerUserWithEmail({
  role,
  email,
  password,
}: {
  role: UserRole;
  email: string;
  password: string;
}): User {
  const normalizedEmail =
    email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error(
      "Email is required."
    );
  }

  return createUser({
    role,
    name: "KhojMarket User",
    email: normalizedEmail,
    phone: "",
    password,
  });
}

export function registerUserWithPhone({
  role,
  phone,
  password,
}: {
  role: UserRole;
  phone: string;
  password: string;
}): User {
  const normalizedPhone =
    normalizePhone(phone);

  if (
    normalizedPhone.length < 12
  ) {
    throw new Error(
      "Valid Pakistan phone number enter karein."
    );
  }

  /*
    StoredUser currently expects an email string.
    For phone-only demo accounts we keep a private local
    placeholder email. This is not shown to the user.
  */
  const placeholderEmail =
    `phone-${normalizedPhone}@khojmarket.local`;

  return createUser({
    role,
    name: "KhojMarket User",
    email: placeholderEmail,
    phone: normalizedPhone,
    password,
  });
}

// =====================================================
// GOOGLE - PHASE 1 DEMO
// =====================================================

export function continueWithGoogleDemo(
  role: UserRole
): User {
  const users = getUsers();

  const demoEmail =
    `google-demo-${role}@khojmarket.local`;

  const existing =
    users.find(
      (item) =>
        item.email.toLowerCase() ===
          demoEmail &&
        item.role === role
    );

  if (existing) {
    const user =
      safeUser(existing);

    localStorage.setItem(
      CURRENT_USER_KEY,
      JSON.stringify(user)
    );

    return user;
  }

  return createUser({
    role,
    name: "Google User",
    email: demoEmail,
    phone: "",
    password:
      `demo-${crypto.randomUUID()}`,
  });
}

// =====================================================
// LOGIN - EMAIL
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
// LOGIN - PHONE
// =====================================================

export function loginUserByPhone({
  phone,
  password,
  role,
}: {
  phone: string;
  password: string;
  role: UserRole;
}): User {
  const users = getUsers();

  const normalizedPhone =
    normalizePhone(phone);

  const user =
    users.find(
      (item) =>
        normalizePhone(
          item.phone
        ) === normalizedPhone &&
        item.password === password &&
        item.role === role
    );

  if (!user) {
    throw new Error(
      `Invalid ${role} phone login details.`
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
