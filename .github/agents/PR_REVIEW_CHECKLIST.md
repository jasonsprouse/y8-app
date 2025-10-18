# PR Review Checklist Template

Use this checklist when reviewing PRs to ensure authContext conformance and security.

---

## PR Information

- **PR Number**: #___
- **Author**: @___
- **Title**: ___
- **Description**: ___
- **Files Changed**: ___ files
- **Lines Changed**: +___ / -___

---

## 1. authContext Conformance Review

### Authentication State Management

- [ ] All auth state managed through `AuthContext` (no custom state)
- [ ] Uses `useAuth()` hook for authentication operations
- [ ] No direct localStorage manipulation outside `AuthContext`
- [ ] localStorage keys match: `lit-auth-method`, `lit-pkp`, `lit-session-sigs`

**Issues Found:**
```
(List any issues here)
```

---

### Route Protection

- [ ] Protected routes check `isAuthenticated`
- [ ] Public routes correctly identified (`/`, `/auth/*`)
- [ ] Uses dynamic auth path matching (`pathname.startsWith('/auth')`)
- [ ] No hardcoded auth callback paths
- [ ] `RouteGuard` component used correctly

**Issues Found:**
```
(List any issues here)
```

---

### Redirect Logic

- [ ] Redirects to `/space` after successful login
- [ ] OAuth callbacks don't create double-redirects
- [ ] Uses `shouldRedirect` parameter correctly in `updateSession()`
- [ ] Logout redirects to `/`
- [ ] No open redirect vulnerabilities

**Issues Found:**
```
(List any issues here)
```

---

### Authentication Methods

- [ ] Uses approved auth methods (Google, Discord, WebAuthn, Ethereum, Stytch)
- [ ] New auth methods added to `AuthContext` (not standalone)
- [ ] OAuth methods check for callback page
- [ ] Proper error handling for auth failures

**Issues Found:**
```
(List any issues here)
```

---

### Session Management

- [ ] `updateSession()` called with all required parameters
- [ ] Session signatures obtained via `getSessionSigs()`
- [ ] All state saved to localStorage
- [ ] Logout clears all localStorage keys
- [ ] Session persistence works on page reload

**Issues Found:**
```
(List any issues here)
```

---

### Multiple PKP Handling

- [ ] Handles 0 PKPs (mints new one)
- [ ] Handles 1 PKP (auto-selects)
- [ ] Handles multiple PKPs (prompts user to select)
- [ ] `pendingPkpSelection` state managed correctly
- [ ] `setPKP()` method works properly

**Issues Found:**
```
(List any issues here)
```

---

## 2. Security Review

### Authentication & Authorization

- [ ] No authentication bypass vulnerabilities
- [ ] No privilege escalation possible
- [ ] Backend validates permissions (not just client-side)
- [ ] Proper session validation

**Vulnerabilities Found:**
```
(List any vulnerabilities here)
```

---

### Data Protection

- [ ] No hardcoded credentials or API keys
- [ ] No sensitive data in logs or error messages
- [ ] Sensitive data not stored insecurely
- [ ] No secrets in source code or environment files (that get committed)

**Vulnerabilities Found:**
```
(List any vulnerabilities here)
```

---

### Input Validation

- [ ] User input is validated and sanitized
- [ ] No XSS vulnerabilities
- [ ] No SQL/NoSQL injection vulnerabilities
- [ ] No command injection vulnerabilities

**Vulnerabilities Found:**
```
(List any vulnerabilities here)
```

---

### OAuth Security

- [ ] CSRF protection in OAuth flows
- [ ] OAuth state parameter validated
- [ ] No open redirects in callbacks
- [ ] Redirect URIs are secure
- [ ] OAuth tokens not exposed in logs

**Vulnerabilities Found:**
```
(List any vulnerabilities here)
```

---

### Session Security

- [ ] Sessions have appropriate expiration
- [ ] Sessions invalidated on logout
- [ ] No session fixation vulnerabilities
- [ ] Session tokens stored securely

**Vulnerabilities Found:**
```
(List any vulnerabilities here)
```

---

### Cryptography

- [ ] Uses strong, modern encryption algorithms
- [ ] No hardcoded encryption keys
- [ ] Uses established crypto libraries (not custom crypto)
- [ ] Private keys not exposed
- [ ] Secure random number generation

**Vulnerabilities Found:**
```
(List any vulnerabilities here)
```

---

### Dependencies

- [ ] New dependencies justified
- [ ] Dependencies are up-to-date
- [ ] No known vulnerabilities in dependencies (`npm audit`)
- [ ] Minimal dependency footprint

**Issues Found:**
```
(List any issues here)
```

---

### API Security

- [ ] API endpoints require authentication
- [ ] Rate limiting on sensitive endpoints (if applicable)
- [ ] API responses validated before use
- [ ] CORS configured correctly

**Vulnerabilities Found:**
```
(List any vulnerabilities here)
```

---

### Error Handling

- [ ] No stack traces exposed to users
- [ ] Errors handled gracefully
- [ ] No sensitive data in error messages
- [ ] Appropriate logging (not excessive)

**Issues Found:**
```
(List any issues here)
```

---

## 3. Code Quality Review

### Code Structure

- [ ] No code duplication (DRY principle followed)
- [ ] Appropriate complexity (not overly complex)
- [ ] Proper error handling
- [ ] No dead or unreachable code
- [ ] No commented-out code (unless explained)

**Issues Found:**
```
(List any issues here)
```

---

### React/Next.js Patterns

- [ ] Hooks used correctly (no conditional hooks)
- [ ] Hook dependencies correct (useEffect, useCallback, etc.)
- [ ] No unnecessary re-renders
- [ ] Appropriate use of React.memo/useMemo
- [ ] Server/client components used correctly

**Issues Found:**
```
(List any issues here)
```

---

### TypeScript

- [ ] Proper TypeScript types (minimal use of `any`)
- [ ] Type assertions justified
- [ ] No TypeScript errors suppressed without explanation
- [ ] Interfaces/types well-defined

**Issues Found:**
```
(List any issues here)
```

---

### Testing

- [ ] Tests included for new features (if applicable)
- [ ] Tests pass locally
- [ ] Edge cases considered
- [ ] Tests follow existing patterns

**Issues Found:**
```
(List any issues here)
```

---

## 4. Performance Review

- [ ] No performance regressions
- [ ] Appropriate use of memoization
- [ ] Efficient state updates
- [ ] Bundle size impact acceptable
- [ ] Lazy loading used where appropriate

**Issues Found:**
```
(List any issues here)
```

---

## 5. Documentation Review

- [ ] Code is self-documenting or has comments
- [ ] README updated (if needed)
- [ ] API changes documented
- [ ] Breaking changes clearly noted

**Issues Found:**
```
(List any issues here)
```

---

## Review Summary

### Critical Issues (Must Fix) ❌
Total: ___

1. 
2. 
3. 

### Warnings (Should Fix) ⚠️
Total: ___

1. 
2. 
3. 

### Suggestions (Nice to Have) ℹ️
Total: ___

1. 
2. 
3. 

---

## Review Decision

**Select one:**

- [ ] ✅ **APPROVE** - No critical issues, ready to merge
- [ ] ⚠️ **APPROVE WITH COMMENTS** - Minor issues only, can merge with follow-up
- [ ] ❌ **REQUEST CHANGES** - Critical issues must be fixed before merge
- [ ] 🤔 **NEEDS MORE INFO** - Questions for the author

---

## Additional Comments

```
(Any additional feedback, suggestions, or questions)
```

---

## Resources Referenced

- [ ] `.github/agents/pr-review-agent.md` - Full review guidelines
- [ ] `.github/agents/authcontext-rules-quick-reference.md` - Quick reference
- [ ] `context/AuthContext.tsx` - Implementation reference
- [ ] `AUTH_README.md` - Authentication documentation
- [ ] `AUTH_FIXES_SUMMARY.md` - Recent auth changes

---

**Reviewer**: @___
**Review Date**: ___
**Time Spent**: ___ minutes

---

## Post-Review Actions

- [ ] Add comments to PR
- [ ] Request changes if needed
- [ ] Approve if ready
- [ ] Notify author
- [ ] Update issue tracker (if applicable)

---

**Checklist Version**: 1.0.0
**Last Updated**: 2025-10-18
