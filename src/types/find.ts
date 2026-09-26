import type {
  BuyerRequirement,
  RequirementActivityStatus,
} from "./marketplace";

export interface RequirementSummaryField {
  fieldKey: string;
  label: string;
  value: string;
}

export interface PublicRequirement
  extends BuyerRequirement {
  source: "real" | "demo";
  activityStatus: RequirementActivityStatus;
  queryCount: number;
  imageUrl?: string;
  budgetMin?: number | null;
  budgetMax?: number | null;
  summaryFields?: RequirementSummaryField[];
}
