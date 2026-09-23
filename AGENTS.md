# Khoj Market Frontend — AGENTS.md

## Project
React + TypeScript + TSX + Vite + Tailwind CSS + React Router.

The ASP.NET Core backend is a **separate repository**. Do not assume backend files exist here.

## Before Editing
1. Read `PROJECT_CONTEXT.md`.
2. Inspect current files before changing them.
3. Search for existing components/services/types first.
4. Preserve working behavior.
5. Make the smallest safe change.

## Architecture Rules
- Keep strict TypeScript.
- Avoid `any`.
- API access belongs in services/hooks, not scattered inside UI.
- Do not put security/financial/business enforcement only in React.
- Use `VITE_API_BASE_URL`; never hardcode API hosts.
- Backend is source of truth for migrated entities.
- localStorage is temporary/mock/compatibility state only.
- Do not add Redux/Zustand unless explicitly needed and approved.

## Locked Business/UI Rules
- Roles: buyer / seller; admin UI is separate role-aware area.
- Add Requirement is Buyer action.
- Send Inquiry is Seller action.
- Buyer must not send inquiry.
- Seller inquiry requires verified seller + phone verification; backend enforces this.
- Requirement verification and activity status are separate.
- New requirement backend status: `admin_review_required`; activity: `active`.
- Public requirement: verified + active + not deleted.
- Badge wording: `Verified Requirement`, not Verified User.
- No customer `Start Verification` button.
- Friendly `KM-REQ-...` references in UI; do not show raw GUID as main ID.
- Requirement image limit is **20**, not 5.
- First image is cover.
- Product/Service should be visible/editable in Add Requirement.
- Budget should support manual Min/Max values as well as range UI.

## Authentication
Normal marketplace interactions use AuthModal:
- Header Sign In -> AuthModal
- logged-out Add Requirement -> Buyer AuthModal
- logged-out Send Inquiry -> Seller AuthModal

After auth, resume the exact pending action.

Fallback Login/Register routes may remain.

JWT key in frontend storage:
`khoj_market_access_token`

## Current API Services
Known services include:
- `apiClient.ts`
- `authService.ts`
- `otpService.ts`
- `requirementApiService.ts`
- `requirementCreateApiService.ts`
- `inquiryApiService.ts`

Reuse them instead of creating duplicates.

## Find.tsx Warning
`Find.tsx` is very large.

Never replace it from a stale/older generated copy.

Prefer:
- surgical edits
- extracting focused components
- preserving exact latest source

Suggested decomposition:
- FindHeader
- FindSearchBar
- RequirementFilters
- RequirementCard
- RequirementDetailModal
- RequirementPagination
- AddRequirementButton
- AiRequirementComposer
- MobileFilters

## Current Integration Priorities
1. 20-image consistency
2. real requirement image upload
3. Product/Service selector
4. manual Min/Max budget input
5. Admin Pending API UI
6. Buyer Mine/Profile API
7. real Wallet UI
8. shared filters/server filters
9. favorites
10. deals/reviews
11. regression

## Build
Before completing:
```bash
npm run build
```

Fix all errors/warnings introduced by the change.

Never claim runtime testing if only build was run.
