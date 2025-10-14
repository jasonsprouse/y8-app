# Testing Guide for Login Logic and Route Guard

This document outlines how to manually test the authentication and route guard functionality.

## Authentication Flow Testing

### 1. Initial Load
- **Expected**: User should see the login page at `/` if not authenticated
- **Test**: Open the application in a browser and verify AuthLogin component is rendered

### 2. Login Methods
The application supports multiple authentication methods:
- Google OAuth
- Discord OAuth
- WebAuthn
- Ethereum Wallet
- Stytch OTP (Email/Phone)

### 3. Route Guard Testing

#### Public Routes (No Authentication Required)
- `/` - Landing page with login
- `/auth` - Auth page
- `/auth/callback/google` - Google OAuth callback
- `/auth/callback/discord` - Discord OAuth callback

#### Protected Routes (Authentication Required)
- `/space` - Space services page
- `/space/sunshade` - Space sunshade NFT minter
- All other routes not listed as public

### 4. Test Scenarios

#### Scenario 1: Unauthenticated User Access
1. Clear localStorage
2. Try to access `/space` directly
3. **Expected**: User should be redirected to `/`

#### Scenario 2: Successful Login
1. Start at `/`
2. Click a login method
3. Complete authentication flow
4. **Expected**: 
   - Auth state stored in localStorage
   - isAuthenticated set to true
   - User can access protected routes

#### Scenario 3: Session Persistence
1. Login successfully
2. Refresh the page
3. **Expected**: User remains logged in (localStorage loaded)

#### Scenario 4: Logout
1. Login successfully
2. Click logout
3. **Expected**:
   - localStorage cleared
   - Redirected to `/`
   - Cannot access protected routes

#### Scenario 5: Multiple PKPs
1. Login with an auth method that has multiple PKPs
2. **Expected**: User sees account selection screen
3. Select a PKP
4. **Expected**: Session updated with selected PKP

## Implementation Details

### Authentication State
The AuthContext manages:
- `isAuthenticated`: boolean
- `isLoading`: boolean
- `authMethod`: AuthMethod | null
- `pkp`: IRelayPKP | null
- `sessionSigs`: SessionSigs | null
- `error`: Error | null

### localStorage Keys
- `lit-auth-method`: Stored auth method
- `lit-pkp`: Stored PKP data
- `lit-session-sigs`: Stored session signatures

### Route Guard Logic
1. Checks if current path is public or auth path
2. If public/auth path, always renders children
3. If protected path and not authenticated, shows loading then redirects to `/`
4. If protected path and authenticated, renders children
5. Shows loading spinner while checking auth state

## Known Issues to Check

1. **Race Conditions**: Ensure auth state loads before RouteGuard makes decisions
2. **Callback Loops**: OAuth callbacks should not cause infinite loops
3. **Session Expiry**: Check if expired sessions are handled gracefully
4. **Error Handling**: Ensure errors are displayed to users appropriately
5. **Multiple Authentication Attempts**: Prevent duplicate auth calls
