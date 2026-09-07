import type { User } from "../types/auth";

import type {
  SellerInquiry,
} from "../types/marketplace";

import {
  deductCredits,
} from "./creditService";

import {
  getBuyerRequirementById,
} from "./requirementService";

const INQUIRIES_KEY =
  "khoj_market_inquiries";

export const DEFAULT_INQUIRY_COST =
  5;

// ======================================================
// STORAGE
// ======================================================

export function getAllInquiries():
  SellerInquiry[] {
  try {
    const value =
      localStorage.getItem(
        INQUIRIES_KEY,
      );

    if (!value) {
      return [];
    }

    return JSON.parse(value);
  } catch {
    return [];
  }
}

function saveAllInquiries(
  inquiries: SellerInquiry[],
) {
  localStorage.setItem(
    INQUIRIES_KEY,
    JSON.stringify(inquiries),
  );
}

// ======================================================
// QUERY COUNT
// ======================================================

export function getInquiryCountByRequirement(
  requirementId: string,
): number {
  return getAllInquiries().filter(
    (item) =>
      item.requirementId ===
      requirementId,
  ).length;
}

// ======================================================
// GET BY REQUIREMENT
// ======================================================

export function getInquiriesByRequirement(
  requirementId: string,
): SellerInquiry[] {
  return getAllInquiries()
    .filter(
      (item) =>
        item.requirementId ===
        requirementId,
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt,
        ).getTime() -
        new Date(
          a.createdAt,
        ).getTime(),
    );
}

// ======================================================
// GET BUYER INQUIRIES
// ======================================================

export function getBuyerInquiries(
  buyerUserId: string,
): SellerInquiry[] {
  return getAllInquiries()
    .filter(
      (item) =>
        item.buyerUserId ===
        buyerUserId,
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt,
        ).getTime() -
        new Date(
          a.createdAt,
        ).getTime(),
    );
}

// ======================================================
// GET SELLER INQUIRIES
// ======================================================

export function getSellerInquiries(
  sellerUserId: string,
): SellerInquiry[] {
  return getAllInquiries()
    .filter(
      (item) =>
        item.sellerUserId ===
        sellerUserId,
    )
    .sort(
      (a, b) =>
        new Date(
          b.createdAt,
        ).getTime() -
        new Date(
          a.createdAt,
        ).getTime(),
    );
}

// ======================================================
// SEND INQUIRY
// ======================================================

export function sendInquiry({
  requirementId,
  buyerUserId,
  seller,
  message,
  offeredPrice,
  creditCost = DEFAULT_INQUIRY_COST,
}: {
  requirementId: string;
  buyerUserId: string;
  seller: User;
  message: string;
  offeredPrice?: string;
  creditCost?: number;
}): SellerInquiry {
  if (
    seller.role !==
    "seller"
  ) {
    throw new Error(
      "Only sellers can send inquiries.",
    );
  }

  if (
    seller.sellerVerificationStatus !==
    "verified"
  ) {
    throw new Error(
      "Seller verification is required before sending an inquiry.",
    );
  }

  /*
    Real localStorage requirement check.

    Demo requirements won't exist in localStorage,
    so they are allowed through the UI-supplied state.
  */

  const storedRequirement =
    getBuyerRequirementById(
      requirementId,
    );

  if (
    storedRequirement
  ) {
    if (
      storedRequirement.status !==
        "verified" ||
      storedRequirement.aiVerified !==
        true
    ) {
      throw new Error(
        "This requirement is not verified.",
      );
    }

    if (
      storedRequirement.activityStatus ===
      "inactive"
    ) {
      throw new Error(
        "This requirement is no longer accepting inquiries.",
      );
    }
  }

  const cleanMessage =
    message.trim();

  if (
    !cleanMessage
  ) {
    throw new Error(
      "Inquiry message is required.",
    );
  }

  const inquiries =
    getAllInquiries();

  const duplicate =
    inquiries.some(
      (item) =>
        item.requirementId ===
          requirementId &&
        item.sellerUserId ===
          seller.id,
    );

  if (
    duplicate
  ) {
    throw new Error(
      "You already submitted an inquiry for this requirement.",
    );
  }

  /*
    Existing credit service should throw
    if balance is insufficient.
  */

  deductCredits(
    seller.id,
    creditCost,
    `Inquiry submitted for requirement ${requirementId}`,
    requirementId,
  );

  const now =
    new Date().toISOString();

  const inquiry:
    SellerInquiry = {
    id:
      crypto.randomUUID(),

    requirementId,

    buyerUserId,

    sellerUserId:
      seller.id,

    sellerName:
      seller.name,

    sellerPhone:
      seller.phone,

    sellerEmail:
      seller.email,

    message:
      cleanMessage,

    offeredPrice:
      offeredPrice?.trim() ||
      undefined,

    creditCost,

    status:
      "sent",

    createdAt:
      now,

    updatedAt:
      now,
  };

  inquiries.unshift(
    inquiry,
  );

  saveAllInquiries(
    inquiries,
  );

  return inquiry;
}

// ======================================================
// STATUS UPDATE
// ======================================================

export function updateInquiryStatus(
  inquiryId: string,
  status: SellerInquiry["status"],
): SellerInquiry | null {
  const inquiries =
    getAllInquiries();

  let updated:
    SellerInquiry | null =
    null;

  const result =
    inquiries.map(
      (item) => {
        if (
          item.id !==
          inquiryId
        ) {
          return item;
        }

        updated = {
          ...item,
          status,
          updatedAt:
            new Date().toISOString(),
        };

        return updated;
      },
    );

  saveAllInquiries(
    result,
  );

  return updated;
}