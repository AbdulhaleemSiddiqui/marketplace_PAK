import type { UserRole } from "./marketplace";

export type SellerVerificationStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "rejected";

export interface User {
  id: string;

  name: string;

  email: string;

  phone: string;

  role: UserRole;

  phoneVerified: boolean;

  sellerVerificationStatus?: SellerVerificationStatus;

  businessName?: string;

  businessCity?: string;

  businessCategory?: string;

  createdAt: string;
}

export interface StoredUser extends User {
  password: string;
}

export interface LoginRequest {
  email: string;

  password: string;

  role: UserRole;
}

export interface RegisterRequest {
  name: string;

  email: string;

  phone: string;

  password: string;

  role: UserRole;
}