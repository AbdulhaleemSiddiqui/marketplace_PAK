import {
    adminApiRequest,
    publicAdminRequest,
  } from "./adminApiClient";
  
  import type {
    AdminSessionUser,
  } from "./adminSession";
  
  export interface AdminLoginResponse {
    token: string;
    expiresAt: string;
    user: AdminSessionUser;
  }
  
  export interface RequirementListItem {
    inquiryCount?: number;
    id: string;
    referenceNo: string;
    title: string;
    category: string;
    subCategory?: string | null;
    requirementType:
      | "product"
      | "service";
    status: string;
    activityStatus:
      | "active"
      | "inactive";
    budgetMin?: number | null;
    budgetMax?: number | null;
    country?: string | null;
    city?: string | null;
    area?: string | null;
    coverImagePath?: string | null;
    createdAt: string;
  }
  
  export interface PagedResponse<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  }
  
  export interface AdminDashboardStats {
    totalBuyers: number;
    totalSellers: number;
    pendingSellers: number;
    verifiedSellers: number;
    totalRequirements: number;
    pendingRequirements: number;
    activeVerifiedRequirements: number;
    completedRequirements: number;
    totalInquiries: number;
    completedDeals: number;
    totalReviews: number;
    totalSellerCreditBalance: number;
  }
  
  export interface AdminSeller {
    id: string;
    referenceNo?: string | null;
    name?: string | null;
    email: string;
    phone?: string | null;
    role: string;
    phoneVerified?: boolean;
    sellerVerificationStatus?: string | null;
    sellerVerificationReason?: string | null;
    businessName?: string | null;
    businessCity?: string | null;
    businessCategory?: string | null;
    createdAt?: string;
  }
  
  function buildQuery(
    values: Record<
      string,
      string | number | undefined
    >,
  ) {
    const params =
      new URLSearchParams();
  
    Object.entries(values).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== ""
        ) {
          params.set(
            key,
            String(value),
          );
        }
      },
    );
  
    return params.toString();
  }
  
  export function loginAdmin(
    email: string,
    password: string,
  ) {
    return publicAdminRequest<AdminLoginResponse>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({
          email:
            email
              .trim()
              .toLowerCase(),
          password,
        }),
      },
    );
  }
  
  export function getAdminDashboard() {
    return adminApiRequest<AdminDashboardStats>(
      "/api/admin/dashboard",
    );
  }
  
  export function getAdminPendingRequirements(
    options: {
      page?: number;
      pageSize?: number;
      search?: string;
      category?: string;
      requirementType?: string;
      country?: string;
      city?: string;
    } = {},
  ) {
    const query =
      buildQuery({
        page:
          options.page ?? 1,
        pageSize:
          options.pageSize ?? 50,
        search:
          options.search,
        category:
          options.category,
        requirementType:
          options.requirementType,
        country:
          options.country,
        city:
          options.city,
      });
  
    return adminApiRequest<
      PagedResponse<RequirementListItem>
    >(
      `/api/admin/requirements/pending?${query}`,
    );
  }
  
  export function approveAdminRequirement(
    requirementId: string,
  ) {
    return adminApiRequest<void>(
      `/api/admin/requirements/${requirementId}/approve`,
      {
        method: "POST",
      },
    );
  }
  
  export function rejectAdminRequirement(
    requirementId: string,
  ) {
    return adminApiRequest<void>(
      `/api/admin/requirements/${requirementId}/reject`,
      {
        method: "POST",
      },
    );
  }
  
  export function getPendingAdminSellers() {
    return adminApiRequest<AdminSeller[]>(
      "/api/admin/sellers/pending",
    );
  }
  
  export function approveAdminSeller(
    sellerUserId: string,
  ) {
    return adminApiRequest<void>(
      `/api/admin/sellers/${sellerUserId}/approve`,
      {
        method: "POST",
      },
    );
  }
  
  export function rejectAdminSeller(
    sellerUserId: string,
  ) {
    return adminApiRequest<void>(
      `/api/admin/sellers/${sellerUserId}/reject`,
      {
        method: "POST",
      },
    );
  }
  // ADD THESE TYPES/FUNCTION TO src/services/adminApiService.ts

export interface AdminUserListItem {
  id: string;
  referenceNo?: string | null;
  name?: string | null;
  email: string;
  phone?: string | null;
  role: string;
  phoneVerified: boolean;
  sellerVerificationStatus?: string | null;
  createdAt?: string | null;
}

export interface AdminUsersResponse {
  items: AdminUserListItem[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export async function getAdminUsers(
  options: {
    search?: string;
    page?: number;
    pageSize?: number;
  } = {},
) {
  const params =
    new URLSearchParams();

  if (options.search?.trim()) {
    params.set(
      "search",
      options.search.trim(),
    );
  }

  params.set(
    "page",
    String(options.page ?? 1),
  );

  params.set(
    "pageSize",
    String(options.pageSize ?? 20),
  );

  return adminApiRequest<AdminUsersResponse>(
    `/api/admin/users?${params.toString()}`,
  );
}

export interface AdminSellerWallet {
  sellerUserId?: string;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminWalletTransaction {
  id: string;
  sellerUserId?: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description?: string | null;
  createdAt: string;
}

export function getAdminSellerWallet(sellerUserId: string) {
  return adminApiRequest<AdminSellerWallet>(
    `/api/admin/sellers/${sellerUserId}/wallet`,
  );
}

export function getAdminSellerWalletTransactions(sellerUserId: string) {
  return adminApiRequest<AdminWalletTransaction[]>(
    `/api/admin/sellers/${sellerUserId}/wallet/transactions`,
  );
}

export function adjustAdminSellerWallet(
  sellerUserId: string,
  amount: number,
  reason: string,
) {
  return adminApiRequest<AdminSellerWallet>(
    `/api/admin/sellers/${sellerUserId}/wallet/adjust`,
    {
      method: "POST",
      body: JSON.stringify({ amount, reason }),
    },
  );
}
// ADD TO src/services/adminApiService.ts

export interface AdminInquiry {
  id: string;
  requirementId: string;
  requirementReferenceNo: string;
  requirementTitle: string;
  buyerUserId: string;
  sellerUserId: string;
  sellerName: string;
  sellerPhone?: string | null;
  sellerEmail: string;
  message: string;
  offeredPrice?: number | null;
  status: string;
  createdAt: string;
  viewedAt?: string | null;
  respondedAt?: string | null;
}

export function getAdminInquiriesApi(
  options: {
    search?: string;
    status?: string;
  } = {},
) {
  const params = new URLSearchParams();

  if (options.search?.trim()) {
    params.set("search", options.search.trim());
  }

  if (options.status && options.status !== "all") {
    params.set("status", options.status);
  }

  const query = params.toString();

  return adminApiRequest<AdminInquiry[]>(
    `/api/admin/inquiries${query ? `?${query}` : ""}`,
  );
}
