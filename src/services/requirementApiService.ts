import {
    apiRequest,
    getApiBaseUrl,
  } from "./apiClient";
  
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
    postalCode?: string | null;
  
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
  
  export type PostedDateFilter =
    | "today"
    | "7days"
    | "30days";
  
  export interface RequirementFilters {
    search?: string;
  
    category?: string;
  
    requirementType?:
      | "product"
      | "service";
  
    country?: string;
    city?: string;
    area?: string;
    postalCode?: string;
  
    budgetMin?: number;
    budgetMax?: number;
  
    postedDate?: PostedDateFilter;
  
    status?: string;
  
    activityStatus?:
      | "active"
      | "inactive";
  
    page?: number;
    pageSize?: number;
  }
  
  function addString(
    params: URLSearchParams,
    key: string,
    value?: string,
  ) {
    const clean =
      value?.trim();
  
    if (clean) {
      params.set(
        key,
        clean,
      );
    }
  }
  
  function addNumber(
    params: URLSearchParams,
    key: string,
    value?: number,
  ) {
    if (
      value == null ||
      !Number.isFinite(value)
    ) {
      return;
    }
  
    params.set(
      key,
      String(value),
    );
  }
  
  function buildQuery(
    filters: RequirementFilters,
  ) {
    const params =
      new URLSearchParams();
  
    addString(
      params,
      "search",
      filters.search,
    );
  
    addString(
      params,
      "category",
      filters.category,
    );
  
    addString(
      params,
      "requirementType",
      filters.requirementType,
    );
  
    addString(
      params,
      "country",
      filters.country,
    );
  
    addString(
      params,
      "city",
      filters.city,
    );
  
    addString(
      params,
      "area",
      filters.area,
    );
  
    addString(
      params,
      "postalCode",
      filters.postalCode,
    );
  
    addNumber(
      params,
      "budgetMin",
      filters.budgetMin,
    );
  
    addNumber(
      params,
      "budgetMax",
      filters.budgetMax,
    );
  
    addString(
      params,
      "postedDate",
      filters.postedDate,
    );
  
    addString(
      params,
      "status",
      filters.status,
    );
  
    addString(
      params,
      "activityStatus",
      filters.activityStatus,
    );
  
    params.set(
      "page",
      String(
        filters.page ?? 1,
      ),
    );
  
    params.set(
      "pageSize",
      String(
        filters.pageSize ?? 10,
      ),
    );
  
    return params.toString();
  }
  
  export async function getPublicRequirements(
    filters: RequirementFilters = {},
  ) {
    return apiRequest<
      PagedResponse<RequirementListItem>
    >(
      `/api/requirements/public?${buildQuery(
        filters,
      )}`,
    );
  }
  
  export async function getMyRequirements(
    filters: RequirementFilters = {},
  ) {
    return apiRequest<
      PagedResponse<RequirementListItem>
    >(
      `/api/requirements/mine?${buildQuery(
        filters,
      )}`,
    );
  }
  
  export async function getAdminPendingRequirements(
    filters: RequirementFilters = {},
  ) {
    return apiRequest<
      PagedResponse<RequirementListItem>
    >(
      `/api/admin/requirements/pending?${buildQuery(
        filters,
      )}`,
    );
  }
  
  export function getRequirementImageUrl(
    path?: string | null,
  ) {
    if (!path) {
      return undefined;
    }
  
    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }
  
    const cleanPath =
      path.startsWith("/")
        ? path
        : `/${path}`;
  
    return `${getApiBaseUrl()}${cleanPath}`;
  }
  