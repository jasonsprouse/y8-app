# AI Agents Configuration

This directory contains AI agent prompts and configurations for automated code review and quality assurance in the Y8 App project.

## Available Agents

### PR Review Agent

**File**: `pr-review-agent.md`

**Purpose**: Automated PR review focusing on:
- authContext conformance
- Security vulnerability detection
- Anti-pattern identification

**Usage**: This agent prompt is used by AI code review systems to analyze pull requests before merging.

## How It Works

### For AI Review Systems

The PR review agent prompt provides comprehensive guidelines for reviewing code changes, including:

1. **authContext Rules** - Ensures all authentication logic follows the centralized AuthContext pattern
2. **Security Checklist** - Identifies vulnerabilities like auth bypass, data exposure, and injection attacks
3. **Anti-Pattern Detection** - Flags code quality issues and React/Next.js anti-patterns
4. **Review Process** - Step-by-step methodology for thorough code review

### Integration

This agent can be integrated with:
- GitHub Copilot Workspace
- Custom AI code review tools
- Manual code review processes (use as checklist)

### Review Severity Levels

- ❌ **CRITICAL**: Must be fixed before merging (security vulnerabilities, auth bypass)
- ⚠️ **WARNING**: Should be fixed but not blocking (code quality, minor issues)
- ℹ️ **INFO**: Suggestions for improvement (optimization, best practices)

## Quick Start

### For Reviewers

When reviewing a PR:

1. Read the PR description and understand the changes
2. Review the diff against the authContext rules in `pr-review-agent.md`
3. Check all items in the security checklist
4. Look for anti-patterns and code quality issues
5. Provide feedback using the severity levels and comment format

### For AI Systems

Pass the following to the AI review system:
- **System Prompt**: Content of `pr-review-agent.md`
- **User Input**: PR diff + description
- **Output Format**: Review comments with severity, location, issue, impact, and recommendation

## authContext Overview

The Y8 App uses a centralized authentication context with these key principles:

### Core Rules

1. **Single Source of Truth**: All auth state managed through `AuthContext`
2. **Approved Methods**: OAuth (Google, Discord), Web3 (Ethereum, WebAuthn), OTP (Stytch)
3. **Route Protection**: Public routes (`/`, `/auth/*`) vs Protected routes (`/space`, etc.)
4. **Redirect Logic**: Automatic redirects after successful login
5. **Session Management**: localStorage-based with specific key names

### Common Violations

| Violation | Why It's Wrong | Correct Approach |
|-----------|---------------|------------------|
| Custom auth state | Bypasses centralized auth | Use `useAuth()` hook |
| Direct localStorage writes | Inconsistent state | Use authContext methods |
| Hardcoded auth paths | Breaks with query params | Use `pathname.startsWith('/auth')` |
| Missing auth checks | Security vulnerability | Use RouteGuard or check `isAuthenticated` |

## Security Focus Areas

The PR review agent specifically checks for:

### Authentication & Authorization
- Auth bypass attempts
- Privilege escalation
- Missing permission checks
- Client-side-only authorization

### Data Protection
- Hardcoded credentials
- Sensitive data in logs
- Data exposure in errors
- Insecure storage

### Input Validation
- XSS vulnerabilities
- Injection attacks
- Unvalidated user input

### Session Security
- Session fixation
- Missing session expiration
- Insecure session storage

## Example Review

### ❌ Critical Issue Found

```markdown
❌ **CRITICAL - Authentication Bypass**

**File**: `components/SecretPage.tsx` (line 15)

**Issue**: Protected content rendered without authentication check

**Code**:
\`\`\`typescript
export default function SecretPage() {
  return <div>Secret content</div>; // ❌ No auth check
}
\`\`\`

**Impact**: Any unauthenticated user can access protected content by directly navigating to the route.

**Recommendation**: Add authentication check using authContext

**Correct Implementation**:
\`\`\`typescript
import { useAuth } from '@/context/AuthContext';

export default function SecretPage() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null; // RouteGuard will redirect
  
  return <div>Secret content</div>;
}
\`\`\`
```

### ⚠️ Warning Found

```markdown
⚠️ **WARNING - Code Quality**

**File**: `components/Login.tsx` (line 42)

**Issue**: Hardcoded auth callback paths

**Code**:
\`\`\`typescript
const authPaths = ['/auth/callback/google', '/auth/callback/discord'];
\`\`\`

**Impact**: Breaks with query parameters, not scalable for new providers

**Recommendation**: Use dynamic path matching

**Correct Implementation**:
\`\`\`typescript
const isAuthPath = pathname.startsWith('/auth');
\`\`\`
```

## Maintenance

### Updating the Agent

When updating `pr-review-agent.md`:

1. Ensure all authContext rules reflect current implementation
2. Add new security vulnerabilities as they're discovered
3. Update examples to match actual code patterns
4. Test the prompt with sample PRs
5. Document any changes in version history

### Version History

- **v1.0.0** (Current): Initial PR review agent with authContext conformance and security checks

## Contributing

When contributing to agent configurations:

1. Follow the existing format and structure
2. Provide clear examples for each rule
3. Test the agent with real PR scenarios
4. Update this README if adding new agents

## Support

For questions or issues with the AI agents:

1. Review the agent documentation
2. Check the authContext implementation in `context/AuthContext.tsx`
3. Refer to `AUTH_README.md` and `AUTH_FIXES_SUMMARY.md` for context
4. Open an issue if you find errors or have suggestions

---

**Last Updated**: 2025-10-18
**Maintainer**: Y8 App Development Team
