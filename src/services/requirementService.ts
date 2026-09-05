import type { User } from "../types/auth";

import type {
  RequirementStatus,
  SavedBuyerRequirement,
  StructuredRequirement,
} from "../types/marketplace";

const PENDING_KEY =
  "pending_buyer_requirement";

const REQUIREMENTS_KEY =
  "buyer_requirements";

// =====================================================
// PENDING REQUIREMENT
// =====================================================

export function savePendingRequirement(
  requirement: StructuredRequirement
) {
  localStorage.setItem(
    PENDING_KEY,
    JSON.stringify(requirement)
  );
}

export function getPendingRequirement():
  | StructuredRequirement
  | null {
  try {
    const value =
      localStorage.getItem(
        PENDING_KEY
      );

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function clearPendingRequirement() {
  localStorage.removeItem(
    PENDING_KEY
  );
}

// =====================================================
// GET ALL REQUIREMENTS
// =====================================================

export function getAllBuyerRequirements():
  SavedBuyerRequirement[] {
  try {
    const value =
      localStorage.getItem(
        REQUIREMENTS_KEY
      );

    if (!value) {
      return [];
    }

    return JSON.parse(value);
  } catch {
    return [];
  }
}

// =====================================================
// GET CURRENT USER REQUIREMENTS
// =====================================================

export function getBuyerRequirementsByUser(
  userId: string
): SavedBuyerRequirement[] {
  return getAllBuyerRequirements()
    .filter(
      (item) =>
        item.userId === userId
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
// GET PUBLIC VERIFIED REQUIREMENTS
// =====================================================

export function getVerifiedBuyerRequirements():
  SavedBuyerRequirement[] {
  return getAllBuyerRequirements()
    .filter(
      (item) =>
        item.status ===
          "verified" &&
        item.aiVerified === true
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
// SAVE NEW REQUIREMENT
// =====================================================

export function saveBuyerRequirement(
  requirement: StructuredRequirement,
  user: User,
  status: RequirementStatus =
    "ai_verification_pending"
): SavedBuyerRequirement {
  const requirements =
    getAllBuyerRequirements();

  const now =
    new Date().toISOString();

  const newRequirement: SavedBuyerRequirement =
    {
      id: crypto.randomUUID(),

      userId: user.id,

      ...requirement,

      status,

      phoneVerified:
        user.phoneVerified,

      aiVerified:
        status === "verified",

      createdAt: now,

      updatedAt: now,
    };

  requirements.unshift(
    newRequirement
  );

  localStorage.setItem(
    REQUIREMENTS_KEY,
    JSON.stringify(requirements)
  );

  return newRequirement;
}

// =====================================================
// UPDATE STATUS
// =====================================================

export function updateRequirementStatus(
  requirementId: string,
  status: RequirementStatus
): SavedBuyerRequirement | null {
  const requirements =
    getAllBuyerRequirements();

  let updatedRequirement:
    | SavedBuyerRequirement
    | null = null;

  const updatedRequirements =
    requirements.map((item) => {
      if (
        item.id !==
        requirementId
      ) {
        return item;
      }

      updatedRequirement = {
        ...item,

        status,

        aiVerified:
          status === "verified",

        updatedAt:
          new Date().toISOString(),
      };

      return updatedRequirement;
    });

  localStorage.setItem(
    REQUIREMENTS_KEY,
    JSON.stringify(
      updatedRequirements
    )
  );

  return updatedRequirement;
}

// =====================================================
// MARK AI VERIFIED
// =====================================================

export function markRequirementVerified(
  requirementId: string
) {
  return updateRequirementStatus(
    requirementId,
    "verified"
  );
}

// =====================================================
// MARK COMPLETED
// =====================================================

export function markRequirementCompleted(
  requirementId: string
) {
  return updateRequirementStatus(
    requirementId,
    "completed"
  );
}