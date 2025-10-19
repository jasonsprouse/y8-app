# AI Agent PR Review - Validation Guide

This document provides test cases and examples to validate the AI Agent PR Review Prompt.

## Purpose

Ensure the AI agent correctly identifies:
1. ✅ authContext rule violations
2. ✅ Security vulnerabilities
3. ✅ Anti-patterns and code quality issues

## Test Cases

### Test Case 1: Authentication Bypass

**Mock PR Diff:**
```diff
+ // File: components/SecretPage.tsx
+ export default function SecretPage() {
+   const [isLoggedIn, setIsLoggedIn] = useState(false);
+   
+   useEffect(() => {
+     const authData = localStorage.getItem('user-auth');
+     setIsLoggedIn(!!authData);
+   }, []);
+   
+   if (!isLoggedIn) return null;
+   
+   return <div>Secret Content</div>;
+ }
```

**Expected AI Review:**
- ❌ **CRITICAL** - authContext Conformance Violation
- Issue: Custom auth state instead of `useAuth()` hook
- Issue: Direct localStorage read outside authContext
- Recommendation: Use `const { isAuthenticated } = useAuth()`

---

### Test Case 2: Hardcoded Credentials

**Mock PR Diff:**
```diff
+ // File: utils/api.ts
+ const API_KEY = 'sk-1234567890abcdefghijklmnop';
+ 
+ export async function callAPI() {
+   return fetch('https://api.example.com', {
+     headers: { 'Authorization': `Bearer ${API_KEY}` }
+   });
+ }
```

**Expected AI Review:**
- ❌ **CRITICAL** - Security Vulnerability
- Issue: Hardcoded API key in source code
- Impact: API key exposed in version control
- Recommendation: Use environment variables (`process.env.API_KEY`)

---

### Test Case 3: Hardcoded Auth Paths

**Mock PR Diff:**
```diff
+ // File: components/MyRouteGuard.tsx
+ const authPaths = [
+   '/auth',
+   '/auth/callback/google',
+   '/auth/callback/discord'
+ ];
+ 
+ const isAuthPath = authPaths.includes(pathname);
```

**Expected AI Review:**
- ⚠️ **WARNING** - authContext Conformance Issue
- Issue: Hardcoded auth callback paths
- Impact: Breaks with query parameters, not scalable
- Recommendation: Use `pathname.startsWith('/auth')`

---

### Test Case 4: Direct localStorage Manipulation

**Mock PR Diff:**
```diff
+ // File: components/LoginButton.tsx
+ async function handleLogin() {
+   const user = await authenticateUser();
+   localStorage.setItem('lit-pkp', JSON.stringify(user.pkp));
+   localStorage.setItem('user-authenticated', 'true');
+   router.push('/space');
+ }
```

**Expected AI Review:**
- ❌ **CRITICAL** - authContext Conformance Violation
- Issue: Direct localStorage manipulation outside authContext
- Issue: Incomplete session setup (missing auth method, session sigs)
- Issue: Unauthorized localStorage key (`user-authenticated`)
- Recommendation: Use `loginWithGoogle()` or appropriate authContext method

---

### Test Case 5: Missing Authentication Check

**Mock PR Diff:**
```diff
+ // File: app/admin/page.tsx
+ export default function AdminPage() {
+   const [users, setUsers] = useState([]);
+   
+   useEffect(() => {
+     fetch('/api/admin/users')
+       .then(res => res.json())
+       .then(setUsers);
+   }, []);
+   
+   return (
+     <div>
+       <h1>Admin Panel</h1>
+       {users.map(user => <div key={user.id}>{user.email}</div>)}
+     </div>
+   );
+ }
```

**Expected AI Review:**
- ❌ **CRITICAL** - Security Vulnerability
- Issue: Protected admin page without authentication check
- Impact: Unauthorized users can access admin panel
- Recommendation: Add `const { isAuthenticated } = useAuth()` and check before rendering

---

### Test Case 6: XSS Vulnerability

**Mock PR Diff:**
```diff
+ // File: components/UserProfile.tsx
+ export function UserProfile({ username }) {
+   return (
+     <div dangerouslySetInnerHTML={{ __html: username }} />
+   );
+ }
```

**Expected AI Review:**
- ❌ **CRITICAL** - Security Vulnerability (XSS)
- Issue: Unsanitized user input rendered with `dangerouslySetInnerHTML`
- Impact: Cross-site scripting attack vector
- Recommendation: Sanitize input or use safe rendering: `<div>{username}</div>`

---

### Test Case 7: Open Redirect

**Mock PR Diff:**
```diff
+ // File: components/OAuth.tsx
+ useEffect(() => {
+   if (isAuthenticated) {
+     const returnUrl = new URLSearchParams(window.location.search).get('redirect');
+     router.push(returnUrl || '/space');
+   }
+ }, [isAuthenticated]);
```

**Expected AI Review:**
- ❌ **CRITICAL** - Security Vulnerability
- Issue: Open redirect vulnerability
- Impact: Attacker can redirect users to malicious sites
- Recommendation: Validate redirect URL is internal: `if (returnUrl?.startsWith('/')) { ... }`

---

### Test Case 8: Sensitive Data in Logs

**Mock PR Diff:**
```diff
+ // File: context/AuthContext.tsx
+ const loginWithGoogle = async () => {
+   const authMethod = await authenticateWithGoogle(window.location.href);
+   console.log('Auth Method:', authMethod);
+   console.log('Session Sigs:', sessionSigs);
+   await updateSession(pkp, authMethod, true);
+ };
```

**Expected AI Review:**
- ⚠️ **WARNING** - Security Issue
- Issue: Logging sensitive authentication data
- Impact: Sensitive data exposed in browser console / logs
- Recommendation: Remove console.logs or use debug mode only

---

### Test Case 9: React Hook Misuse

**Mock PR Diff:**
```diff
+ // File: components/LoginForm.tsx
+ export function LoginForm() {
+   const [method, setMethod] = useState('google');
+   
+   if (method === 'google') {
+     const { loginWithGoogle } = useAuth(); // Hook in conditional!
+   }
+   
+   return <button onClick={loginWithGoogle}>Login</button>;
+ }
```

**Expected AI Review:**
- ⚠️ **WARNING** - React Anti-Pattern
- Issue: Hook called conditionally
- Impact: Violates Rules of Hooks, causes runtime errors
- Recommendation: Call hooks at top level unconditionally

---

### Test Case 10: Correct Implementation ✅

**Mock PR Diff:**
```diff
+ // File: app/dashboard/page.tsx
+ 'use client';
+ 
+ import { useAuth } from '@/context/AuthContext';
+ 
+ export default function DashboardPage() {
+   const { isAuthenticated, isLoading } = useAuth();
+   
+   if (isLoading) return <div>Loading...</div>;
+   if (!isAuthenticated) return null; // RouteGuard will redirect
+   
+   return (
+     <div>
+       <h1>Dashboard</h1>
+       <p>Protected content</p>
+     </div>
+   );
+ }
```

**Expected AI Review:**
- ✅ **APPROVED** - No issues found
- Correctly uses `useAuth()` hook
- Properly checks authentication before rendering
- Follows authContext patterns
- No security vulnerabilities

---

### Test Case 11: Secure New Feature ✅

**Mock PR Diff:**
```diff
+ // File: context/AuthContext.tsx
+ // Add new authentication method to AuthContext
+ const loginWithTwitter = useCallback(async () => {
+   try {
+     setIsLoading(true);
+     setError(null);
+     
+     const redirectUri = `${window.location.origin}/auth/callback/twitter`;
+     const isCallbackPage = pathname.startsWith('/auth/callback');
+     
+     if (!isCallbackPage) {
+       await signInWithTwitter(redirectUri);
+       return;
+     }
+     
+     const result = await authenticateWithTwitter(window.location.href);
+     const pkps = await getPKPs(result);
+     
+     if (!pkps || pkps.length === 0) {
+       const newPkp = await mintPKP(result);
+       await updateSession(newPkp, result, true);
+     } else if (pkps.length === 1) {
+       await updateSession(pkps[0], result, true);
+     } else {
+       setAvailablePkps(pkps);
+       setCurrentAuthMethodForPkpSelection(result);
+       setPendingPkpSelection(true);
+       setIsLoading(false);
+     }
+   } catch (err) {
+     console.error('Error logging in with Twitter:', err);
+     setError(err instanceof Error ? err : new Error(String(err)));
+     setIsLoading(false);
+   }
+ }, [updateSession, pathname]);
```

**Expected AI Review:**
- ✅ **APPROVED** - Well implemented
- Follows authContext pattern for new OAuth provider
- Properly handles callback detection
- Handles multiple PKP scenarios (0, 1, multiple)
- Includes error handling
- Uses `updateSession()` correctly
- ℹ️ Info: Don't forget to expose `loginWithTwitter` in context provider value

---

## Validation Checklist

Use this checklist to verify AI agent is working correctly:

### authContext Conformance Detection

- [ ] Detects custom auth state instead of `useAuth()`
- [ ] Identifies direct localStorage manipulation
- [ ] Flags hardcoded auth callback paths
- [ ] Catches missing authentication checks on protected routes
- [ ] Recognizes incorrect redirect logic
- [ ] Validates new auth methods are added to AuthContext

### Security Vulnerability Detection

- [ ] Identifies hardcoded credentials
- [ ] Detects authentication bypass
- [ ] Finds XSS vulnerabilities
- [ ] Catches open redirect issues
- [ ] Flags sensitive data in logs
- [ ] Identifies missing input validation
- [ ] Detects insecure session handling

### Anti-Pattern Detection

- [ ] Identifies code duplication
- [ ] Flags React hooks misuse
- [ ] Detects excessive use of `any` type
- [ ] Finds missing error handling
- [ ] Identifies performance issues

### Review Quality

- [ ] Provides clear severity levels (CRITICAL/WARNING/INFO)
- [ ] Includes file and line number references
- [ ] Explains impact of each issue
- [ ] Offers specific recommendations
- [ ] Includes code examples of correct implementation
- [ ] Review comments are actionable

## Testing the AI Agent

### Option 1: Manual Review Simulation

1. Take each test case above
2. Feed it to the AI agent (with the pr-review-agent.md prompt)
3. Compare AI output with expected review
4. Verify all issues are caught and correctly categorized

### Option 2: Automated Test Suite

Create a test suite that:
1. Generates mock PRs with known violations
2. Runs AI agent review
3. Validates findings match expected results
4. Calculates detection rate (true positives, false positives)

### Option 3: Real PR Testing

1. Select recent merged PRs
2. Run AI agent review
3. Compare with actual human review
4. Identify gaps and improve agent prompt

## Success Criteria

The AI agent is working correctly if it:

✅ Catches 100% of CRITICAL security issues
✅ Catches 90%+ of authContext violations  
✅ Catches 80%+ of WARNING-level issues
✅ Has < 10% false positive rate
✅ Provides actionable recommendations
✅ Uses consistent severity levels
✅ Includes code examples in feedback

## Continuous Improvement

To improve the AI agent over time:

1. **Collect Feedback**: Track false positives/negatives
2. **Update Rules**: Add new patterns as they're discovered
3. **Refine Examples**: Improve code examples in prompt
4. **Test Regularly**: Run validation tests after changes
5. **Document Changes**: Keep version history

## Related Files

- **Agent Prompt**: `.github/agents/pr-review-agent.md`
- **Quick Reference**: `.github/agents/authcontext-rules-quick-reference.md`
- **Agent README**: `.github/agents/README.md`
- **Example Workflow**: `.github/workflows/ai-pr-review.yml.example`

---

**Last Updated**: 2025-10-18
**Status**: Ready for testing and validation
