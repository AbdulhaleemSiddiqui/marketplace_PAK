import { apiRequest } from "./apiClient";

export interface UserRating {
  userId: string;
  userName?: string | null;
  averageRating: number;
  reviewCount: number;
}

export function createMarketplaceReview(dealId: string, rating: number, comment?: string) {
  return apiRequest(
    `/api/deals/${dealId}/reviews`,
    {
      method: "POST",
      body: JSON.stringify({ rating, comment: comment?.trim() || null }),
    },
  );
}

export function getUserRating(userId: string) {
  return apiRequest<UserRating>(`/api/users/${userId}/rating`);
}

export interface MarketplaceReview {
  id: string;
  dealId: string;
  reviewerUserId: string;
  reviewerName: string;
  revieweeUserId: string;
  revieweeName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export function getDealReviews(dealId: string) {
  return apiRequest<MarketplaceReview[]>(`/api/deals/${dealId}/reviews`);
}
