import { apiRequest } from "./apiClient";
import type { StructuredRequirement } from "../types/marketplace";

export async function generateAiRequirement(
  text: string,
) {
  return apiRequest<StructuredRequirement>(
    "/api/ai/requirements/generate",
    {
      method: "POST",
      body: JSON.stringify({
        text: text.trim(),
      }),
    },
  );
}
