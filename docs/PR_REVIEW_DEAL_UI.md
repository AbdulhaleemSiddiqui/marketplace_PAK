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

Requires backend `feature/deal-completion` APIs and its applied database migration. This PR does not include complaint/admin-trust UI, image storage or deployment.
