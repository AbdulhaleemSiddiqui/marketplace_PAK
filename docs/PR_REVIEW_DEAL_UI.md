# Buyer and seller deal UI

Accepted offers now show requirement title/reference, PKR offer price and deal progress. The buyer requests completion, the seller confirms, and each participant can review the completed deal using a star-rating form. Cancellation uses a required reason form and displays the saved reason.

Completion, cancellation and reviews reuse the existing API services. Dialogs prevent duplicate submission, preserve fields when a request fails, show errors inline and support keyboard focus/Escape. Deal state is matched to its inquiry ID, so another offer on the same requirement does not inherit its actions. Reviewed seller deals are excluded from Active; buyer reviewed deals also have a separate history tab.

## Validation
- `npm run build`: passed (TypeScript and Vite).
- Targeted oxlint on changed source files: passed.
- DOM checks passed: rating validation/payload, failed-review retry, duplicate-submit protection, busy Escape guard, required cancellation reason, focus and scroll restoration.
- Browser visual checks could not run because the headless Chromium download failed. No live backend end-to-end test was performed.

## Before release
1. Buyer accepts an offer and requests completion; seller sees Waiting for seller confirmation.
2. Seller confirms; requirement moves to History without Edit and both participants can review.
3. Both parties submit reviews; reviewed cards move into their history without appearing in Active.
4. Cancel a pending deal with a reason; verify saved reason and no completed/review actions.
5. Check multiple offers for one requirement: only the selected inquiry receives the deal state.
6. Check mobile cards, dialogs, keyboard navigation and refresh persistence against the real API.

Requires backend `feature/deal-completion` APIs and its applied database migration. Image storage and deployment remain separate work.

## Complaints and account moderation

Both deal participants can report the other participant with a category and required details. Reports use the matching deal ID and other participant user ID. Admin Complaints supports pending, warning-issued, dismissed and all filters, with required review notes for warning/dismiss decisions. Blocked Users lists warning counts and allows confirmed unblocking while retaining warnings. User reporting uses user authentication; moderation uses the separate admin session. Failed submissions retain their form and show an inline error.

Additional DOM checks passed for report category/details validation, admin note validation and unblock confirmation. Targeted lint and production build passed. Live API and browser visual checks remain required.

Before release, report from buyer and seller accounts, check the admin pending list, dismiss one complaint and warn another, confirm the third warning blocks the target, then unblock and verify warnings remain. Check filters, failed-request retry, refresh persistence and mobile layout. Requires the backend trust endpoints from backend PR #2.
