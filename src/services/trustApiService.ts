import { apiRequest } from "./apiClient";
import { adminApiRequest } from "./adminApiClient";

export type ComplaintStatus = "pending" | "warning_issued" | "dismissed";
export interface MarketplaceComplaint {
  id: string;
  reporterUserId: string;
  reporterName?: string | null;
  reportedUserId: string;
  reportedUserName?: string | null;
  reportedUserRole?: string | null;
  dealId?: string | null;
  category: string;
  details: string;
  status: ComplaintStatus;
  adminNote?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
}
export interface BlockedMarketplaceUser {
  userId: string;
  name?: string | null;
  role: string;
  warningCount: number;
  isBlocked: boolean;
  blockedAt?: string | null;
  blockReason?: string | null;
}

export function reportMarketplaceDeal(dealId: string, reportedUserId: string, category: string, details: string) {
  return apiRequest<MarketplaceComplaint>("/api/trust/complaints", {
    method: "POST",
    body: JSON.stringify({ dealId, reportedUserId, category, details: details.trim() }),
  });
}
export function getAdminComplaints(status: ComplaintStatus | "all") {
  return adminApiRequest<MarketplaceComplaint[]>(`/api/trust/admin/complaints?status=${encodeURIComponent(status)}`);
}
export function reviewAdminComplaint(id: string, action: "warning" | "dismiss", adminNote: string) {
  return adminApiRequest<MarketplaceComplaint>(`/api/trust/admin/complaints/${id}/${action}`, {
    method: "PATCH", body: JSON.stringify({ adminNote: adminNote.trim() }),
  });
}
export function getBlockedMarketplaceUsers() {
  return adminApiRequest<BlockedMarketplaceUser[]>("/api/trust/admin/blocked-users");
}
export function unblockMarketplaceUser(userId: string) {
  return adminApiRequest<void>(`/api/trust/admin/blocked-users/${userId}/unblock`, { method: "PATCH" });
}
