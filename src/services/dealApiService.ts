import { apiRequest } from "./apiClient";

export interface MarketplaceDeal {
  id: string;
  requirementId: string;
  requirementReferenceNo: string;
  requirementTitle: string;
  buyerUserId: string;
  sellerUserId: string;
  sellerName: string;
  inquiryId: string;
  status: "pending_confirmation" | "completed";
  buyerConfirmedAt?: string | null;
  sellerConfirmedAt?: string | null;
  completedAt?: string | null;
}

export function startDealCompletion(requirementId: string, inquiryId: string) {
  return apiRequest<{ message: string; deal: MarketplaceDeal }>(
    `/api/requirements/${requirementId}/complete`,
    {
      method: "PATCH",
      body: JSON.stringify({
        reason: "Buyer confirmed the marketplace deal was completed.",
        completionSource: "khojmarket_seller",
        inquiryId,
      }),
    },
  );
}

export function getRequirementDeal(requirementId: string) {
  return apiRequest<MarketplaceDeal>(
    `/api/deals/requirement/${requirementId}`,
  );
}

export function confirmSellerDealCompletion(dealId: string) {
  return apiRequest<MarketplaceDeal>(
    `/api/deals/${dealId}/seller-confirm`,
    { method: "PATCH" },
  );
}
