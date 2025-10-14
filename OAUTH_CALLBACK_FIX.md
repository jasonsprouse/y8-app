# OAuth Callback Account Creation Fix

## Issue
When users authenticate via Google or Discord OAuth but don't have any PKPs (Programmable Key Pairs), they need to create an account. However, the callback page was getting stuck in a loading state instead of redirecting to the account creation flow.

## Root Cause
The authentication flow had a logic gap:
1. User completes OAuth successfully
2. `loginWithGoogle()` authenticates and fetches PKPs
3. When PKPs array is empty, the code sets `needsToCreateAccount = true` and returns early
4. `isAuthenticated` remains `false` because `updateSession()` is never called (only called when PKPs exist)
5. The callback page's useEffect only checked `isAuthenticated` to trigger redirect
6. **Result**: User stays on callback page showing loading spinner indefinitely

## Solution
Added a second redirect condition to the OAuth callback pages that checks for the `needsToCreateAccount` state flag. When this flag is set and processing is complete, the callback page redirects to the home page (`/`) where the account creation UI is displayed.

## Technical Changes

### Files Modified
1. `app/auth/callback/google/page.tsx`
2. `app/auth/callback/discord/page.tsx`
3. `validate-auth.js` (added tests)

### Code Changes
**Before:**
```typescript
useEffect(() => {
  if (isAuthenticated) {
    router.push('/space');
  }
}, [isAuthenticated, router]);
```

**After:**
```typescript
useEffect(() => {
  if (isAuthenticated) {
    router.push('/space');
  } else if (needsToCreateAccount && !isProcessing) {
    // Redirect to home page to show create account flow
    router.push('/');
  }
}, [isAuthenticated, needsToCreateAccount, isProcessing, router]);
```

## User Flow After Fix
1. User clicks "Continue with Google" on auth page
2. User authorizes on Google's OAuth page
3. Google redirects back to `/auth/callback/google?code=...`
4. Callback page calls `loginWithGoogle()`
5. `loginWithGoogle()` authenticates and fetches PKPs
6. **If PKPs found**: Updates session and redirects to `/space`
7. **If no PKPs found**: 
   - Sets `needsToCreateAccount = true`
   - Callback page detects this flag
   - Redirects to home page (`/`)
   - Home page shows `CreateAccount` component
   - User can proceed with account creation

## Testing
- ✅ TypeScript compilation passes
- ✅ JavaScript syntax validation passes
- ✅ All 24 validation tests pass
- ✅ New tests added for redirect behavior

## Related Context
- The `needsToCreateAccount` state already existed in `AuthContext.tsx`
- The `AuthLogin` component on the home page already handles this flag
- This fix simply connects the callback redirect logic to the existing account creation flow

## Impact
This fix ensures users who authenticate via OAuth but don't have PKPs yet are properly redirected to the account creation flow instead of getting stuck on the callback page.
