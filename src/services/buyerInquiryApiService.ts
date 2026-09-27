import { apiRequest } from "./apiClient";

import type { SellerInquiry } from "../types/marketplace";

export function getBuyerInquiriesForRequirement(requirementId: string) {
  return apiRequest<SellerInquiry[]>(
    `/api/inquiries/requirement/${requirementId}`,
  );
}

export function markBuyerInquiryViewed(inquiryId: string) {
  return apiRequest<SellerInquiry>(`/api/inquiries/${inquiryId}/viewed`, {
    method: "PATCH",
  });
}

export function acceptBuyerInquiry(inquiryId: string) {
  return apiRequest<SellerInquiry>(`/api/inquiries/${inquiryId}/accept`, {
    method: "PATCH",
  });
}

export function rejectBuyerInquiry(inquiryId: string) {
  return apiRequest<SellerInquiry>(`/api/inquiries/${inquiryId}/reject`, {
    method: "PATCH",
  });
}
