# Khoj Market — Complete Project Context

**Last Updated:** 2026-09-13  
**Source:** Reconstructed from the full ChatGPT project conversation history.

> This document is the primary handoff/context file for Codex or another AI developer working on Khoj Market. It preserves current decisions, implementation status, older superseded decisions, known bugs, completed work, backend contracts, frontend integration state, and future plans.  
> Status markers used throughout:
>
> - ✅ Implemented
> - 🟡 Partially Implemented
> - 🔴 Pending
> - 🔵 Planned
> - ⚪ Needs Verification

---

# 1. Project Overview

Khoj Market is a **Pakistan-focused local buyer/seller sourcing marketplace** for products and services. It is **not primarily an import/export marketplace**.

The core interaction is requirement-driven rather than only listing-driven:

1. A buyer tells Khoj Market what they need.
2. The requirement is converted into structured fields.
3. The buyer confirms or edits the requirement.
4. The requirement is submitted and reviewed.
5. Once verified and active, it becomes discoverable to sellers.
6. Relevant verified sellers can send an inquiry/quotation.
7. The buyer compares sellers/offers and continues the transaction.

The platform is meant to reduce the friction of manually searching dozens of local shops, groups, websites, or classified listings.

Example discussed repeatedly:

- Buyer wants a **Rado watch** in **Karachi / Gulzar-e-Hijri**.
- Buyer can type or speak something like:
  - “Mujhe Rado ki original watch chahiye Karachi Gulzar-e-Hijri mein, condition achi ho aur budget 100k tak.”
- The future AI should extract:
  - category
  - brand
  - missing model/reference
  - authenticity
  - condition
  - budget
  - city
  - area
- Missing required values should be asked as follow-up questions.

Other example categories discussed:
- laptops
- cars
- phones
- watches
- cement
- construction materials
- electrician
- plumber
- AC repair
- web development
- other local services

Current product name in use: **Khoj Market / KhojMarket**.

---

# 2. Product Vision

## Problem being solved

Local buyers in Pakistan often need to:
- search many stores or listings,
- ask friends or WhatsApp groups,
- compare prices manually,
- verify whether sellers are reliable,
- repeat the same requirement to multiple suppliers.

Khoj Market aims to reverse the usual marketplace model:
- instead of forcing buyers to search only through seller listings,
- buyers publish structured demand,
- sellers find relevant demand and compete/respond.

## Target users

### Buyer
A person or business looking for a local product or service.

### Seller / Supplier
A shop, dealer, service provider, contractor, supplier, reseller, or local business that wants to find qualified buyer demand.

### Admin / Platform Team
Responsible for marketplace quality, verification, credits, moderation, and operational controls.

## Buyer value

- Describe need naturally.
- Avoid searching dozens of irrelevant listings.
- Receive relevant seller responses.
- Compare quotations/offers.
- Use verification indicators.
- Keep buyer contact data protected until appropriate.

## Seller value

- See active verified buyer demand.
- Avoid spending effort on random leads.
- Pay credits only when sending a qualified inquiry.
- Build transaction-based ratings over time.

## Why this is not just an OLX clone

OLX is primarily listing-centric. Khoj Market’s long-term differentiator is:

- requirement-centric marketplace
- AI-assisted structured requirements
- category-aware dynamic fields
- buyer demand discovery for suppliers
- verification before public discovery
- paid seller inquiry model
- transaction-based ratings
- future voice + image input
- future AI matching and missing-field collection

## Long-term AI direction

The long-term product promise discussed in the working specification was:

> “Jo chahiye, bas batao.”

AI should eventually:
- understand buyer intent,
- extract structured fields,
- identify category,
- identify missing required fields,
- ask follow-up questions,
- pre-fill requirement forms,
- help sellers create listings,
- support English, Urdu and Roman Urdu,
- assist matching without becoming the sole source of business rules.

---

# 3. Overall Technical Architecture

## Critical repository rule

**Frontend and backend are TWO SEPARATE projects/repos.**

Codex must never assume they live in the same repository.

## Frontend

Current agreed stack:

- ✅ React
- ✅ TypeScript
- ✅ TSX
- ✅ Vite
- ✅ Tailwind CSS
- ✅ React Router / `react-router-dom`
- ✅ Role-aware Buyer/Seller UI
- ✅ Responsive web UI requirement
- 🟡 Some older areas still use localStorage/mock data
- 🟡 API migration is actively replacing local/mock behavior

Known frontend project path from development:
`C:\Users\HP\Desktop\New folder\marketplace_PAK\`

Repository mentioned:
`AbdulhaleemSiddiqui/marketplace_PAK`

Frontend architecture rule:
- UI components should not contain backend-sensitive business logic.
- Business/API access should go through services.
- Large files such as `Find.tsx` should gradually be componentized.
- Do not rewrite a working 5,000+ line file from a stale copy.

## Backend

Current backend is a separate ASP.NET Core project.

Stack:

- ✅ ASP.NET Core 10 Web API
- ✅ .NET 10
- ✅ Entity Framework Core 10.x
- ✅ SQL Server
- ✅ JWT Bearer authentication
- ✅ role authorization
- ✅ controllers + DTOs + services
- ✅ validation/business rules
- ✅ file/image handling
- ✅ global exception middleware
- ✅ CORS
- ✅ User Secrets for local secrets
- ✅ health endpoint

Backend solution path:
`C:\Users\HP\source\repos\KhojMarket.Api\KhojMarket.Api.sln`

Project path used for CLI:
`C:\Users\HP\source\repos\KhojMarket.Api\KhojMarket.Api`

Local SQL Server:
`DESKTOP-POQI31N\SQLEXPRESS`

Database:
`KhojMarketDb`

## Architecture style

Current decision:
- use a **modular monolith**
- do **not** introduce premature microservices

Odoo decision:
- do **not** use Odoo as the core marketplace backend/database
- custom ASP.NET Core + SQL Server remains the core
- Odoo may later be integrated for:
  - accounting
  - CRM
  - invoicing
  - internal/back-office functions

## Frontend/backend communication

Expected layering:

```text
React UI
   ↓
Frontend service/API layer
   ↓
ASP.NET Core API
   ↓
Business/service layer
   ↓
EF Core
   ↓
SQL Server / file storage
```

Rules:
- do not hardcode API URLs
- use `VITE_API_BASE_URL`
- API secrets must never be placed in React
- frontend must handle loading/error/success states
- backend is authoritative for security and financial rules

---

# 4. Development Roadmap

The following roadmap was explicitly defined.

## Phase 1 – UI & Complete Application Flow

At one point this phase was estimated at approximately **50% complete**.

Includes:
- Buyer UI
- Seller UI
- Admin UI
- Requirement posting
- Filters
- Verification flow
- Inquiry flow
- Profiles
- Responsive design
- Complete user journeys

Current reality: UI has progressed significantly beyond the original 50%, but some flows remain mixed between mock/local data and real APIs.

## Phase 2 – Backend & Database

Originally planned, now largely implemented.

Includes:
- ASP.NET Core APIs
- SQL Server
- EF Core
- Authentication
- Authorization
- Roles
- Validations
- File/image handling
- Business logic

Status: ✅ Core V1 backend largely implemented.

## Phase 3 – Core Marketplace Modules

Includes:
- Real requirement management
- Seller verification
- Inquiry system
- Credits/wallet
- Notifications
- Status management
- Audit logs

Status:
- ✅ requirement management backend
- ✅ seller verification backend
- ✅ inquiry backend
- ✅ wallet/credits backend
- 🟡 status management partially represented by current lifecycle
- 🔴 notifications
- 🔴 general audit logs outside existing verification/transaction records

## Phase 4 – AI & Third-Party Integrations

Includes:
- AI-generated/dynamic requirement fields
- Voice input
- Maps/location
- OTP/SMS
- Email
- Odoo integration if needed

Status:
- 🟡 dynamic mock requirement generation exists in frontend
- 🟡 browser speech demo exists
- 🟡 location/map UI exists in some frontend flows
- 🟡 OTP backend abstraction exists; real SMS provider pending
- 🔴 live AI provider integration
- 🔴 production email integration
- 🔵 Odoo optional only

## Phase 5 – Security, DevOps & CI/CD

Includes:
- Security hardening
- Environment configuration
- Secrets management
- Automated build
- Automated tests
- Automated deployment
- Development
- Staging
- Production

Status:
- ✅ local User Secrets introduced
- ✅ CORS configured
- 🟡 general security hardening ongoing
- 🔴 CI/CD
- 🔴 Staging
- 🔴 Production deployment

## Phase 6 – Testing & Production Launch

Includes:
- unit testing
- integration testing
- end-to-end testing
- performance testing
- security testing
- production readiness
- deployment
- monitoring

Status: 🔴 Pending as a complete release phase, although manual API/frontend testing has been performed incrementally.

---

# 5. Existing Frontend Pages and Components

The following pages/components were mentioned or used during the project.

| Page / Component | Status | Purpose / Notes |
|---|---|---|
| `Home.tsx` | 🟡 Partially Implemented | Main landing / Buyer-Seller entry UI. Earlier design included Buyer/Supplier toggle and AI-first input. |
| `Marketplace.tsx` | 🟡 Partially Implemented | Marketplace/listing browsing. Earlier seller listing/card layout issues were discussed. |
| `Find.tsx` | ✅ Major implementation, still being integrated | Main requirement discovery/add/inquiry page. Current large orchestration file; public API integration works. |
| `Profile.tsx` | 🟡 Partially Implemented | Buyer/Seller profile, history, stats, requirement edit, seller verification UI. |
| `AiInput.tsx` | ⚪ Needs Verification | Early AI input component mentioned. Functionality may now be embedded/reworked inside Find/AiComposer. |
| `RequirementSummary.tsx` | ⚪ Needs Verification | Requirement review/summary; had TypeScript typing issues in earlier implementation. |
| `AttachmentMenu.tsx` | ⚪ Needs Verification | Attachment/image UI; earlier unused import build issue. |
| `Login.tsx` | ✅ Exists / fallback route | Login screen; normal Find flow now prefers AuthModal. |
| `Register.tsx` | ✅ Exists / fallback route | Registration screen; latest UX direction is compact signup. |
| `AuthModal.tsx` | ✅ Implemented/integrated | Modal login/register for normal marketplace actions. |
| `PhoneOtpModal.tsx` | ✅ Implemented/integrated | Real frontend OTP flow against backend. |
| `SendInquiryModal` | ✅ Implemented | Seller inquiry UI; must not be bypassed. |
| `RequirementCard` | ✅ Implemented inside current Find | Requirement card rendering with badges, budget, inquiry count, etc. |
| `RequirementDetail` | ✅ Implemented inside current Find | Requirement details/modal experience. |
| `AiComposer` | ✅ Implemented inside current Find | Requirement creation UI with text, voice, dynamic fields, image preview. |
| `BudgetRangeInput` | ✅ Implemented, enhancement pending | Slider exists; manual Min/Max numeric inputs still requested. |
| Admin layout/dashboard | ✅/🟡 | Admin shell exists; backend dashboard endpoint exists; frontend real API integration needs verification. |
| Chat UI | 🟡 Prototype/Planned | WhatsApp-like UI was discussed. Real-time backend chat not implemented. |
| Footer | 🟡 UI discussed/partially implemented | Professional footer, WhatsApp/support/reviews/links were requested. |
| Customer reviews section | 🟡 UI discussed | Backend transaction-based review system now exists, but frontend real API connection is pending. |
| How It Works | ✅ Modal/section exists in Find | Explanatory content exists; old wording still mentions 5 images and needs update to 20. |

## Find.tsx special warning

`Find.tsx` became very large (roughly 5,600+ lines in the latest exact uploaded source before recent patches).

Important historical bug:
- an older/stale generated Find patch was about 1,000 lines shorter
- user caught that content was missing
- decision: **never replace Find.tsx using an older/stale copy**
- always inspect and patch the exact latest current file

Desired future component split:

```text
src/components/find/
  FindHeader.tsx
  FindSearchBar.tsx
  RequirementFilters.tsx
  RequirementCard.tsx
  RequirementDetailModal.tsx
  RequirementPagination.tsx
  AddRequirementButton.tsx
  AiRequirementComposer.tsx
  MobileFilters.tsx
```

`Find.tsx` should gradually become an orchestrator instead of containing all UI logic.

---

# 6. Navigation

Known navigation concepts:
- Home
- Find
- Marketplace
- Profile
- Login
- Register
- Buyer/Seller role views
- filters/tabs
- Admin area

Historical navigation issues:
- Find tab disappeared during earlier frontend changes.
- Seller verification button disappeared from Profile in one iteration.
- Send Inquiry had incorrect navigation behavior.
- Login/Register role selection became inconsistent in one iteration.

Current Find authentication decision:
- normal marketplace auth should use a popup/modal
- do not navigate to `/login` for:
  - Header Sign In
  - logged-out Add Requirement
  - logged-out Send Inquiry
- Login/Register pages may remain as fallback/direct routes

Role intent must be preserved:
- Add Requirement → auth in Buyer mode
- Send Inquiry → auth in Seller mode

Older decision:
- “Send Inquiry should go directly to seller login” was requested in an earlier UI version.
Newer decision:
- this intent is now fulfilled through **seller-mode AuthModal** instead of necessarily navigating to a separate login page.

---

# 7. Authentication

## Backend authentication status

✅ Implemented:
- JWT auth
- buyer/seller/admin roles
- register
- email login
- `/api/auth/me`
- phone OTP
- frontend phone-login compatibility endpoint was added in integration package:
  - `POST /api/auth/login-phone`

JWT frontend storage key currently used:
`khoj_market_access_token`

## Frontend auth services

Current/introduced:
- `apiClient.ts`
- `authService.ts`
- `otpService.ts`
- `AuthModal.tsx`
- `PhoneOtpModal.tsx`

`apiClient.ts`:
- reads `VITE_API_BASE_URL`
- attaches Bearer token
- parses API errors
- clears token on 401

## Role selection

Buyer/Seller role selection is part of Login/Register UX.

The project has repeatedly required:
- login should know Buyer vs Seller intent
- register should also support role selection
- normal auth modal can be forced to Buyer or Seller when opened by a contextual action

## Latest Authentication UX Decision

Current/latest direction:

- authentication should be compact
- normal marketplace interactions use **AuthModal**
- signup should not be unnecessarily long
- do not ask many profile/business fields on first registration
- latest screenshot discussion questioned/removes **Full Name** from the long first-step signup experience
- support:
  - Email
  - Phone
  - social/single sign-on option
- Buyer/Seller role selection remains required
- profile completion can happen later
- after authentication, Sign In should be replaced by profile/user UI
- if auth was triggered by a requirement/inquiry, resume the original action

Earlier AuthModal concept:
- Continue with Google
- Continue with Phone
- Continue with Email

Current reality:
- Email backend auth works
- Phone auth/OTP works through current integration
- Google/social auth is **not real OAuth yet**
- current integration intentionally rejects/fails Google rather than pretending a fake JWT login is production auth

### Registration backend/frontend mismatch to verify

Earlier backend `RegisterRequest`/UserService expected a user name.
The newest frontend UX direction removes or minimizes Full Name on initial signup.

Status: ⚪ Needs Verification / contract adjustment may be required.

Possible safe approaches later:
- keep a minimal display name field if backend requires it, or
- change backend registration contract intentionally
- do not silently send fake/unexplained names in production

---

# 8. Buyer Flow

Current intended buyer flow:

1. Visitor opens Khoj Market.
2. Buyer browses public verified active requirements/sellers or creates a requirement.
3. Requirement may be entered using:
   - text
   - voice demo
   - images
4. System generates category-aware fields.
5. Buyer reviews and edits fields.
6. Required fields must be complete.
7. Buyer submits.
8. If not logged in:
   - open Buyer AuthModal
   - preserve pending requirement
9. After auth:
   - if account phone is unverified, show OTP
10. Successful OTP sets `Users.PhoneVerified = true`.
11. Requirement is created in backend.
12. Backend creates it as:
   - `Status = admin_review_required`
   - `ActivityStatus = active`
13. Buyer gets success state/reference.
14. Admin reviews requirement.
15. Admin approve → `verified`
16. Admin reject → `rejected`
17. Only verified + active + non-deleted requirements are public.
18. Verified sellers can send inquiries.
19. Buyer can view inquiry history, accept/reject as supported by backend.
20. Buyer can complete requirement:
   - through selected accepted KhojMarket seller
   - or elsewhere
21. If a real MarketplaceDeal exists and completes, reviews unlock.

Important buyer rule:
- buyer does **not** manually start verification
- there should be no customer-facing “Start Verification” button for requirement review

---

# 9. Buyer Requirement Fields

Fields discussed over the project include:

General:
- Product / requested item
- Category
- Subcategory
- Requirement Type (`product` or `service`)
- Budget
- Min Budget
- Max Budget
- Country
- Province/State
- City
- Area / Locality
- Address
- Postal Code
- Contact / Number
- Warranty
- Condition
- Images
- Attachments
- Voice input

Electronics examples:
- Brand
- Model
- Processor
- RAM
- Storage
- GPU
- Screen size

Car examples:
- Make
- Model
- Year
- Variant
- Mileage
- Transmission
- Fuel type
- Condition

Watch examples:
- Brand
- Model/reference
- Authenticity
- Condition
- Box/papers
- Color

## Critical design rule

Do **not** hard-code laptop-specific or watch-specific fields into the global requirement architecture.

Dynamic fields should be:
- category-aware
- stored as flexible RequirementFields/attributes
- generated/selected based on requirement category

Current backend stores dynamic fields in `RequirementFields`.

---

# 10. AI Requirement Creation

## Vision

User should be able to type/speak naturally in English, Urdu, or Roman Urdu.

AI should:
1. understand intent
2. infer product/service
3. infer category/subcategory
4. extract values
5. decide which category-specific fields are important
6. identify missing required fields
7. ask follow-up questions
8. fill the structured form
9. let user confirm/edit before submission

## Business-rule principle

AI is **not** the sole source of business truth.

The application/backend should enforce deterministic requirements/validation where appropriate.

## Current status

🟡 Partially Implemented:
- frontend has `generateMockRequirement(...)`
- current mock generator creates structured fields for several example categories
- requirement fields are editable
- AI-like composer UI exists

🔴 Pending:
- actual backend AI provider
- actual model-driven dynamic schema generation
- follow-up question engine
- production AI matching
- AI verification agent

Security:
- live AI keys must be stored server-side
- React must never contain production AI keys

---

# 11. Voice Input

## Intended behavior

- buyer speaks natural requirement
- transcription becomes text
- requirement generator extracts fields
- missing values are requested
- buyer confirms before posting

## Current implementation

🟡 Browser voice demo exists in `AiComposer`.

Known behavior:
- uses Web Speech API when browser supports it
- `en-PK` was used for Roman Urdu-ish speech
- `ur-PK` was discussed for Urdu
- Roman Urdu is not an official speech recognition locale
- browser support/transcription quality is not guaranteed

This is not yet a production speech-to-text backend.

---

# 12. Requirement Save Flow

## Historical bug

Earlier UI flow had:
- Save Requirement
- OTP
- then login screen appeared again unexpectedly
- “Your request saved” confirmation popup was missing

This was considered incorrect.

## Current intended flow

```text
Compose
→ validate
→ login if needed
→ OTP if account phone unverified
→ create requirement once
→ success notification
→ no unnecessary second login
```

Current authoritative backend create flow:
`POST /api/requirements`

New requirement:
- `admin_review_required`
- `active`

Latest frontend integration:
- old local `saveBuyerRequirement()` is being removed from authoritative creation path
- `requirementCreateApiService.ts` introduced
- OTP resume and login resume are being routed to backend creation
- exact runtime should still be regression-tested after image integration

Customer success state:
- friendly reference number such as `KM-REQ-XXXXXXXX`
- do not show raw GUID

Earlier exact wording requested:
`Your request saved`

Current success text in recent integration:
`Requirement submitted. Pending admin review.`

Both represent the same required success state; UI copy can be finalized later.

---

# 13. Seller Flow

Current intended seller journey:

1. Seller registers/logs in.
2. Seller selects Seller role.
3. Seller profile exists.
4. Seller completes seller verification.
5. Admin approves/rejects seller verification.
6. Verified seller can browse public verified active buyer requirements.
7. Seller selects a requirement.
8. Seller clicks Send Inquiry.
9. If seller phone is not verified:
   - OTP required
10. Seller sends message + offered price.
11. Backend validates:
   - seller role
   - seller verification
   - phone verification
   - requirement public/active
   - duplicate inquiry
   - credits
12. Backend deducts credits and creates inquiry in a transaction.
13. Seller can view inquiry history.
14. Buyer may view/accept/reject inquiry.
15. Completed deal may unlock ratings.

Seller profile/stat concepts:
- items sold
- listings
- inquiry history
- seller verification
- verified badge
- wallet/credits
- ratings

---

# 14. Seller Verification

## UI requirements

Discussed:
- Seller verification button in Profile
- green verified badge/indicator
- clear verification status

Historical bug:
- seller verification button disappeared from Profile in one iteration

## Backend

✅ Implemented admin seller verification endpoints:

- `GET /api/admin/sellers/pending`
- `GET /api/admin/sellers/{sellerUserId}`
- `POST /api/admin/sellers/{sellerUserId}/approve`
- `POST /api/admin/sellers/{sellerUserId}/reject`

Known audit fields:
- SellerVerificationStatus
- SellerVerificationReason
- SellerVerifiedByUserId
- SellerVerifiedAt

Statuses discussed:
- `not_started`
- `pending`
- `verified`
- `rejected`

Important historical integration detail:
- one generated `UserService.cs` patch temporarily used `"pending"` for seller registration
- latest actual backend source before that used `"not_started"`
- current preferred value is `"not_started"` unless product decision changes

## Seller phone verification

Current locked rule:
- seller verification and phone verification are separate
- seller must have:
  - `SellerVerificationStatus = verified`
  - `PhoneVerified = true`
- seller OTP must occur before inquiry if phone is unverified

This rule was added after a real bug where a verified seller with `PhoneVerified=false` could still send an inquiry.

---

# 15. Marketplace

Marketplace behavior discussed includes:
- seller listings
- buyer requirements
- cards
- categories
- filters
- location
- buyer/seller interaction
- verified badges
- inquiry/contact actions

Historical layout issue:
- seller listings showed two cards per row
- layout needed improvement

Historical button decision:
- replace `View Listing` with `Contact` in the relevant seller listing context

Long-term marketplace discovery filters discussed:
- category/subcategory
- city/area
- budget/price
- condition
- brand/model
- verified only
- trust score
- availability
- delivery time
- date posted

Not all of these exist server-side yet.

---

# 16. Find Feature

`Find.tsx` is currently the most active frontend marketplace page.

## Purpose

- show public buyer requirements
- provide search/filtering
- show details
- allow seller inquiry
- allow buyer requirement creation
- handle auth/OTP resume
- support Add Requirement composer

## Current public API

✅ Working:
`GET /api/requirements/public`

A previous bug showed `0 requirements found` even though Swagger returned one requirement.

Root cause:
- frontend parsed a range string such as:
  `PKR 5,000,000 - 6,000,000`
- naive parsing produced one huge number
- budget filtering excluded the item

Fix:
- API list model now carries `budgetMin` and `budgetMax`
- overlap filtering uses numeric values directly

User confirmed this public requirement flow worked correctly.

## Current Find filter UI concepts

- Category
- Country
- City
- Area/postal where applicable
- Min/Max budget
- Date posted
- Product/Service
- Verified only
- Active/Inactive
- mobile filters

## Current server-supported public/common filters

Confirmed backend:
- search
- category
- requirementType
- country
- city
- page
- pageSize

Buyer “mine” additionally supports:
- status
- activityStatus

Not yet confirmed/implemented server-side:
- area
- province/state
- budgetMin/budgetMax filtering
- posted date
- map/distance
- condition
- brand/model

## Shared filter issue

Recent bug:
- Buyer home filters displayed different options/data from Seller and logged-out views.

Current decision:
- unify filters and query contract across guest/buyer/seller where public data is the same.

---

# 17. Inquiry Flow

## Current backend endpoint

`POST /api/inquiries/requirements/{requirementId}`

Request:
- message
- offeredPrice

## Current rule

Only Seller account can send inquiry.

Buyer UI should:
- disable/hide seller action
- show message:
  `Inquiries can only be sent from a Seller account.`

## Seller conditions

Seller must:
- be logged in
- have role seller
- have SellerVerificationStatus verified
- have PhoneVerified true
- target requirement must be verified + active + not deleted
- not be requirement owner
- not have already sent duplicate inquiry
- have enough credits

## Current frontend integration

✅/🟡 `inquiryApiService.ts` introduced and Find patched to use backend inquiry API.

Historical problem:
- old `inquiryService.ts` used localStorage and local credit deduction
- it still exists because other screens may depend on query/history helpers
- do not delete it blindly until all consumers migrate

## Important current UI mismatch

`SendInquiryModal` may still display wallet balance using old local `creditService.ts`.

Backend is authoritative for deduction, but displayed balance can be stale.

Status: 🔴 Pending migration to `GET /api/seller/wallet`.

---

# 18. Contact Button / Listing UX

Previous UI decision:

Where a seller listing card used:

`View Listing`

change the action to:

`Contact`

The intent:
- make the primary action clearer
- user should start contact/inquiry flow rather than view an unnecessary secondary listing screen

Older discussion also said:
- `Send Inquiry` from seller-oriented action should lead to seller authentication

Current interpretation:
- use seller-mode AuthModal and resume Send Inquiry
- do not regress to wrong Buyer login or lose intended action

---

# 19. Chat System

A WhatsApp-like chat experience was discussed.

Desired UI:
- buyer/seller messages
- attachment icons
- image upload
- file attachments
- familiar conversation layout
- seller matching suggestions when relevant

Current status:
- 🟡 UI concept/prototype discussed
- 🔴 real-time backend chat not confirmed implemented

Later backend needs may include:
- conversations
- messages
- attachments
- message timestamps/status
- participant authorization
- real-time transport such as SignalR only when actually needed

Do not introduce SignalR prematurely unless implementing real chat.

---

# 20. Profile System

## Buyer Profile

Expected:
- account details
- requests posted
- completed requests
- pending/admin-review requirements
- history
- requirement actions
- ratings/reviews
- profile replaces Sign In once authenticated

Buyer requirement actions locked:
- View
- Edit
- Active/Inactive
- Mark Complete
- Delete

## Seller Profile

Expected:
- account details
- seller verification
- green verified badge
- seller listings
- items sold
- inquiries/history
- credits/wallet
- ratings/reviews

Known historical issue:
- seller verification button missing

Current status:
- UI exists substantially
- some data/actions still require full backend integration

---

# 21. Profile Statistics

Statistics discussed:
- Requests posted
- Requests completed
- Pending requests
- Items sold
- seller history/inquiry counts
- buyer/seller ratings

Known bug:
- pending request count was incorrect in an earlier implementation

Status:
- ⚪ Needs current verification after backend migration

Recommendation:
- stats should ultimately come from backend data, not localStorage-derived counts.

---

# 22. Reviews

## Current business rule

Reviews are transaction-based.

A review is allowed only after a completed MarketplaceDeal.

Allowed:
- Buyer → Seller
- Seller → Buyer

Rules:
- one review per reviewer per deal
- rating 1–5
- optional comment
- historical review remains even if requirement later becomes inactive/deleted
- same two users can review each other again on a different completed deal

## Backend

✅ Implemented endpoints:

- `POST /api/deals/{dealId}/reviews`
- `GET /api/deals/{dealId}/reviews`
- `GET /api/users/{userId}/rating`
- `GET /api/users/{userId}/reviews`

Aggregate:
- AverageRating
- ReviewCount

## Frontend

🟡 Rating display exists/concepts exist on cards.
🔴 Full real review API integration still pending.

---

# 23. Footer

Professional footer was requested.

Discussed content:
- customer support
- WhatsApp details
- navigation links
- company information
- How It Works
- customer reviews/trust content

Status:
- 🟡 partially implemented/discussed
- current exact frontend version should be inspected before changing

---

# 24. How It Works

How It Works content exists in Find as a modal/section.

Typical steps shown:
1. Add Requirement
2. Review details
3. Verification
4. Seller inquiries

Known stale content:
- older UI wording still says “maximum 5 images”
- current product rule is **20**

Status:
- ✅ UI exists
- 🔴 copy needs consistency update

---

# 25. Location

Khoj Market is local/Pakistan focused.

Fields/behavior discussed:
- Country
- Province / State
- City
- Area / Locality
- Postal Code
- Address
- map selection
- current browser location
- location-based filtering/matching

Frontend direction:
- country/city data should be API/data-driven
- do not hard-code only a Pakistan city array into reusable architecture

Current map UI:
- a map/location modal exists in Find-related code
- OpenStreetMap embed appeared in existing frontend code
- future provider choice is not locked as a general platform commitment

Backend currently stores:
- Country
- City
- Area
- PostalCode

Province/state was discussed in UI but not confirmed as backend model field.

---

# 26. Images and Attachments

## Requirement images

Current locked rules:
- minimum 1 image for current requirement submission UX
- maximum 20
- JPG/JPEG/PNG/WEBP
- current max 5 MB per image
- first image = cover

Storage:
- development backend stores path/file metadata, not base64 in SQL
- current dev filesystem path pattern was discussed:
  `wwwroot/uploads/requirements/<ReferenceNo>/`
- production target is object storage such as Azure Blob

## Current inconsistency

Older code still contains:
- max 5 in frontend AiComposer
- `/5` counters
- “Maximum 5 images”
- old Profile image slices of 5
- one uploaded RequirementService source had `MaxImages = 5`

Locked latest decision:
**20 images everywhere**

This must be normalized across:
- backend
- Find
- Profile
- How It Works
- validation messages

## Chat attachments

Planned:
- images/files in buyer-seller chat
- no confirmed production attachment service yet

---

# 27. OTP

## Current confirmed OTP rule

OTP is **account phone verification**, not per-requirement verification.

Buyer:
- unverified buyer must OTP before first requirement submission
- once PhoneVerified=true, no OTP on every new requirement

Seller:
- verified seller with PhoneVerified=false must OTP before sending inquiry

Successful OTP:
- marks `Users.PhoneVerified = true`

AI must never set `PhoneVerified`.

## Backend

✅ Implemented:
- `POST /api/auth/otp/send`
- `POST /api/auth/otp/verify`

Development behavior:
- 6-digit OTP
- hashed in DB
- ~5 minute expiry
- old unused OTP invalidated
- max attempts around 5
- development response may expose `developmentOtp`
- `DevelopmentSmsService` logs OTP
- `ISmsService` abstraction exists

🔴 Real SMS provider not connected.

## Earlier seller verification ideas

OTP/call/AI verification ideas were discussed for marketplace trust.

Current distinction:
- OTP confirms account phone
- seller business verification is separate
- requirement verification is separate

---

# 28. Notifications

Notifications discussed:
- new seller inquiry
- inquiry response
- seller verification
- requirement approved/rejected/status change
- chat/message
- order/deal status

Status: 🔴 Pending as a complete backend/frontend module.

Do not mark notifications implemented merely because UI success messages exist.

---

# 29. Credits / Wallet

## Current backend implementation

✅ Seller wallet exists.

Config currently used:

```json
"MarketplaceCredits": {
  "InitialSellerCredits": 100,
  "InquiryCost": 10
}
```

Seller endpoints:
- `GET /api/seller/wallet`
- `GET /api/seller/wallet/transactions`

Admin endpoints:
- `GET /api/admin/sellers/{sellerUserId}/wallet`
- `GET /api/admin/sellers/{sellerUserId}/wallet/transactions`
- `POST /api/admin/sellers/{sellerUserId}/wallet/adjust`

Transaction types:
- initial_balance
- inquiry_deduction
- admin_credit
- admin_deduction
- refund

Rules:
- inquiry deduction is server-side
- wallet cannot go below zero
- every balance change creates transaction history
- create inquiry + deduction occurs in one DB transaction

## Historical product concept

An earlier working SAS proposed inquiry fees as percentage of buyer budget with min/max/fixed rules.

That is **not the current implemented fee model**.

Current implementation:
- fixed configured `InquiryCost`

Status of dynamic/category-specific percentage fees:
🔵 Planned/older proposal, not current behavior.

## Frontend

🟡 inquiry submission uses backend credits
🔴 displayed balance may still use local credit service in some UI

---

# 30. Admin Panel

## Backend

✅ Admin capabilities implemented include:

Requirement review:
- pending list
- approve
- reject

Seller verification:
- pending sellers
- detail
- approve
- reject

Wallet:
- view seller wallet
- transaction history
- adjust credits

Dashboard:
- `GET /api/admin/dashboard`

Dashboard metrics discussed/implemented:
- TotalBuyers
- TotalSellers
- PendingSellers
- VerifiedSellers
- TotalRequirements
- PendingRequirements
- ActiveVerifiedRequirements
- CompletedRequirements
- TotalInquiries
- CompletedDeals
- TotalReviews
- TotalSellerCreditBalance

## Frontend

Admin layout/dashboard UI exists.

Current issue from recent testing:
- new buyer request was not showing on Admin Pending page because frontend creation still used localStorage at that time.

Root cause:
- frontend and admin were reading different sources.

Current fix direction:
- requirement create moved to backend
- admin pending frontend should read real API

Status:
🟡 Backend complete, frontend integration needs full verification.

---

# 31. Backend Modules Needed

## MVP / already implemented or required now

### ✅ Implemented core
- Auth
- Users
- Roles
- OTP
- Requirements
- Dynamic RequirementFields
- Requirement Images
- Requirement lifecycle
- Requirement verification
- Favorites
- Seller inquiries
- Seller verification
- Wallet/Credits
- Marketplace deals
- Reviews/Ratings
- Admin dashboard
- global exception handling
- CORS
- health check

### 🟡 Frontend integration still required
- requirements
- images
- favorites
- wallet
- deals/reviews
- admin screens

## MVP still pending
- notifications
- production file storage
- real SMS
- complete shared filters/server-side filtering where UI expects them
- full end-to-end frontend migration off mock/local data

## Later phase
- live AI requirement extraction
- AI follow-up questions
- AI matching
- chat backend
- email service
- maps provider integrations
- payment gateway/credit purchasing
- trust score
- dispute management
- optional Odoo integration
- advanced audit/reputation tooling

Architecture rule:
- do not add microservices unless future scale/ownership requires them.

---

# 32. Database Entities

## Existing confirmed tables

✅ Current known DB tables:

- Users
- Requirements
- RequirementFields
- RequirementImages
- PhoneOtps
- RequirementFavorites
- SellerInquiries
- SellerWallets
- CreditTransactions
- MarketplaceDeals
- MarketplaceReviews
- `__EFMigrationsHistory`

## Existing model concepts

### User
Known fields include:
- Id
- ReferenceNo
- Name
- Email
- Phone
- PasswordHash
- Role
- PhoneVerified
- SellerVerificationStatus
- seller verification audit fields

### Requirement
Known concepts:
- Id
- ReferenceNo
- UserId
- Title
- Category
- SubCategory
- RequirementType
- Status
- ActivityStatus
- BudgetMin
- BudgetMax
- Country
- City
- Area
- PostalCode
- PhoneVerified snapshot
- verification metadata
- completion metadata
- deletion metadata
- timestamps

### RequirementField
Dynamic requirement attribute:
- FieldKey
- Label
- Value
- IsRequired
- SortOrder

### RequirementImage
- FilePath
- IsCover
- SortOrder
- CreatedAt

### PhoneOtp
- hashed code
- expiry
- attempts
- used timestamp

### SellerInquiry
- RequirementId
- BuyerUserId
- SellerUserId
- Message
- OfferedPrice
- Status
- ViewedAt
- RespondedAt
- CreatedAt

### SellerWallet / CreditTransaction
Current credit system.

### MarketplaceDeal
Known:
- RequirementId
- BuyerUserId
- SellerUserId
- InquiryId
- Status
- CompletedAt
- CreatedAt

### MarketplaceReview
Generalized review table.

## Proposed/not confirmed entities

🔵 Planned/possible:
- Category
- CategoryAttribute schema
- SellerProfile separate entity
- BuyerProfile separate entity
- SellerListing
- Conversation
- Message
- Attachment
- Notification
- AuditLog
- Dispute
- Payment/CreditPackage

Do not create these solely because they appear here; inspect current backend first.

---

# 33. API Areas

## Actual current APIs

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/login-phone` (integration addition)
- `GET /api/auth/me`
- `POST /api/auth/otp/send`
- `POST /api/auth/otp/verify`

### Requirements
- `POST /api/requirements`
- `POST /api/requirements/{requirementId}/images`
- `GET /api/requirements/public`
- `GET /api/requirements/mine`
- `GET /api/requirements/{requirementId}`
- `PUT /api/requirements/{requirementId}`
- `PATCH /api/requirements/{requirementId}/activity`
- `PATCH /api/requirements/{requirementId}/complete`
- `DELETE /api/requirements/{requirementId}`

### Admin Requirement Review
- `GET /api/admin/requirements/pending`
- `POST /api/admin/requirements/{requirementId}/approve`
- `POST /api/admin/requirements/{requirementId}/reject`

### Favorites
- `POST /api/requirements/favorites/{requirementId}`
- `DELETE /api/requirements/favorites/{requirementId}`
- `GET /api/requirements/favorites`

### Inquiries
- `POST /api/inquiries/requirements/{requirementId}`
- `GET /api/inquiries/requirement/{requirementId}`
- `GET /api/inquiries/seller/mine`
- `PATCH /api/inquiries/{inquiryId}/viewed`
- `PATCH /api/inquiries/{inquiryId}/accept`
- `PATCH /api/inquiries/{inquiryId}/reject`

### Seller Wallet
- `GET /api/seller/wallet`
- `GET /api/seller/wallet/transactions`

### Admin Wallet
- `GET /api/admin/sellers/{sellerUserId}/wallet`
- `GET /api/admin/sellers/{sellerUserId}/wallet/transactions`
- `POST /api/admin/sellers/{sellerUserId}/wallet/adjust`

### Deals
- `GET /api/deals/requirement/{requirementId}`
- deal is also created as part of completion flow where applicable

### Reviews
- `POST /api/deals/{dealId}/reviews`
- `GET /api/deals/{dealId}/reviews`
- `GET /api/users/{userId}/rating`
- `GET /api/users/{userId}/reviews`

### Seller Verification Admin
- `GET /api/admin/sellers/pending`
- `GET /api/admin/sellers/{sellerUserId}`
- `POST /api/admin/sellers/{sellerUserId}/approve`
- `POST /api/admin/sellers/{sellerUserId}/reject`

### Admin Dashboard
- `GET /api/admin/dashboard`

### Health
- `GET /health`

## Conceptual future API areas

🔵 Planned:
- `/notifications`
- `/chat`
- `/files` abstraction if file handling is separated
- `/categories`
- `/listings`
- `/payments`
- `/disputes`

---

# 34. Frontend State Management

No Redux/Zustand decision has been made.

Do not introduce one without need.

Current approach:
- React component state/hooks
- service modules
- localStorage for older/mock/demo flows
- API services for migrated real flows

Current/old localStorage responsibilities included:
- current/mock auth
- pending requirement
- saved buyer requirements
- seller credits
- seller inquiries
- UI drafts

Migration principle:
- once a real backend API is connected, localStorage must not remain the authoritative source for the same business entity.

Examples:
- public requirements now from API
- auth now from backend/JWT
- OTP now backend
- inquiry create now backend
- requirement creation being moved to backend
- wallet display still partly local
- profile/history may still contain local paths

---

# 35. Known TypeScript / Build Issues

Historical build issues that should not be reintroduced:

## RequirementSummary.tsx
Earlier errors:
- object key typing for:
  - product
  - brand
  - model
  - processor
  - ram
  - storage
  - condition
  - budget
  - location
  - warranty
- `.trim()` called on a union type
- value type mismatch

Status: ⚪ Current exact component should be checked; earlier build was subsequently moved past these issues.

## AttachmentMenu.tsx
- unused import

Status: ⚪ Needs verification in current tree.

## Profile.tsx
Historical:
- unused variable
- prop mismatch:
  - component destructured `onEdit`
  - prop type still declared `onStartVerification`
- fix:
  - type changed to `onEdit: () => void`

Status: ✅ fixed in one build-fix patch, but current repository should verify.

## requirementService.ts
Historical TS narrowing:
- `nextStatus` was guaranteed not to be `"verified"`
- code still compared it with `"verified"`
- `aiVerified` fix changed to false in edited requirement path

Status: ✅ fixed in build patch.

## Find.tsx
Historical:
- unused `getInquiryCountByRequirement`
- unused `RequirementType`
- stale unused `requirementsError`
- unused helper functions
- missing `sendInquiry` after migration
- missing `setOtpPurpose`
- stale `saveBuyerRequirement` import
- exact stale-file replacement bug

Recent fixes:
- old `sendInquiry` replaced with `sendSellerInquiry`
- `saveBuyerRequirement` import removed
- setter/state added for otp purpose
- `requirementType` normalized to strict product/service in API mapper

Current rule:
Always run:
`npm run build`
after changes.

---

# 36. Known Functional Bugs

| Issue | Expected Behavior | Status |
|---|---|---|
| Send Inquiry wrong navigation | Open Seller auth/resume seller inquiry | 🟡 Flow patched to seller-mode auth; regression test |
| Buyer could see/use Send Inquiry | Buyer should not send inquiry | ✅ Restriction/message patched |
| Seller sent inquiry with PhoneVerified=false | OTP required before inquiry | ✅ Backend/frontend guard added |
| Seller listings two cards per row | Improved professional layout | ⚪ Needs current verification |
| “View Listing” action | Should be “Contact” where agreed | ⚪ Needs current verification |
| Save Requirement → OTP → login again | Continue original save without second login | 🟡 Flow reworked; real create integration needs full test |
| Missing request saved popup | Clear success state/reference | 🟡 Success state exists; UX final check |
| Pending request count wrong | Accurate backend-driven count | 🔴 Pending current profile/API migration |
| Seller verification button missing | Button/status visible in Seller profile | ⚪ Needs current verification |
| Login/Register role selection mismatch | Consistent Buyer/Seller role handling | 🟡 Auth package improved; newest compact UX pending |
| Find tab disappeared | Navigation should preserve intended Find access | ⚪ Historical, current nav verify |
| Signup screen too long | Compact signup | 🔴 Latest redesign direction pending completion |
| Admin pending did not show new buyer requirement | Requirement must be created in backend DB and admin uses pending API | 🟡 Real requirement create integration underway |
| Guest/Buyer/Seller filter data differed | Shared public filter/query model | 🔴 Pending |
| Public API returned item but UI showed 0 | Numeric range filtering | ✅ fixed |
| Wallet balance in inquiry modal can be stale | Real backend wallet balance | 🔴 Pending |
| UI/backend image max mismatch 5 vs 20 | 20 consistently everywhere | 🔴 Immediate fix |
| Add Requirement no explicit Product/Service option | Visible editable selector | 🔴 Pending |
| Budget only slider | Slider plus manual Min/Max inputs | 🔴 Pending |

---

# 37. UI/UX Decisions

Current important UI/UX decisions:

- professional marketplace appearance
- responsive
- Pakistani/local feel
- simple business language
- Buyer/Seller role-aware UI
- AuthModal instead of unnecessary route switching in normal flow
- signup should be compact
- WhatsApp-like chat
- clear requirement success notification
- green verified seller badge
- “Verified Requirement” wording for requirement badge
- do not call buyer “Verified User” just because requirement is verified
- top filters/tabs
- OLX-like card readability
- card should show image + title + location + budget + badges + inquiry count
- Add Requirement floating CTA
- user can review AI-generated fields before posting
- required fields show red `*` and inline validation
- country/city required in current composer
- unknown requirement must preserve original intent rather than defaulting to unrelated demo category
- minimum one requirement image in current UI
- current max image rule = 20
- no raw GUID shown to users
- use friendly `KM-REQ-...` reference number

---

# 38. Registration Redesign

## Decided/latest direction

- Signup screen was considered too long.
- Initial registration should be compact.
- Buyer/Seller role selection stays.
- Support Email or Phone.
- Single sign-on/social login is desired.
- Avoid collecting unnecessary profile/business fields at first signup.
- Full Name was specifically questioned for removal from the long initial signup form.
- Profile details can be completed later.

## Still open / needs contract alignment

- backend currently has `Name` in User model/register flow
- decide whether:
  - a minimal display name stays, or
  - backend register contract changes
- exact real social provider implementation
- real OAuth callback/config

## Needs implementation

- final compact Register/AuthModal UI
- real Google/social OAuth if retained
- production email verification if required

---

# 39. Business Rules

Current confirmed rules:

1. Roles are buyer, seller, admin.
2. Buyer must be authenticated before final requirement creation.
3. Buyer must have verified phone before creating a requirement.
4. `PhoneVerified` can only come from successful OTP.
5. AI verification must not set PhoneVerified.
6. New requirement:
   - Status = `admin_review_required`
   - ActivityStatus = `active`
7. Buyer does not manually start requirement verification.
8. Admin/AI may verify requirement through central verification logic.
9. Public requirements must be:
   - verified
   - active
   - not deleted
10. Verification status and activity status are separate.
11. Editing a verified/rejected requirement returns it to admin review.
12. Delete is soft delete.
13. Completed requirement becomes inactive.
14. Seller must be verified before inquiry.
15. Seller must also have verified phone before inquiry.
16. Buyer accounts cannot send seller inquiries.
17. One seller inquiry per requirement.
18. Inactive requirement cannot accept new inquiry.
19. Inquiry acceptance does not automatically mean purchase complete.
20. Credits are deducted on backend.
21. Credit deduction and inquiry creation are transactional.
22. Seller wallet cannot go below zero.
23. Every balance change has transaction history.
24. Reviews only after completed MarketplaceDeal.
25. One review per reviewer per deal.
26. Ratings belong to user accounts, not requirement records.
27. Requirement images:
   - min 1 in current creation UX
   - max 20
   - JPG/JPEG/PNG/WEBP
   - 5MB current max each
28. First requirement image is cover.
29. Dynamic requirement fields should not be globally hard-coded by category.
30. Buyer contact/privacy details should not be unnecessarily public.
31. Backend is authoritative for security-sensitive logic.

---

# 40. Security Requirements

Implemented or required:

## Authentication/Authorization
- JWT Bearer
- role-based controller/action checks
- buyer/seller/admin separation

## Backend validation
- never rely only on frontend
- validate ownership
- validate requirement state
- validate seller status
- validate phone verification
- validate wallet balance
- validate duplicate inquiry
- validate file extensions/size/count

## Secrets
- User Secrets for local development
- production secrets must use environment/secret storage
- do not commit:
  - JWT key
  - production DB connection string
  - SMS credentials
  - storage credentials
  - AI keys

## Upload security
- allow-list file types
- validate file length
- object storage later
- do not trust client filename/path

## API errors
Global middleware currently maps:
- KeyNotFoundException → 404
- UnauthorizedAccessException → 403
- InvalidOperationException → 400
- ArgumentException → 400
- unexpected → 500

## Audit
Existing:
- seller verification audit fields
- wallet transactions
- deal/review records

General audit log:
🔴 Pending if broader audit requirements are needed.

---

# 41. DevOps

Planned/partially implemented:

## Current
- local .NET 10 backend
- local SQL Server Express
- Vite frontend
- CORS
- User Secrets
- health endpoint

## Target deployment
- Frontend: Vercel
- Backend: Azure App Service or equivalent
- Database: Azure SQL Database
- Images: Azure Blob Storage or equivalent

Cloud deployment decision:
- **do not deploy yet**
- first stabilize local UI/API integration and regression flows

## Pending
- CI/CD
- automated test pipeline
- Dev/Staging/Production environment separation
- production config
- monitoring
- logging refinement
- backups
- deployment scripts

---

# 42. Testing Strategy

## Frontend
Run:
- `npm run build`

Test:
- guest browsing
- buyer login/register
- seller login/register
- role-aware actions
- OTP flows
- Add Requirement
- filters
- profile
- seller inquiry
- admin screens

## Backend
Run:
- solution/project build
- EF migration validation where schema changes
- Swagger/manual API tests
- unit/integration tests as introduced

## End-to-end core flow

Recommended regression:

1. Register buyer
2. Login buyer
3. Buyer PhoneVerified false
4. Add requirement
5. OTP shown
6. Verify OTP
7. Requirement created
8. Confirm DB status = admin_review_required + active
9. Confirm Admin Pending shows requirement
10. Admin approve
11. Confirm public API returns requirement
12. Register/login seller
13. Confirm seller unverified cannot inquire
14. Admin verifies seller
15. Confirm PhoneVerified=false seller gets OTP before inquiry
16. Verify seller phone
17. Check wallet
18. Send inquiry
19. Confirm credits deducted exactly once
20. Confirm duplicate inquiry blocked
21. Buyer views inquiry
22. Accept/reject
23. Complete requirement through accepted seller or elsewhere
24. Confirm MarketplaceDeal if KhojMarket seller selected
25. Buyer reviews seller
26. Seller reviews buyer
27. Confirm aggregate ratings
28. Test active/inactive
29. Test edit → admin_review_required
30. Test soft delete
31. Test favorites
32. Test guest/buyer/seller filters produce consistent public results
33. Run frontend build
34. Run backend build/tests

---

# 43. Current Project Status

## ✅ Implemented

Backend:
- JWT auth
- buyer/seller/admin roles
- OTP backend
- requirement create
- dynamic fields
- requirement images backend
- requirement lifecycle
- requirement public/mine/admin read APIs
- admin requirement approval/rejection
- favorites
- seller inquiries
- seller wallet/credits
- admin credit adjustment
- MarketplaceDeal
- reviews
- ratings
- seller verification admin flow
- admin dashboard
- global exception middleware
- CORS
- User Secrets
- health endpoint
- SMS abstraction

Frontend confirmed:
- substantial React/TS UI
- Find page
- public requirement API integration
- API client/JWT
- auth/OTP integration package
- seller inquiry API service
- buyer inquiry restriction
- seller phone OTP inquiry guard
- requirement create API service added
- requirement composer UI
- voice demo
- image preview
- filters/pagination UI
- profile/admin UI foundations

## 🟡 Partially Implemented

- requirement creation frontend → backend runtime flow
- requirement image upload frontend
- admin pending frontend real API
- buyer mine/profile requirements backend data
- seller wallet frontend
- favorites frontend
- deal/reviews frontend
- shared filters
- compact registration redesign
- seller profile verification UI
- chat prototype
- footer/review sections

## 🔴 Pending

- normalize 20-image rule everywhere
- real image upload wiring
- explicit Product/Service selector in Add Requirement
- manual Min Budget/Max Budget inputs
- real wallet display
- unified filters + extra server filters
- notifications
- real SMS
- production storage
- full E2E regression
- deployment

## 🔵 Planned Later

- real AI requirement extraction
- AI follow-up questions
- AI matching
- AI requirement verification agent
- production speech-to-text improvements
- real chat
- payments/credit packages
- email
- optional Odoo
- trust score
- disputes
- reputation scanning
- advanced analytics

## ⚪ Needs Verification

- exact current status of Home/Marketplace older components
- old Find tab navigation
- seller listing layout
- Contact button replacement
- latest Register screen after recent design iteration
- current pending profile count
- older RequirementSummary/AttachmentMenu warnings
- all old localStorage call sites
- current backend `MaxImages` value in user’s actual working file after last manual edit

---

# 44. Completed Work History

## Early frontend/product phase

- Created Pakistan-focused local buyer/supplier marketplace concept.
- Defined Buyer/Seller toggle.
- Added product requirement fields for example electronics.
- Added voice/AI input concepts.
- Added image upload/attachment concepts.
- Built Home, Find, Marketplace, Profile and auth-related UI pieces.
- Added seller listings and inquiry actions.
- Added customer review/footer concepts.
- Added profile statistics.
- Added localStorage mock persistence for fast UI iteration.

## UI bug-fix phase

Issues handled over time:
- seller verification button missing
- role selection inconsistencies
- Find tab disappearing
- Send Inquiry navigation
- seller card layout
- View Listing → Contact
- requirement save/OTP/login loop
- missing success popup
- pending count mismatch
- RequirementSummary TS errors
- unused imports/variables
- various `Find.tsx` compile errors

## Requirement flow redesign

Older flow:
- AI/phone verification statuses were mixed into requirement submission.

Current locked redesign:
- OTP verifies account
- new requirement directly becomes `admin_review_required`
- admin/AI review is separate
- no Start Verification button for buyer
- verification and activity are separate

## Backend build phase

Implemented:
- SQL/EF core
- JWT auth
- OTP
- requirements
- images
- verification
- lifecycle
- favorites
- inquiries
- credits
- deals
- reviews
- seller admin verification
- dashboard
- exception handling
- CORS
- secrets
- health
- SMS abstraction

## Frontend API integration phase

Progress:
- created `apiClient.ts`
- created `requirementApiService.ts` / v2
- connected public requirements
- fixed numeric budget range filtering
- connected auth/OTP
- added phone login compatibility
- added seller PhoneVerified inquiry backend guard
- created `inquiryApiService.ts`
- migrated inquiry create from local service to backend
- fixed buyer Send Inquiry UI
- added seller OTP before inquiry
- introduced `requirementCreateApiService.ts`
- began removing `saveBuyerRequirement` from authoritative create flow

## Important stale-file incident

A generated Find patch used an older copy and was ~1,000 lines shorter than the current user file.

Permanent lesson:
- never overwrite a large current file from an old generated copy
- inspect exact latest source
- patch surgically
- prefer extracting components instead of repeatedly regenerating huge files

---

# 45. Pending Work

## Critical

1. Verify current frontend build after latest requirement-create changes.
2. Make requirement creation fully backend-authoritative.
3. Wire real requirement images.
4. Fix backend/frontend image count to 20 consistently.
5. Ensure unverified buyer cannot create requirement.
6. Ensure Admin Pending shows newly created DB requirement.
7. Ensure unverified seller cannot inquire.
8. Remove/avoid remaining authoritative localStorage paths for integrated entities.

## MVP

- Add Requirement explicit Product/Service selector
- manual Min/Max Budget inputs
- shared filters
- buyer `mine` requirements integration
- admin pending integration
- favorites integration
- real seller wallet UI
- inquiry list/history integration
- completion/deal UI
- review/rating UI
- seller verification UI against admin backend
- profile stats from backend
- consistent success/error UX
- full E2E regression

## Important

- extra filter support server-side
- notifications
- file/image production abstraction
- real SMS
- better componentization
- auth UX redesign
- proper loading/error states across all API screens
- remove deprecated mock services once unused

## Later

- AI
- chat
- payment gateway
- credit package purchasing
- email
- maps/provider refinement
- Odoo optional integration
- disputes/trust score
- production monitoring/deployment

---

# 46. Immediate Next Steps

Do not jump to Azure yet.

Best current order:

1. **20 image consistency**
   - backend `MaxImages = 20`
   - validation message
   - Find image counter/limit
   - Profile edit image limit
   - How It Works wording

2. **Add Requirement UX**
   - explicit Product / Service selector
   - AI may preselect it
   - user can change it
   - manual Min Budget and Max Budget fields
   - keep slider synchronized

3. **Real image upload**
   - inspect exact `RequirementsController`/DTO binding first
   - match multipart field name exactly
   - do not guess
   - upload after requirement create or update create contract according to actual backend source

4. **Admin Pending**
   - ensure frontend uses `/api/admin/requirements/pending`
   - verify new backend-created requirement appears

5. **Buyer Mine/Profile**
   - replace local requirement history with `/api/requirements/mine`

6. **Wallet**
   - migrate inquiry modal balance to `/api/seller/wallet`

7. **Shared Filters**
   - use one public filter component/query contract
   - add missing server filters intentionally

8. **Full regression**

9. Deployment only after stable.

---

# 47. Things Codex Must NOT Do

Codex must not:

- rewrite the entire application without reason
- remove existing working features
- change business rules silently
- create duplicate components/services/models before searching existing code
- assume frontend and backend are one repository
- hardcode API URLs
- hardcode secrets
- bypass authentication to make UI appear functional
- use fake verification in place of backend rules
- replace real backend persistence with localStorage after migration
- invent new business requirements
- modify unrelated features during a focused fix
- introduce new libraries without clear reason
- introduce microservices prematurely
- move core marketplace logic into Odoo
- put AI API keys in frontend
- put credit deduction only in React
- allow Buyer account to send Seller inquiry
- conflate PhoneVerified, SellerVerificationStatus and requirement verification
- expose raw GUID as friendly reference
- reintroduce 5-image limit after current 20-image decision
- show “Verified User” just because requirement is verified
- restore customer “Start Verification” requirement button
- overwrite `Find.tsx` using a stale/older copy
- ignore compiler warnings/errors introduced by changes
- claim tests passed unless they were actually run

---

# 48. Codex Working Method

For every task:

1. Read `PROJECT_CONTEXT.md`.
2. Read repository-specific `AGENTS.md` if present.
3. Identify whether this is frontend or backend repo.
4. Inspect the existing implementation before editing.
5. Search for reusable services/components/models.
6. Identify affected files.
7. Make the smallest safe change.
8. Preserve current business rules.
9. Keep frontend/backend contracts synchronized.
10. Reuse existing status strings/contracts.
11. Run build/tests available in that repo.
12. Fix errors introduced by the change.
13. Summarize exactly what changed.
14. Mention anything still pending.
15. Never claim runtime verification if only compilation was checked.
16. For large frontend files, prefer extracting/reusing smaller modules instead of wholesale rewriting.
17. If current source conflicts with this context, stop and report the discrepancy rather than silently choosing.

---

# 49. Frontend Repository Instructions

The following can be copied into frontend `AGENTS.md`.

- This is a React + TypeScript + Vite frontend.
- Backend is a separate ASP.NET Core repository.
- Preserve current architecture and working flows.
- Keep strict TypeScript typing.
- Avoid `any` unless absolutely unavoidable and documented.
- Reuse existing components/services/types before adding duplicates.
- API calls belong in service modules/hooks according to existing structure.
- Do not place backend business logic in UI components.
- Use `VITE_API_BASE_URL`; do not hardcode localhost/production URLs.
- Preserve Buyer/Seller role context.
- Normal Find auth uses AuthModal; resume original action after auth.
- Use backend as source of truth for migrated entities.
- localStorage is temporary compatibility/mock state only.
- Do not remove existing features while fixing one UI issue.
- Keep responsive behavior.
- Keep accessible labels/buttons where practical.
- Keep Product/Service, verification and activity states separate.
- Do not expose raw GUID IDs.
- Do not reintroduce image max 5; current rule is 20.
- Run `npm run build` before completing a coding task.
- Fix all new TypeScript errors/warnings introduced by the change.
- Never replace current `Find.tsx` from an older copy.

---

# 50. Backend Repository Instructions

The following can be copied into backend `AGENTS.md`.

- This is ASP.NET Core 10 Web API.
- EF Core 10 + SQL Server.
- Frontend is a separate repository.
- Use async database/API methods.
- Keep controllers thin.
- Put business logic in services.
- Use DTOs for API contracts.
- Do not add repository pattern unless existing architecture uses/needs it.
- Enforce authorization by role and ownership.
- Enforce business rules on backend even when frontend validates.
- Keep PhoneVerified, SellerVerificationStatus and requirement verification separate.
- New requirement = `admin_review_required` + `active`.
- Public requirement = verified + active + not deleted.
- Verified/rejected edit returns to admin review.
- Delete is soft delete.
- Seller inquiry requires verified seller + verified phone.
- Credit deduction + inquiry creation must remain transactional.
- Reviews require completed MarketplaceDeal.
- Current requirement image max = 20.
- Validate extensions and size server-side.
- Keep secrets out of source.
- Use configuration/User Secrets/environment variables.
- Return appropriate HTTP status codes.
- Preserve global exception middleware behavior.
- Use EF migrations intentionally for schema changes.
- Do not introduce microservices without explicit architecture decision.
- Run `dotnet build` and tests before completing work.

---

# 51. Frontend/Backend Contract Rules

1. DTO names/types must match API contract.
2. Nullable fields must be handled intentionally.
3. Status values must be consistent strings between layers.
4. Frontend validation does not replace backend validation.
5. API errors should be displayable/useful to frontend.
6. Auth token handling must remain centralized.
7. Frontend must not assume API success.
8. Loading/error/success states should be explicit.
9. Do not infer image multipart field names; inspect controller DTO binding.
10. Friendly IDs and internal GUIDs have different purposes.
11. Backend returns authoritative:
    - verification state
    - wallet balance
    - inquiry state
    - requirement state
12. Avoid maintaining two competing authoritative stores for same entity.
13. When API integration replaces local data, migrate every dependent UI gradually and deliberately.
14. Keep enum/status mapping documented when backend uses strings.
15. If frontend types allow undefined but backend requires a value, normalize/validate before sending rather than relying on compiler casts.

---

# 52. Glossary

**Buyer**  
User who posts a product/service requirement and receives seller inquiries.

**Seller / Supplier**  
User/business that browses verified buyer requirements and may send paid inquiries.

**Requirement**  
Structured record describing what a buyer needs.

**Listing**  
Seller-side product/service offer. Listing UX was discussed; backend seller listing module is not confirmed implemented.

**Inquiry**  
Seller response/quotation sent against a buyer requirement.

**Verified Seller**  
Seller whose SellerVerificationStatus is verified. This does not automatically mean phone verified; both checks can apply.

**Verified Requirement**  
Buyer requirement approved by platform/admin/AI verification process. Use this wording on UI badge.

**Requirement Attributes / Fields**  
Dynamic key/label/value fields specific to category.

**Marketplace**  
Overall buyer/seller environment.

**Find**  
Main discovery page for searching/filtering requirements and opening requirement actions.

**OTP**  
One-time password used for account phone verification.

**Activity Status**  
Active or inactive; separate from verification.

**MarketplaceDeal**  
Completed marketplace transaction record connecting buyer, selected seller and accepted inquiry.

**Credit Wallet**  
Seller credit balance used to pay for inquiry creation.

---

# 53. Open Questions

Only genuinely unresolved items:

1. Final exact compact signup field set:
   - whether Name remains minimally required
   - or backend register contract changes
2. Real social login provider/configuration.
3. Real SMS provider for Pakistan.
4. Production object storage provider:
   - Azure Blob is current target, but alternative is possible.
5. Exact production hosting choice for backend if not Azure App Service.
6. Final credit purchase/payment gateway.
7. Whether fixed `InquiryCost` remains long term or dynamic/category percentage fees return later.
8. Exact seller listing backend scope.
9. Chat architecture and when real-time messaging enters MVP.
10. Notification delivery channels.
11. Contact detail reveal policy and exact stage.
12. Full-address vs area-only requirement privacy rules.
13. Trust Score formula and whether it is part of initial release.
14. Dispute workflow scope.
15. Exact initial launch categories vs all-category dynamic AI.
16. Whether Odoo integration is actually needed.
17. Which extra public filters should be server-side in MVP:
    - area
    - budget range
    - date posted
    - condition
    - brand/model
18. Exact final admin permissions beyond current role.
19. Exact production logging/monitoring stack.

---

# Context Maintenance Instructions

This file must stay synchronized with the project.

Whenever a meaningful feature is:
- completed,
- changed,
- rejected,
- replaced,
- newly planned,
- migrated from localStorage to backend,
- or changes a business rule/API contract,

update `PROJECT_CONTEXT.md`.

Maintenance rules:

1. Prefer the newest decision when old and new decisions conflict.
2. Preserve significant historical decisions briefly so regressions are understandable.
3. Mark status honestly:
   - ✅ Implemented
   - 🟡 Partially Implemented
   - 🔴 Pending
   - 🔵 Planned
   - ⚪ Needs Verification
4. Do not mark code “implemented” solely because a file was generated; distinguish:
   - code prepared
   - build passed
   - runtime tested
5. Keep API endpoints and DB entities synchronized with the current backend.
6. Keep frontend integration status synchronized with the actual React repo.
7. Update Known Bugs when a bug is fixed so Codex does not reintroduce it.
8. Update Immediate Next Steps after every major integration milestone.
9. Preserve the rule that frontend/backend are separate repositories.
10. This file should be read before every new Codex session.

