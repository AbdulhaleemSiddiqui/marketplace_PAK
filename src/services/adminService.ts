import type {
    StoredUser,
    User,
  } from "../types/auth";
  
  import type {
    CreditTransaction,
    SavedBuyerRequirement,
    SellerInquiry,
  } from "../types/marketplace";
  
  import {
    addCredits,
    getCreditBalance,
    getCreditTransactionsByUser,
  } from "./creditService";
  
  import {
    updateRequirementStatus,
  } from "./requirementService";
  
  const USERS_KEY =
    "khoj_market_users";
  
  const CURRENT_USER_KEY =
    "khoj_market_current_user";
  
  const REQUIREMENTS_KEY =
    "buyer_requirements";
  
  const INQUIRIES_KEY =
    "khoj_market_inquiries";
  
  // =====================================================
  // USERS
  // =====================================================
  
  function getStoredUsers():
    StoredUser[] {
    try {
      const value =
        localStorage.getItem(
          USERS_KEY
        );
  
      if (!value) {
        return [];
      }
  
      const parsed =
        JSON.parse(value);
  
      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }
  
  function saveStoredUsers(
    users: StoredUser[]
  ) {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(users)
    );
  }
  
  function toSafeUser(
    user: StoredUser
  ): User {
    const {
      password: _password,
      ...safeUser
    } = user;
  
    void _password;
  
    return safeUser;
  }
  
  export function getAdminUsers():
    User[] {
    return getStoredUsers().map(
      toSafeUser
    );
  }
  
  export function getBuyers():
    User[] {
    return getAdminUsers().filter(
      (user) =>
        user.role === "buyer"
    );
  }
  
  export function getSellers():
    User[] {
    return getAdminUsers().filter(
      (user) =>
        user.role === "seller"
    );
  }
  
  // =====================================================
  // SELLER VERIFICATION
  // =====================================================
  
  export function updateSellerVerificationStatus(
    userId: string,
    status:
      | "verified"
      | "rejected"
      | "pending"
  ) {
    const users =
      getStoredUsers();
  
    const updatedUsers =
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              sellerVerificationStatus:
                status,
            }
          : user
      );
  
    saveStoredUsers(
      updatedUsers
    );
  
    // Update currently logged-in user too,
    // if same seller is logged in.
    try {
      const currentValue =
        localStorage.getItem(
          CURRENT_USER_KEY
        );
  
      if (currentValue) {
        const currentUser =
          JSON.parse(
            currentValue
          ) as User;
  
        if (
          currentUser.id ===
          userId
        ) {
          localStorage.setItem(
            CURRENT_USER_KEY,
            JSON.stringify({
              ...currentUser,
              sellerVerificationStatus:
                status,
            })
          );
        }
      }
    } catch {
      // Ignore invalid demo localStorage data.
    }
  }
  
  // =====================================================
  // REQUIREMENTS
  // =====================================================
  
  export function getAdminRequirements():
    SavedBuyerRequirement[] {
    try {
      const value =
        localStorage.getItem(
          REQUIREMENTS_KEY
        );
  
      if (!value) {
        return [];
      }
  
      const parsed =
        JSON.parse(value);
  
      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }
  
  export function approveRequirement(
    requirementId: string
  ) {
    return updateRequirementStatus(
      requirementId,
      "verified"
    );
  }
  
  export function rejectRequirement(
    requirementId: string
  ) {
    return updateRequirementStatus(
      requirementId,
      "rejected"
    );
  }
  
  export function sendRequirementToAdminReview(
    requirementId: string
  ) {
    return updateRequirementStatus(
      requirementId,
      "admin_review_required"
    );
  }
  
  // =====================================================
  // INQUIRIES
  // =====================================================
  
  export function getAdminInquiries():
    SellerInquiry[] {
    try {
      const value =
        localStorage.getItem(
          INQUIRIES_KEY
        );
  
      if (!value) {
        return [];
      }
  
      const parsed =
        JSON.parse(value);
  
      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return [];
    }
  }
  
  // =====================================================
  // CREDITS
  // =====================================================
  
  export function getSellerAdminBalance(
    userId: string
  ) {
    return getCreditBalance(
      userId
    );
  }
  
  export function addSellerAdminCredits(
    userId: string,
    amount: number
  ) {
    return addCredits(
      userId,
      amount,
      "Credits added by admin",
      "admin_credit"
    );
  }
  
  export function getSellerAdminTransactions(
    userId: string
  ): CreditTransaction[] {
    return getCreditTransactionsByUser(
      userId
    );
  }
  
  // =====================================================
  // DASHBOARD
  // =====================================================
  
  export function getAdminDashboardStats() {
    const users =
      getAdminUsers();
  
    const requirements =
      getAdminRequirements();
  
    const inquiries =
      getAdminInquiries();
  
    const sellers =
      users.filter(
        (user) =>
          user.role === "seller"
      );
  
    const buyers =
      users.filter(
        (user) =>
          user.role === "buyer"
      );
  
    const pendingRequirements =
      requirements.filter(
        (requirement) =>
          [
            "phone_verification_pending",
            "phone_verified",
            "ai_verification_pending",
            "admin_review_required",
          ].includes(
            requirement.status
          )
      );
  
    const verifiedRequirements =
      requirements.filter(
        (requirement) =>
          requirement.status ===
          "verified"
      );
  
    const pendingSellers =
      sellers.filter(
        (seller) =>
          seller.sellerVerificationStatus !==
          "verified"
      );
  
    const creditsUsed =
      inquiries.reduce(
        (total, inquiry) =>
          total +
          inquiry.creditCost,
        0
      );
  
    return {
      totalUsers:
        users.length,
  
      buyers:
        buyers.length,
  
      sellers:
        sellers.length,
  
      pendingRequirements:
        pendingRequirements.length,
  
      verifiedRequirements:
        verifiedRequirements.length,
  
      pendingSellerVerifications:
        pendingSellers.length,
  
      totalInquiries:
        inquiries.length,
  
      creditsUsed,
    };
  }