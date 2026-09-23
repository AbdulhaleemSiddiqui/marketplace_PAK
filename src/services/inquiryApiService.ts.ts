import {
  apiRequest,
} from "./apiClient";

export interface SellerInquiryResponse {
  id: string;
  requirementId: string;
  requirementReferenceNo?: string | null;
  requirementTitle?: string | null;

  buyerUserId: string;
  sellerUserId: string;

  sellerName?: string | null;
  sellerPhone?: string | null;
  sellerEmail?: string | null;

  message: string;
  offeredPrice?: number | null;

  status:
    | "sent"
    | "viewed"
    | "accepted"
    | "rejected";

  createdAt: string;

  viewedAt?: string | null;
  respondedAt?: string | null;
}

export async function sendSellerInquiry({
  requirementId,
  message,
  offeredPrice,
}: {
  requirementId: string;
  message: string;
  offeredPrice?: number;
}) {
  return apiRequest<SellerInquiryResponse>(
    `/api/inquiries/requirements/${requirementId}`,
    {
      method: "POST",

      body: JSON.stringify({
        message,
        offeredPrice:
          offeredPrice ?? null,
      }),
    },
  );
}
