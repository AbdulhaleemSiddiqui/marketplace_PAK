import type {
    SavedBuyerRequirement,
    SellerInquiry,
  } from "../types/marketplace";
  
  import type { User } from "../types/auth";
  
  import {
    deductCredits,
  } from "./creditService";
  
  const INQUIRIES_KEY =
    "khoj_market_inquiries";
  
  export const DEFAULT_INQUIRY_COST =
    5;
  
  // =====================================================
  // GET ALL
  // =====================================================
  
  export function getAllInquiries():
    SellerInquiry[] {
    try {
      return JSON.parse(
        localStorage.getItem(
          INQUIRIES_KEY
        ) || "[]"
      );
    } catch {
      return [];
    }
  }
  
  function saveAllInquiries(
    inquiries: SellerInquiry[]
  ) {
    localStorage.setItem(
      INQUIRIES_KEY,
      JSON.stringify(inquiries)
    );
  }
  
  // =====================================================
  // CHECK EXISTING
  // =====================================================
  
  export function hasSellerAlreadyInquired(
    requirementId: string,
    sellerUserId: string
  ) {
    return getAllInquiries().some(
      (item) =>
        item.requirementId ===
          requirementId &&
        item.sellerUserId ===
          sellerUserId
    );
  }
  
  // =====================================================
  // SEND INQUIRY
  // =====================================================
  
  export function sendInquiry({
    requirement,
    seller,
    message,
    offeredPrice,
  }: {
    requirement:
      SavedBuyerRequirement;
  
    seller: User;
  
    message: string;
  
    offeredPrice?: string;
  }): SellerInquiry {
    if (
        seller.role !== "seller"
      ) {
        throw new Error(
          "Only seller accounts can send inquiries."
        );
      }
      
      if (
        seller.sellerVerificationStatus !==
        "verified"
      ) {
        throw new Error(
          "Seller verification required before sending an inquiry."
        );
      }
    if (
      requirement.status !==
      "verified"
    ) {
      throw new Error(
        "This requirement is not active."
      );
    }
  
    if (
      hasSellerAlreadyInquired(
        requirement.id,
        seller.id
      )
    ) {
      throw new Error(
        "You already sent an inquiry for this requirement."
      );
    }
  
    const inquiryId =
      crypto.randomUUID();
  
    // Credit deduction
    deductCredits(
      seller.id,
      DEFAULT_INQUIRY_COST,
      `Inquiry sent for ${requirement.title}`,
      inquiryId
    );
  
    const now =
      new Date().toISOString();
  
    const inquiry: SellerInquiry =
      {
        id: inquiryId,
  
        requirementId:
          requirement.id,
  
        buyerUserId:
          requirement.userId,
  
        sellerUserId:
          seller.id,
  
        sellerName:
          seller.name,
  
        sellerPhone:
          seller.phone,
  
        sellerEmail:
          seller.email,
  
        message:
          message.trim(),
  
        offeredPrice:
          offeredPrice?.trim() ||
          undefined,
  
        creditCost:
          DEFAULT_INQUIRY_COST,
  
        status: "sent",
  
        createdAt: now,
  
        updatedAt: now,
      };
  
    const inquiries =
      getAllInquiries();
  
    inquiries.unshift(
      inquiry
    );
  
    saveAllInquiries(
      inquiries
    );
  
    return inquiry;
  }
  
  // =====================================================
  // BUYER INQUIRIES
  // =====================================================
  
  export function getBuyerInquiries(
    buyerUserId: string
  ) {
    return getAllInquiries()
      .filter(
        (item) =>
          item.buyerUserId ===
          buyerUserId
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
  }
  
  // =====================================================
  // REQUIREMENT INQUIRIES
  // =====================================================
  
  export function getRequirementInquiries(
    requirementId: string
  ) {
    return getAllInquiries().filter(
      (item) =>
        item.requirementId ===
        requirementId
    );
  }
  
  // =====================================================
  // SELLER INQUIRIES
  // =====================================================
  
  export function getSellerInquiries(
    sellerUserId: string
  ) {
    return getAllInquiries()
      .filter(
        (item) =>
          item.sellerUserId ===
          sellerUserId
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
  }
  
  // =====================================================
  // UPDATE STATUS
  // =====================================================
  
  export function updateInquiryStatus(
    inquiryId: string,
    status:
      | "viewed"
      | "accepted"
      | "rejected"
      | "completed"
  ) {
    const inquiries =
      getAllInquiries();
  
    const updated =
      inquiries.map((item) =>
        item.id === inquiryId
          ? {
              ...item,
  
              status,
  
              updatedAt:
                new Date().toISOString(),
            }
          : item
      );
  
    saveAllInquiries(
      updated
    );
  }