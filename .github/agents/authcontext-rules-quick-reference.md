# authContext Rules - Quick Reference

> **Purpose**: Quick reference for developers to ensure code changes conform to authContext patterns

## 🔐 Authentication State - Rules

### ✅ DO

```typescript
// Use authContext hook
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { isAuthenticated, isLoading, loginWithGoogle } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!isAuthenticated) return <Login />;
  
  return <ProtectedContent />;
}
```

### ❌ DON'T

```typescript
// Custom auth state - WRONG
const [isLoggedIn, setIsLoggedIn] = useState(false);

// Direct localStorage manipulation - WRONG
localStorage.setItem('user-auth', 'true');

// Alternative auth context - WRONG
const MyAuthContext = createContext({});
```

---

## 🛣️ Route Protection - Rules

### ✅ DO

```typescript
// Use RouteGuard component
import RouteGuard from '@/components/RouteGuard';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <RouteGuard>{children}</RouteGuard>
    </AuthProvider>
  );
}

// Check auth in protected pages
function ProtectedPage() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null; // RouteGuard handles redirect
  return <SecretContent />;
}
```

### ❌ DON'T

```typescript
// Hardcoded auth paths - WRONG
const authPaths = ['/auth/callback/google', '/auth/callback/discord'];

// No auth check on protected content - WRONG
function ProtectedPage() {
  return <SecretContent />; // Anyone can access!
}

// Custom route guard - WRONG
if (!localStorage.getItem('auth')) {
  window.location.href = '/';
}
```

---

## 🔄 Redirect Logic - Rules

### ✅ DO

```typescript
// OAuth callback - let callback page handle redirect
async function handleOAuthCallback() {
  const isCallbackPage = pathname.startsWith('/auth/callback');
  
  if (!isCallbackPage) {
    // Initiate OAuth flow
    await signInWithGoogle(redirectUri);
    return;
  }
  
  // On callback page
  const authMethod = await authenticateWithGoogle(window.location.href);
  const pkps = await getPKPs(authMethod);
  
  if (pkps.length === 1) {
    await updateSession(pkps[0], authMethod, false); // Don't redirect from AuthContext
    router.push('/space'); // Callback page redirects
  }
}

// Non-OAuth login - redirect from AuthContext
async function handleLogin() {
  const authMethod = await authenticateWithWebAuthn();
  const pkps = await getPKPs(authMethod);
  
  if (pkps.length === 1) {
    await updateSession(pkps[0], authMethod, true); // AuthContext redirects
  }
}
```

### ❌ DON'T

```typescript
// Double redirect - WRONG
await updateSession(pkps[0], authMethod, true); // AuthContext redirects
router.push('/space'); // Callback page also redirects - LOOP!

// No redirect after login - WRONG (poor UX)
await updateSession(pkps[0], authMethod, false);
// User stays on login page

// Redirect to arbitrary URL - WRONG
router.push(req.query.redirect); // Open redirect vulnerability!
```

---

## 💾 localStorage - Rules

### ✅ DO

```typescript
// Use exact key names
localStorage.setItem('lit-auth-method', JSON.stringify(authMethod));
localStorage.setItem('lit-pkp', JSON.stringify(pkp));
localStorage.setItem('lit-session-sigs', JSON.stringify(sessionSigs));

// Load on initialization
const storedAuthMethod = localStorage.getItem('lit-auth-method');
if (storedAuthMethod) {
  setAuthMethod(JSON.parse(storedAuthMethod));
}

// Clear on logout
localStorage.removeItem('lit-auth-method');
localStorage.removeItem('lit-pkp');
localStorage.removeItem('lit-session-sigs');
```

### ❌ DON'T

```typescript
// Different key names - WRONG
localStorage.setItem('auth-method', JSON.stringify(authMethod));
localStorage.setItem('user-pkp', JSON.stringify(pkp));

// Alternative storage - WRONG
sessionStorage.setItem('lit-auth-method', ...);
document.cookie = 'lit-pkp=' + JSON.stringify(pkp);

// Partial cleanup - WRONG
localStorage.removeItem('lit-auth-method');
// Forgot to remove 'lit-pkp' and 'lit-session-sigs'
```

---

## 🔑 Authentication Methods - Rules

### ✅ DO

```typescript
// Use approved methods from authContext
const {
  loginWithGoogle,
  loginWithDiscord,
  loginWithWebAuthn,
  loginWithEthWallet,
  loginWithStytchOtp
} = useAuth();

// Call appropriate method
await loginWithGoogle();

// Add new methods to AuthContext
export function AuthProvider({ children }) {
  // ...
  const loginWithNewProvider = useCallback(async () => {
    const authMethod = await authenticateWithNewProvider();
    const pkps = await getPKPs(authMethod);
    if (pkps.length === 1) {
      await updateSession(pkps[0], authMethod, true);
    }
  }, [updateSession]);
  
  return (
    <AuthContext.Provider value={{
      loginWithNewProvider, // Expose in context
      // ...
    }}>
  );
}
```

### ❌ DON'T

```typescript
// Custom auth function outside context - WRONG
async function myCustomLogin() {
  const user = await fetch('/api/login');
  localStorage.setItem('my-user', JSON.stringify(user));
  setUser(user);
}

// Bypass authContext - WRONG
const pkp = await mintPKP(authMethod);
localStorage.setItem('lit-pkp', JSON.stringify(pkp));
router.push('/space');
// Missing: session sigs, state updates, proper flow

// Mix auth methods - WRONG
const googleAuth = await authenticateWithGoogle();
const ethAuth = await authenticateWithEthWallet();
await updateSession(pkp, googleAuth); // Inconsistent!
```

---

## 🎯 Public vs Protected Routes

### Public Routes (No Auth Required)
- ✅ `/` - Landing/login page
- ✅ `/auth/*` - All auth-related pages and callbacks

### Protected Routes (Auth Required)
- ✅ `/space/*` - Space services
- ✅ `/food` - Food services
- ✅ `/energy` - Energy services
- ✅ `/health` - Health services
- ✅ All other routes

### Route Checking

```typescript
// ✅ CORRECT - Dynamic auth path matching
const isPublicOrAuthPath = (pathname: string): boolean => {
  if (pathname === '/') return true;
  if (pathname.startsWith('/auth')) return true;
  return false;
};

// ❌ WRONG - Hardcoded paths
const publicPaths = ['/', '/auth', '/auth/callback/google', '/auth/callback/discord'];
const isPublic = publicPaths.includes(pathname); // Breaks with query params!
```

---

## 🔐 Session Management - Rules

### ✅ DO

```typescript
// Create session with all required data
const updateSession = async (pkp, authMethod, shouldRedirect) => {
  const sessionSigs = await getSessionSigs({
    pkpPublicKey: pkp.publicKey,
    authMethod: authMethod,
    sessionSigsParams: { /* ... */ }
  });
  
  // Update all state
  setPKPState(pkp);
  setAuthMethod(authMethod);
  setSessionSigsState(sessionSigs);
  setIsAuthenticated(true);
  
  // Save to localStorage
  localStorage.setItem('lit-auth-method', JSON.stringify(authMethod));
  localStorage.setItem('lit-pkp', JSON.stringify(pkp));
  localStorage.setItem('lit-session-sigs', JSON.stringify(sessionSigs));
  
  // Redirect if needed
  if (shouldRedirect) {
    router.push('/space');
  }
};

// Logout properly
const logOut = () => {
  // Clear all state
  setIsAuthenticated(false);
  setAuthMethod(null);
  setPKPState(null);
  setSessionSigsState(null);
  
  // Clear localStorage
  localStorage.removeItem('lit-auth-method');
  localStorage.removeItem('lit-pkp');
  localStorage.removeItem('lit-session-sigs');
  
  // Redirect
  router.push('/');
};
```

### ❌ DON'T

```typescript
// Incomplete session creation - WRONG
localStorage.setItem('lit-pkp', JSON.stringify(pkp));
// Missing: auth method, session sigs, state updates

// Partial logout - WRONG
localStorage.removeItem('lit-auth-method');
setIsAuthenticated(false);
// Missing: clear pkp, session sigs, other state

// No redirect after logout - WRONG (poor UX)
logOut(); // User stays on protected page
```

---

## 🎛️ Multiple PKP Handling - Rules

### ✅ DO

```typescript
// Handle multiple PKPs
const pkps = await getPKPs(authMethod);

if (!pkps || pkps.length === 0) {
  // No PKPs - mint new one
  const newPkp = await mintPKP(authMethod);
  await updateSession(newPkp, authMethod, true);
} else if (pkps.length === 1) {
  // Single PKP - auto-select
  await updateSession(pkps[0], authMethod, true);
} else {
  // Multiple PKPs - user must choose
  setAvailablePkps(pkps);
  setCurrentAuthMethodForPkpSelection(authMethod);
  setPendingPkpSelection(true);
}

// PKP selection
const setPKP = async (selectedPkp) => {
  if (!currentAuthMethodForPkpSelection) {
    setError(new Error('No auth method available'));
    return;
  }
  await updateSession(selectedPkp, currentAuthMethodForPkpSelection, true);
};
```

### ❌ DON'T

```typescript
// Always use first PKP - WRONG
const pkps = await getPKPs(authMethod);
await updateSession(pkps[0], authMethod, true); // What if pkps is empty?

// No handling for empty PKPs - WRONG
const pkps = await getPKPs(authMethod);
if (pkps.length > 0) {
  await updateSession(pkps[0], authMethod, true);
}
// User stuck if they have no PKPs!

// Forget auth method during selection - WRONG
setAvailablePkps(pkps);
setPendingPkpSelection(true);
// Missing: currentAuthMethodForPkpSelection
```

---

## 🚨 Common Security Violations

### 1. Authentication Bypass
```typescript
// ❌ WRONG
if (typeof window !== 'undefined') {
  localStorage.setItem('lit-pkp', JSON.stringify(fakePKP));
}
// Attacker can bypass auth!

// ✅ CORRECT
await loginWithGoogle(); // Proper OAuth flow
```

### 2. Hardcoded Credentials
```typescript
// ❌ WRONG
const API_KEY = 'sk-1234567890abcdef';
const PRIVATE_KEY = '0x123abc...';

// ✅ CORRECT
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
// Still keep secrets server-side when possible!
```

### 3. Data Exposure
```typescript
// ❌ WRONG
console.log('Auth Method:', authMethod);
console.log('Session Sigs:', sessionSigs);

// ✅ CORRECT
if (process.env.NODE_ENV === 'development') {
  console.log('Auth Method Type:', authMethod?.authMethodType);
}
```

### 4. Open Redirects
```typescript
// ❌ WRONG
const returnUrl = req.query.redirect;
router.push(returnUrl); // Attacker can redirect anywhere!

// ✅ CORRECT
const returnUrl = req.query.redirect;
if (returnUrl && returnUrl.startsWith('/')) {
  router.push(returnUrl); // Only internal redirects
} else {
  router.push('/space'); // Default safe redirect
}
```

---

## 📋 Pre-Commit Checklist

Before submitting a PR that touches authentication:

- [ ] Used `useAuth()` hook for all auth operations
- [ ] No direct localStorage manipulation for auth data
- [ ] Protected routes check `isAuthenticated`
- [ ] Public routes use `pathname.startsWith('/auth')` for dynamic matching
- [ ] Redirect logic follows OAuth vs non-OAuth patterns
- [ ] New auth methods added to AuthContext (not standalone)
- [ ] No hardcoded credentials or API keys
- [ ] No sensitive data in console.logs
- [ ] Proper error handling for auth failures
- [ ] localStorage keys match: `lit-auth-method`, `lit-pkp`, `lit-session-sigs`
- [ ] Logout clears ALL auth state and redirects
- [ ] Multiple PKP scenarios handled (0, 1, multiple)

---

## 🔍 Quick Validation

Run these checks before committing:

```bash
# Check for direct localStorage writes (should only be in AuthContext)
grep -r "localStorage.setItem.*lit-" --include="*.tsx" --include="*.ts" --exclude="AuthContext.tsx"

# Check for hardcoded auth paths
grep -r "auth/callback/google\|auth/callback/discord" --include="*.tsx" --include="*.ts"

# Check for console.log of sensitive data
grep -r "console.log.*authMethod\|console.log.*sessionSigs\|console.log.*pkp" --include="*.tsx" --include="*.ts"

# Verify no hardcoded credentials
grep -r "sk-\|0x[a-fA-F0-9]\{64\}" --include="*.tsx" --include="*.ts" --include="*.env"
```

---

## 📚 Related Documentation

- **AuthContext Implementation**: `/context/AuthContext.tsx`
- **Authentication Guide**: `/AUTH_README.md`
- **Route Guard**: `/components/RouteGuard.tsx`
- **Auth Fixes Summary**: `/AUTH_FIXES_SUMMARY.md`
- **PR Review Agent**: `/.github/agents/pr-review-agent.md`

---

**Last Updated**: 2025-10-18
**Applies To**: All code changes touching authentication, routing, or session management
