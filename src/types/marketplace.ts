export type UserRole =
  | "buyer"
  | "seller";

export type InputMode =
  | "text"
  | "voice";

export interface Attachment {
  id: string;
  file: File;
  previewUrl?: string;
}

export interface AIRequest {
  role: UserRole;
  text: string;
  attachments: Attachment[];
  inputMode: InputMode;
}

export interface RequirementField {
  id: string;
  label: string;
  value: string;
  required: boolean;
}

export interface StructuredRequirement {
  category: string;
  subCategory?: string;
  title: string;
  fields: RequirementField[];
}

export type RequirementStatus =
  | "draft"
  | "phone_verification_pending"
  | "phone_verified"
  | "ai_verification_pending"
  | "verified"
  | "admin_review_required"
  | "rejected"
  | "completed";

export interface SavedBuyerRequirement
  extends StructuredRequirement {
  id: string;

  userId: string;

  status: RequirementStatus;

  phoneVerified: boolean;

  aiVerified: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface BuyerRequirement {
  id: string;
  title: string;
  description: string;
  location: string;
  budget?: string;
  category?: string;
  verified: boolean;
}

export type SellerListingStatus =
  | "pending"
  | "active"
  | "sold";

export interface SellerListing {
  id: string;

  userId?: string;

  title: string;

  description: string;

  location: string;

  price?: string;

  category?: string;

  verified: boolean;

  status?: SellerListingStatus;
}

// =====================================================
// INQUIRY
// =====================================================

export type InquiryStatus =
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "completed";

export interface SellerInquiry {
  id: string;

  requirementId: string;

  buyerUserId: string;

  sellerUserId: string;

  sellerName: string;

  sellerPhone: string;

  sellerEmail: string;

  message: string;

  offeredPrice?: string;

  creditCost: number;

  status: InquiryStatus;

  createdAt: string;

  updatedAt: string;
}

// =====================================================
// CREDIT
// =====================================================

export type CreditTransactionType =
  | "initial_balance"
  | "inquiry_deduction"
  | "admin_credit"
  | "refund";

export interface CreditTransaction {
  id: string;

  userId: string;

  type: CreditTransactionType;

  amount: number;

  balanceAfter: number;

  description: string;

  referenceId?: string;

  createdAt: string;
}