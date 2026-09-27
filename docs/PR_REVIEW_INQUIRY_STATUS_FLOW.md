# Inquiry Status Flow Review

Date: 2026-09-27

## Existing behavior preserved
- Seller sends one inquiry per requirement.
- Seller verification and phone verification are required.
- Requirement must be verified and active.
- Inquiry starts as `sent`.
- Inquiry credit deduction remains inside the existing send transaction.
- Buyer ownership is checked by the backend before viewed/accept/reject changes.
- Accepted inquiries cannot be rejected; rejected inquiries cannot be accepted.

## Fixes in this branch
- Buyer profile now calls the existing Viewed endpoint when a newly received `sent` inquiry is rendered.
- Accept/Reject remain available for both `sent` and `viewed` states.
- Viewed request updates local inquiry state with the backend response.
- Viewed/Accept/Reject frontend API methods now use the actual `SellerInquiry` response instead of incorrectly declaring `void`.
- Frontend inquiry type now includes optional `viewedAt` and `respondedAt` timestamps returned by the backend.
- Viewed marking failure does not remove the buyer's ability to accept/reject the inquiry.

## Expected flow
1. Seller sends inquiry -> `sent`; credits deducted once.
2. Buyer profile receives/renders it -> `viewed`.
3. Buyer can still Accept or Reject.
4. Accept -> `accepted`; seller profile reads the new status and Accepted count increases.
5. Reject -> `rejected`; seller profile reads the new status.
6. Repeated Accept/Reject is protected by existing backend state rules.

## Deliberately not changed
- No wallet/deduction code was rewritten.
- No database migration.
- No completed-state transition added; that belongs with the deal/completion workflow.
- Buyer inquiry N+1 loading was not refactored in this focused bug fix.

## Smoke test
- Send an inquiry as a verified seller and confirm one deduction only.
- Open buyer Profile and confirm status becomes Viewed while Accept/Reject remain visible.
- Accept one inquiry and verify seller profile shows Accepted and accepted count changes.
- Reject another inquiry and verify seller profile shows Rejected.
- Refresh both profiles and confirm statuses persist.


## Seller UX follow-up
- Find loads the signed-in seller's inquiry history once and disables already-contacted requirement cards as `Inquiry Sent`.
- Backend duplicate-inquiry protection remains the source-of-truth safety net.
- Send Offer modal is compact/responsive and uses a formatted PKR offer field.
- Seller Profile removes the redundant Find Buyer Requirements CTA.
- Sent Inquiries and Credit Transactions are presented as two simple tabs.
- Each seller history tab uses client-side pagination at 5 rows per page.
- No fake Buy Credits/payment flow was introduced. Low balance directs the seller to support while admin credit management remains the current mechanism.
