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
