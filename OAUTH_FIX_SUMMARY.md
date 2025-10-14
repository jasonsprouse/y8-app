# OAuth Authentication Fix Summary

## Problem Statement
Users were experiencing an error "Missing authorization code" when attempting to authenticate via Google OAuth. The local storage was being set with authentication data, but the OAuth callback flow was failing.

## Root Cause
The OAuth callback pages were not properly handling the authorization code in the URL query parameters. Specifically:

1. **Google Callback Issue**: The callback page was manually checking for a `code` parameter using `useSearchParams`, but this approach wasn't compatible with how the Lit Protocol authentication library extracts the authorization code.

2. **AuthContext Issue**: The `loginWithGoogle()` and `loginWithDiscord()` functions were passing just the base redirect URI to the authentication methods, not the full URL with query parameters that contains the authorization code.

## Solution Implemented

### 1. Google Callback Page (`app/auth/callback/google/page.tsx`)
**Before:**
```typescript
const code = params.get('code');
if (!code) {
  setAuthError('Missing authorization code.');
  return;
}
```

**After:**
```typescript
// Check if this is a valid OAuth redirect
const redirectUri = window.location.href;

if (!isSignInRedirect(redirectUri)) {
  setAuthError('Invalid OAuth redirect');
  return;
}

const provider = getProviderFromUrl();
if (provider !== 'google') {
  setAuthError('Invalid provider');
  return;
}
```

**Changes:**
- Use `isSignInRedirect()` from `@lit-protocol/lit-auth-client` to validate OAuth redirect
- Use `getProviderFromUrl()` to verify the correct OAuth provider
- Remove manual query parameter parsing which was causing issues

### 2. AuthContext - Google Login (`context/AuthContext.tsx`)
**Before:**
```typescript
const redirectUri = `${window.location.origin}/auth/callback/google`;
const result = await authenticateWithGoogle(redirectUri);
```

**After:**
```typescript
const redirectUri = `${window.location.origin}/auth/callback/google`;

if (window.location.pathname !== '/auth/callback/google') {
  await signInWithGoogle(redirectUri);
  return;
}

// When on callback page, use the full URL with query params for authentication
const result = await authenticateWithGoogle(window.location.href);
```

**Changes:**
- Check if currently on the callback page
- If not on callback page, initiate OAuth redirect
- If on callback page, pass `window.location.href` (full URL with query params) to authentication method
- This allows Lit Protocol to extract the authorization code from the URL

### 3. AuthContext - Discord Login (Consistency Fix)
Applied the same pattern to Discord login for consistency:
```typescript
if (window.location.pathname !== '/auth/callback/discord') {
  await signInWithDiscord(redirectUri);
  return;
}

// When on callback page, use the full URL with query params for authentication
const result = await authenticateWithDiscord(window.location.href);
```

## How OAuth Flow Works Now

### Step 1: User Clicks "Continue with Google" on `/auth` page
- Calls `signInWithGoogle(redirectUri)` from `utils/lit.ts`
- Redirects to Google OAuth page

### Step 2: User Authorizes on Google
- Google redirects back to: `/auth/callback/google?code=abc123&state=xyz...`

### Step 3: Callback Page Loads
- Validates redirect using `isSignInRedirect(window.location.href)`
- Validates provider using `getProviderFromUrl()`
- Calls `loginWithGoogle()` from AuthContext

### Step 4: AuthContext Authenticates
- Detects it's on callback page (pathname check)
- Calls `authenticateWithGoogle(window.location.href)` with full URL
- Lit Protocol extracts and validates the authorization code
- Returns `AuthMethod` object

### Step 5: Complete Authentication
- Gets PKPs associated with the auth method
- Creates session signatures
- Stores auth data in localStorage
- Redirects to `/space`

## Key Technical Points

1. **Full URL Required**: The Lit Protocol authentication methods need the complete URL including query parameters to extract the OAuth authorization code.

2. **Validation Helpers**: Using `isSignInRedirect()` and `getProviderFromUrl()` is the recommended approach for OAuth callback validation with Lit Protocol.

3. **Pathname vs Full URL**: 
   - Use base redirect URI (e.g., `${origin}/auth/callback/google`) when initiating OAuth
   - Use full URL (`window.location.href`) when processing the callback

4. **Consistency**: Both Google and Discord OAuth follow the same pattern for maintainability.

## Validation
All existing validation tests pass (22/22):
```bash
node validate-auth.js
```

## Testing Recommendations

### Happy Path Testing
1. **Clear localStorage** before testing: `localStorage.clear()`
2. **Test OAuth Flow**: Click "Continue with Google" and complete OAuth
3. **Verify Auth State**: Check localStorage has `lit-auth-method`, `lit-pkp`, `lit-session-sigs`
4. **Verify Redirect**: Should redirect to `/space` after successful auth
5. **Test Session Persistence**: Refresh page, should remain authenticated

### Failure Scenario Testing
1. **Test Denied Authentication**: Cancel OAuth consent → Should show error, not crash
2. **Test Invalid Callback URL**: Navigate to callback URL without params → Should show appropriate error
3. **Test Invalid Provider**: Manually modify provider in URL → Should be caught by `getProviderFromUrl()` validation
4. **Test Network Failure**: Disconnect network during OAuth → Should handle gracefully with error message
5. **Test Expired Code**: Try to reuse an old callback URL → Should fail gracefully with error message

## Related Files
- `app/auth/callback/google/page.tsx` - Google OAuth callback handler
- `app/auth/callback/discord/page.tsx` - Discord OAuth callback handler  
- `context/AuthContext.tsx` - Authentication context with login methods
- `utils/lit.ts` - Lit Protocol integration utilities
- `components/RouteGuard.tsx` - Route protection component

## References
- [Lit Protocol Documentation](https://developer.litprotocol.com/)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)
