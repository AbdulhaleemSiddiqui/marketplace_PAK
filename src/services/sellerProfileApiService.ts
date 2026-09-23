import { apiRequest } from "./apiClient";
import type { SellerInquiry } from "../types/marketplace";

export interface SellerWallet {
  sellerUserId?: string;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SellerWalletTransaction {
  id: string;
  sellerUserId?: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description?: string | null;
  createdAt: string;
}

export function getSellerWallet() {
  return apiRequest<SellerWallet>("/api/seller/wallet");
}

export function getSellerWalletTransactions() {
  return apiRequest<SellerWalletTransaction[]>("/api/seller/wallet/transactions");
}

export function getSellerInquiriesApi() {
    return apiRequest<SellerInquiry[]>(
      "/api/inquiries/seller/mine",
    );
  }
