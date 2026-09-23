import {
    apiRequest,
  } from "./apiClient";
  
  import type {
    RequirementField,
    StructuredRequirement,
  } from "../types/marketplace";
  
  export interface RequirementResponse {
    id: string;
    referenceNo: string;
    userId: string;
    title: string;
    category?: string | null;
    subCategory?: string | null;
    requirementType: "product" | "service";
    status: string;
    activityStatus: "active" | "inactive";
    budgetMin?: number | null;
    budgetMax?: number | null;
    country?: string | null;
    city?: string | null;
    area?: string | null;
    postalCode?: string | null;
    phoneVerified?: boolean;
    createdAt: string;
    updatedAt?: string | null;
  }
  
  interface CreateRequirementFieldRequest {
    fieldKey: string;
    label: string;
    value: string;
    isRequired: boolean;
    sortOrder: number;
  }
  
  interface CreateRequirementRequest {
    title: string;
    category?: string | null;
    subCategory?: string | null;
    requirementType: "product" | "service";
    budgetMin?: number | null;
    budgetMax?: number | null;
    country?: string | null;
    city?: string | null;
    area?: string | null;
    postalCode?: string | null;
    fields: CreateRequirementFieldRequest[];
  }
  
  function normalize(
    value: string,
  ) {
    return value
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]/g,
        "",
      );
  }
  
  function findField(
    fields: RequirementField[],
    aliases: string[],
  ) {
    const normalizedAliases =
      aliases.map(
        normalize,
      );
  
    return fields.find(
      (field) =>
        normalizedAliases.includes(
          normalize(field.id),
        ) ||
        normalizedAliases.includes(
          normalize(field.label),
        ),
    );
  }
  
  function readField(
    fields: RequirementField[],
    aliases: string[],
  ) {
    return (
      findField(
        fields,
        aliases,
      )?.value.trim() ??
      ""
    );
  }
  
  function parseSingleMoneyPart(
    value: string,
  ): number | null {
    const normalized =
      value
        .toLowerCase()
        .replace(/,/g, "")
        .replace(/pkr/g, "")
        .trim();
  
    const match =
      normalized.match(
        /(\d+(?:\.\d+)?)\s*(crore|cr|lac|lakh|k)?/,
      );
  
    if (!match) {
      return null;
    }
  
    const amount =
      Number(
        match[1],
      );
  
    if (!Number.isFinite(amount)) {
      return null;
    }
  
    const unit =
      match[2] ?? "";
  
    if (
      unit === "crore" ||
      unit === "cr"
    ) {
      return Math.round(
        amount *
          10_000_000,
      );
    }
  
    if (
      unit === "lac" ||
      unit === "lakh"
    ) {
      return Math.round(
        amount *
          100_000,
      );
    }
  
    if (unit === "k") {
      return Math.round(
        amount *
          1_000,
      );
    }
  
    return Math.round(
      amount,
    );
  }
  
  function parseBudgetRange(
    value: string,
  ): {
    budgetMin: number | null;
    budgetMax: number | null;
  } {
    if (!value.trim()) {
      return {
        budgetMin: null,
        budgetMax: null,
      };
    }
  
    const parts =
      value
        .split(
          /\s+-\s+/,
        )
        .map(
          (item) =>
            item.trim(),
        )
        .filter(Boolean);
  
    if (
      parts.length >=
      2
    ) {
      const first =
        parseSingleMoneyPart(
          parts[0],
        );
  
      const second =
        parseSingleMoneyPart(
          parts[1],
        );
  
      if (
        first != null &&
        second != null
      ) {
        return {
          budgetMin:
            Math.min(
              first,
              second,
            ),
  
          budgetMax:
            Math.max(
              first,
              second,
            ),
        };
      }
    }
  
    const one =
      parseSingleMoneyPart(
        value,
      );
  
    return {
      budgetMin:
        one,
  
      budgetMax:
        one,
    };
  }
  
  function toCreateRequest(
    requirement:
      StructuredRequirement,
  ): CreateRequirementRequest {
    const fields =
      requirement.fields.filter(
        (field) =>
          !normalize(
            field.id,
          ).startsWith(
            "image",
          ),
      );
  
    const budgetValue =
      readField(
        fields,
        [
          "budget",
          "budget range",
          "budget / range",
          "price",
          "expected budget",
        ],
      );
  
    const {
      budgetMin,
      budgetMax,
    } =
      parseBudgetRange(
        budgetValue,
      );
  
    const country =
      readField(
        fields,
        ["country"],
      );
  
    const city =
      readField(
        fields,
        ["city"],
      );
  
    const area =
      readField(
        fields,
        [
          "area",
          "locality",
          "area / locality",
          "location",
          "delivery location",
        ],
      );
  
    const postalCode =
      readField(
        fields,
        [
          "postal code",
          "postalcode",
          "zip",
          "zipcode",
        ],
      );
  
    const locationFieldIds =
      new Set(
        [
          "country",
          "city",
          "area",
          "locality",
          "location",
          "deliverylocation",
          "postalcode",
          "zip",
          "zipcode",
        ],
      );
  
    const budgetFieldIds =
      new Set(
        [
          "budget",
          "budgetrange",
          "price",
          "expectedbudget",
        ],
      );
  
    const dynamicFields =
      fields
        .filter(
          (field) => {
            const id =
              normalize(
                field.id,
              );
  
            return (
              !locationFieldIds.has(
                id,
              ) &&
              !budgetFieldIds.has(
                id,
              )
            );
          },
        )
        .map(
          (
            field,
            index,
          ): CreateRequirementFieldRequest => ({
            fieldKey:
              field.id,
  
            label:
              field.label,
  
            value:
              field.value,
  
            isRequired:
              field.required,
  
            sortOrder:
              index + 1,
          }),
        );
  
    return {
      title:
        requirement.title.trim(),
  
      category:
        requirement.category?.trim() ||
        null,
  
      subCategory:
        requirement.subCategory?.trim() ||
        null,
  
        requirementType:
        requirement.requirementType ===
        "service"
          ? "service"
          : "product",
  
      budgetMin,
      budgetMax,
  
      country:
        country || null,
  
      city:
        city || null,
  
      area:
        area || null,
  
      postalCode:
        postalCode || null,
  
      fields:
        dynamicFields,
    };
  }
  
  export async function createRequirement(
    requirement:
      StructuredRequirement,
  ) {
    const request =
      toCreateRequest(
        requirement,
      );
  
    return apiRequest<RequirementResponse>(
      "/api/requirements",
      {
        method:
          "POST",
  
        body:
          JSON.stringify(
            request,
          ),
      },
    );
  }
  