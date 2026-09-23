import type { User } from "../types/auth";

import type {
  RequirementActivityStatus,
  RequirementStatus,
  SavedBuyerRequirement,
  StructuredRequirement,
} from "../types/marketplace";

const PENDING_KEY =
  "pending_buyer_requirement";

const REQUIREMENTS_KEY =
  "buyer_requirements";

// ======================================================
// PENDING
// ======================================================

export function savePendingRequirement(
  requirement: StructuredRequirement,
) {
  localStorage.setItem(
    PENDING_KEY,
    JSON.stringify(requirement),
  );
}

export function getPendingRequirement():
  StructuredRequirement | null {
  try {
    const value =
      localStorage.getItem(
        PENDING_KEY,
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
    PENDING_KEY,
  );
}

// ======================================================
// GET ALL
// ======================================================

export function getAllBuyerRequirements():
  SavedBuyerRequirement[] {
  try {
    const value =
      localStorage.getItem(
        REQUIREMENTS_KEY,
      );

    if (!value) {
      return [];
    }

    const parsed =
      JSON.parse(value) as SavedBuyerRequirement[];

    /*
      Backward compatibility:
      old posts may not have activityStatus.
      Treat them as active.
    */

    return parsed.map(
      (item) => ({
        ...item,

        activityStatus:
          item.activityStatus ??
          "active",
      }),
    );
  } catch {
    return [];
  }
}

// ======================================================
// SAVE ALL
// ======================================================

function saveAllBuyerRequirements(
  requirements: SavedBuyerRequirement[],
) {
  localStorage.setItem(
    REQUIREMENTS_KEY,
    JSON.stringify(requirements),
  );
}

// ======================================================
// USER REQUIREMENTS
// ======================================================

export function getBuyerRequirementsByUser(
  userId: string,
): SavedBuyerRequirement[] {
  return getAllBuyerRequirements()
    .filter(
      (item) =>
        item.userId === userId,
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
// PUBLIC VERIFIED REQUIREMENTS
// ======================================================

export function getVerifiedBuyerRequirements():
  SavedBuyerRequirement[] {
  return getAllBuyerRequirements()
    .filter(
      (item) =>
        item.status ===
          "verified" &&
        item.aiVerified ===
          true,
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
// GET ONE
// ======================================================

export function getBuyerRequirementById(
  requirementId: string,
): SavedBuyerRequirement | null {
  return (
    getAllBuyerRequirements().find(
      (item) =>
        item.id ===
        requirementId,
    ) ?? null
  );
}

// ======================================================
// CREATE
// ======================================================

export function saveBuyerRequirement(
  requirement: StructuredRequirement,
  user: User,
  status: RequirementStatus =
    "ai_verification_pending",
): SavedBuyerRequirement {
  const requirements =
    getAllBuyerRequirements();

  const now =
    new Date().toISOString();

  const newRequirement:
    SavedBuyerRequirement = {
    id:
      crypto.randomUUID(),

    userId:
      user.id,

    ...requirement,

    status,

    activityStatus:
      "active",

    phoneVerified:
      user.phoneVerified,

    aiVerified:
      status ===
      "verified",

    createdAt:
      now,

    updatedAt:
      now,
  };

  requirements.unshift(
    newRequirement,
  );

  saveAllBuyerRequirements(
    requirements,
  );

  return newRequirement;
}

// ======================================================
// EDIT REQUIREMENT CONTENT
// ======================================================

export function updateBuyerRequirementContent(
  requirementId: string,
  userId: string,
  details: string,
  images: string[],
): SavedBuyerRequirement | null {
  const cleanDetails = details.trim();

  const cleanImages =
    images
      .map((image) => image.trim())
      .filter(Boolean)
      .slice(0, 5);

  if (!cleanDetails) {
    throw new Error(
      "Requirement details are required.",
    );
  }

  if (cleanImages.length === 0) {
    throw new Error(
      "At least one image is required.",
    );
  }

  const requirements =
    getAllBuyerRequirements();

  const target =
    requirements.find(
      (item) =>
        item.id === requirementId,
    );

  if (!target) {
    return null;
  }

  if (target.userId !== userId) {
    throw new Error(
      "You can only edit your own requirement.",
    );
  }

  let updatedRequirement:
    SavedBuyerRequirement | null =
    null;

  const updatedRequirements =
    requirements.map(
      (item) => {
        if (item.id !== requirementId) {
          return item;
        }

        const preservedFields =
          item.fields.filter(
            (field) => {
              const id =
                field.id
                  .trim()
                  .toLowerCase();

              return (
                !id.startsWith("image") &&
                id !== "details" &&
                id !== "detail" &&
                id !== "description"
              );
            },
          );

        const nextStatus:
          RequirementStatus =
          item.status === "verified"
            ? "admin_review_required"
            : item.status;

        updatedRequirement = {
          ...item,

          fields: [
            ...preservedFields,
            {
              id: "details",
              label: "Details",
              value: cleanDetails,
              required: true,
            },
            ...cleanImages.map(
              (image, index) => ({
                id: `image${index + 1}`,
                label: `Image ${index + 1}`,
                value: image,
                required: true,
              }),
            ),
          ],

          status: nextStatus,

          aiVerified:
            false,

          updatedAt:
            new Date().toISOString(),
        };

        return updatedRequirement;
      },
    );

  saveAllBuyerRequirements(
    updatedRequirements,
  );

  return updatedRequirement;
}

// ======================================================
// VERIFICATION STATUS
// ======================================================

export function updateRequirementStatus(
  requirementId: string,
  status: RequirementStatus,
): SavedBuyerRequirement | null {
  const requirements =
    getAllBuyerRequirements();

  let updatedRequirement:
    SavedBuyerRequirement | null =
    null;

  const updatedRequirements =
    requirements.map(
      (item) => {
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
            status ===
            "verified",

          updatedAt:
            new Date().toISOString(),
        };

        return updatedRequirement;
      },
    );

  saveAllBuyerRequirements(
    updatedRequirements,
  );

  return updatedRequirement;
}

// ======================================================
// ACTIVITY STATUS
// ======================================================

export function updateRequirementActivityStatus(
  requirementId: string,
  userId: string,
  activityStatus: RequirementActivityStatus,
): SavedBuyerRequirement | null {
  const requirements =
    getAllBuyerRequirements();

  const target =
    requirements.find(
      (item) =>
        item.id ===
        requirementId,
    );

  if (!target) {
    return null;
  }

  /*
    Only owner buyer can change
    active/inactive state.
  */

  if (
    target.userId !==
    userId
  ) {
    throw new Error(
      "You can only update your own requirement.",
    );
  }

  let updatedRequirement:
    SavedBuyerRequirement | null =
    null;

  const updatedRequirements =
    requirements.map(
      (item) => {
        if (
          item.id !==
          requirementId
        ) {
          return item;
        }

        updatedRequirement = {
          ...item,

          activityStatus,

          updatedAt:
            new Date().toISOString(),
        };

        return updatedRequirement;
      },
    );

  saveAllBuyerRequirements(
    updatedRequirements,
  );

  return updatedRequirement;
}

// ======================================================
// HELPERS
// ======================================================

export function markRequirementVerified(
  requirementId: string,
) {
  return updateRequirementStatus(
    requirementId,
    "verified",
  );
}

export function markRequirementCompleted(
  requirementId: string,
) {
  return updateRequirementStatus(
    requirementId,
    "completed",
  );
}

export function markRequirementActive(
  requirementId: string,
  userId: string,
) {
  return updateRequirementActivityStatus(
    requirementId,
    userId,
    "active",
  );
}

export function markRequirementInactive(
  requirementId: string,
  userId: string,
) {
  return updateRequirementActivityStatus(
    requirementId,
    userId,
    "inactive",
  );
}