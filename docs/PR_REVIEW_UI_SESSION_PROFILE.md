# PR Review — Profile UI, Price Range, Session and User Name

Date: 2026-09-27  
Branch: `fix/ui-session-profile-v2`

## Why v2 exists

The original UI fix PR #2 was created before AI Requirement Phase 1 was merged. After the AI merge, the old branch diverged from `main` and touched `AiRequirementComposer.tsx`. Merging it directly risked conflicting with or reverting the new AI integration.

PR #2 was therefore closed without merging. These fixes were recreated from the latest `main`.

## Reviewed requirements

### Profile header
- Removed the top-level Find button from the Profile header.
- Logo/home navigation and Logout remain available.
- Existing per-requirement `View Public Post` remains unchanged.

### Price filters
- Added numeric Min Price and Max Price inputs.
- Numeric inputs and range sliders use the same state.
- Editing either input updates the slider.
- Moving either slider updates the numeric values.
- Min cannot exceed Max.
- Max cannot go below Min.
- Existing maximum remains PKR 50 Cr.

### Add Requirement budget
- Added the same Min Price / Max Price numeric inputs to the generated requirement Budget field.
- Inputs and slider remain synchronized.
- Existing serialized budget format remains compatible with requirement creation parsing.
- AI generation/loading/error props from Phase 1 are preserved.

### Session management
- A cached profile without an access token is no longer treated as an authenticated session.
- On application startup, a persisted token is validated with `GET /api/auth/me`.
- Invalid/expired tokens clear both token and cached user.
- Valid tokens intentionally remain signed in after refresh/restart; this is normal persistent-session behavior.
- API 401 clears the token, and subsequent `getCurrentUser()` clears stale cached user state.

### User name
- New email and phone registrations now require Full Name in both the Register page and Auth modal.
- The real entered name is sent to the existing backend `RegisterRequest.Name`.
- Profile already renders `user.name`, so new users display their actual saved name.
- Existing accounts whose database Name is already `KhojMarket User` are not silently renamed; their real name cannot be inferred safely.

## Additional review fix

Backend registration requires an 8-character password, while the frontend previously checked 6. Both registration UIs now validate 8 characters so the client and API agree.

## Manual smoke test checklist

1. Open Profile and confirm the header has no Find button.
2. Filter: type Min=10000 and Max=20000; confirm slider thumbs move to the same values.
3. Move the filter sliders; confirm numeric inputs update.
4. Open Add Requirement and generate a requirement containing Budget.
5. Type Min=10000 and Max=20000; confirm its budget slider synchronizes.
6. Login, refresh/restart frontend while API is available; a valid token should remain logged in and operations should work.
7. Expire/remove the token and restart; the stale user must not remain authenticated.
8. Register a new buyer/seller with a real full name; Profile must display that name.
9. Verify password shorter than 8 characters is blocked before the API request.
10. Re-test AI Generate to ensure the UI fix did not revert Phase 1 AI changes.

## Known follow-up

Existing legacy users named `KhojMarket User` need an explicit profile-name edit feature or a controlled data correction. This branch does not guess or overwrite existing names.

## Review decision

The original PR #2 must not be merged. The v2 branch is the reviewed replacement based on the latest main.
